import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile,stat} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {chromium} from "playwright";

const root=resolve(".");
const mimes={".js":"text/javascript",".css":"text/css",".html":"text/html",".svg":"image/svg+xml",".json":"application/json",".webmanifest":"application/manifest+json"};
const server=createServer(async(req,res)=>{
  let pathname;
  try{pathname=decodeURIComponent(new URL(req.url,"http://localhost").pathname);}
  catch{res.writeHead(400).end();return;}
  const path=resolve(root,"."+pathname+(pathname.endsWith("/")?"index.html":""));
  if(path!==root && !path.startsWith(root+sep)){res.writeHead(403).end();return;}
  try {
    if(!(await stat(path)).isFile())throw new Error("not a file");
    res.writeHead(200,{"Content-Type":mimes[extname(path)]||"application/octet-stream","Cache-Control":"no-store"});
    res.end(await readFile(path));
  }catch{res.writeHead(404).end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const base="http://127.0.0.1:"+server.address().port+"/";
const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
try{
  const page=await browser.newPage({viewport:{width:1365,height:900},reducedMotion:"reduce"});
  await page.goto(base,{waitUntil:"domcontentloaded"});
  const card=page.locator('#resultsGrid button[data-open="characters:iron-man"]');
  await card.waitFor({state:"visible"});
  assert.equal(await card.getAttribute("data-autoplay-scene"),"true");
  assert.match(await card.getAttribute("aria-label"),/play an official Marvel video/i);
  await card.click();
  const detail=page.locator("#detailDialog");
  assert.ok(await detail.evaluate(el=>el.open),"Character dossier should open");
  const frame=detail.locator('iframe[data-official-voice]');
  await frame.waitFor({state:"attached"});
  const url=await frame.getAttribute("src");
  assert.match(url,/^https:\/\/www\.youtube-nocookie\.com\/embed\/[a-zA-Z0-9_-]{11}\?/);
  assert.match(url,/[?&]autoplay=1/);
  assert.equal(await detail.locator("text=HEAR THE CHARACTER IN ACTION").count(),0);
  assert.equal(await detail.locator("text=Original movie or television performance").count(),0);
  assert.ok(await detail.locator('a.voice-preview-source').count()===1);
  const art=detail.locator(".dossier-layout > .cover-art--detail");
  const artBox=await art.boundingBox(),dialogBox=await detail.boundingBox();
  assert.ok(artBox&&dialogBox);
  assert.ok(artBox.y-dialogBox.y<70,"Desktop cover should be near the dialog top, not halfway down");
  assert.ok(artBox.height<700,"Desktop cover must not stretch to the height of the long text column");
  const boxStyle=await art.evaluate(el=>({
    height:parseFloat(getComputedStyle(el).height),
    minHeight:getComputedStyle(el).minHeight,
    objectPosition:getComputedStyle(el.querySelector("img")).objectPosition
  }));
  assert.ok(boxStyle.height>250 && boxStyle.height<700);
  assert.equal(boxStyle.minHeight,"0px");
  assert.match(boxStyle.objectPosition,/(?:top|0%)$/,"Browser may normalize center top to 50% 0%");
  const savedFrame=await frame.elementHandle();
  await detail.locator('[data-favorite="characters:iron-man"]').click();
  assert.ok(await savedFrame.evaluate(el=>el.isConnected),"Toggling save should not restart an active video");
  await detail.locator('button[data-open="movies:iron-man-2008"]').first().click();
  assert.equal(await detail.locator('iframe[data-official-voice]').count(),0,
    "Switching dossiers must remove the video player");
  const filmBox=await detail.locator(".dossier-layout > .cover-art--detail").boundingBox();
  assert.ok(filmBox.height<700,"Movies should use the same top-aligned cover");

  // Related-links navigation is not itself consent to playing a video.
  await detail.locator("button[data-dossier-back]").click();
  assert.ok(await detail.locator('button[data-voice-preview="iron-man"]').count()===1);
  assert.equal(await detail.locator('iframe[data-official-voice]').count(),0);
  await detail.locator('button[data-voice-preview="iron-man"]').click();
  await detail.locator('iframe[data-official-voice]').waitFor({state:"attached"});
  await page.keyboard.press("Escape");
  assert.equal(await detail.evaluate(el=>el.open),false);
  await detail.locator('iframe[data-official-voice]').waitFor({state:"detached",timeout:3000});

  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:"reduce"});
  await mobile.goto(base,{waitUntil:"domcontentloaded"});
  const mCard=mobile.locator('#resultsGrid button[data-open="characters:iron-man"]');
  await mCard.waitFor({state:"visible"});
  await mCard.click();
  const mDetail=mobile.locator("#detailDialog");
  const mArt=await mDetail.locator(".dossier-layout > .cover-art--detail").boundingBox();
  const mDialog=await mDetail.boundingBox();
  assert.ok(mArt && mDialog);
  assert.ok(mArt.y-mDialog.y<70,"Mobile cover appears immediately at top");
  assert.ok(mArt.height<=330 && mArt.height>=200,"Mobile cover has a short fixed frame");
  const mFrame=mDetail.locator('iframe[data-official-voice]');
  await mFrame.waitFor({state:"attached"});
  assert.ok((await mFrame.boundingBox()).height>=200,"Mobile visible player meets YouTube's minimum height");
  await mobile.close();
  await page.close();
  console.log("PASS: top-aligned covers, opt-in card autoplay, quiet back navigation, close cleanup, and mobile layout");
}finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
