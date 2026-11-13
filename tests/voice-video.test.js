import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {characters,comics,movies,allItems} from "../src/catalog.js";
import {characterVoicePreviews,getCharacterVoicePreview,officialVideoUrl,officialEmbedUrl} from "../src/character-voice-clips.js";
import {playOfficialVoiceVideo,stopOfficialVoiceVideo} from "../src/official-voice-player.js";
import {buildCuratedDossier} from "../src/dossier-view.js";

const repoFile=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
const art=()=>'<div class="cover-art">Art</div>';
const byId=(type,id)=>allItems.find(item=>item.type===type&&item.id===id);

test("only explicitly vetted, official-channel scene URLs are permitted",()=>{
  const ids=Object.keys(characterVoicePreviews);
  assert.equal(ids.length,10);
  const valid=new Set(characters.map(x=>x.id));
  for (const id of ids) {
    assert.ok(valid.has(id),"Unrecognized character "+id);
    const c=getCharacterVoicePreview(id);
    assert.ok(c);
    assert.equal(c.channel,"Marvel Entertainment");
    assert.match(c.id,/^[A-Za-z0-9_-]{11}$/);
    assert.ok(c.title.length>=24);
    assert.ok(c.note.length>=24);
    assert.equal(officialVideoUrl(c),"https://www.youtube.com/watch?v="+c.id);
    assert.equal(officialEmbedUrl(c),"https://www.youtube-nocookie.com/embed/"+c.id+"?rel=0&playsinline=1");
    assert.equal(officialEmbedUrl(c,{autoplay:true}),"https://www.youtube-nocookie.com/embed/"+c.id+"?rel=0&playsinline=1&autoplay=1");
  }
  assert.equal(getCharacterVoicePreview("wolverine"),null);
  assert.equal(getCharacterVoicePreview("not-a-character"),null);
  assert.equal(officialVideoUrl({id:"https://evil.test/a",channel:"Marvel Entertainment"}),null);
  assert.equal(officialEmbedUrl({id:"GyQVFOTmSC0",channel:"Impersonator"}),null);
});

test("only mapped character dossiers provide a compact official video player and fallback",()=>{
  for (const c of characters) {
    const html=buildCuratedDossier(byId("characters",c.id),{art});
    const has=!!getCharacterVoicePreview(c.id);
    assert.equal(html.includes('data-voice-preview="'+c.id+'"'),has,c.id);
    assert.equal(html.includes("HEAR THE CHARACTER IN ACTION"),false,c.id);
    assert.equal(html.includes("youtube-nocookie.com"),false,
      "The player is created after the user selects a clearly marked card");
    if(has){
      assert.ok(html.includes("Play official scene"));
      assert.ok(html.includes("Watch on YouTube"));
      assert.ok(html.includes("data-official-voice-mount"));
      assert.ok(!html.includes("voice-preview-legal"));
      assert.ok(!html.includes("voice-preview-heading"));
    }
  }
  for(const item of [...comics,...movies]){
    const html=buildCuratedDossier(byId("comics",item.id)||byId("movies",item.id),{art});
    assert.ok(!html.includes("data-voice-preview"));
  }
});

test("play control creates a visible official video iframe; stopping removes it",()=>{
  const added=[];
  const mount={replaceChildren(node){added.push(node);}};
  const frame={className:"",dataset:{},setAttribute(name,value){this[name]=value;},removed:false,
    remove(){this.removed=true}};
  const doc={createElement(tag){assert.equal(tag,"iframe");return frame;}};
  const body={
    dataset:{curatedKey:"characters:spider-man"},
    querySelector(selector){return selector==="[data-official-voice-mount]"?mount:null;},
    querySelectorAll(selector){assert.equal(selector,"iframe[data-official-voice]");return added;}
  };
  assert.equal(playOfficialVoiceVideo(body,"spider-man",{doc}),true);
  assert.equal(added.length,1);
  assert.equal(frame.className,"official-voice-player");
  assert.equal(frame.dataset.officialVoice,"true");
  assert.ok(frame.title.includes("Marvel Entertainment"));
  assert.ok(frame.src.startsWith("https://www.youtube-nocookie.com/embed/GyQVFOTmSC0?"));
  assert.ok(frame.src.includes("autoplay=1"),"Request autoplay on an explicit Open & Play click or the player button");
  assert.ok(frame.allow.includes("autoplay"));
  assert.equal(frame.allowFullscreen,true);
  stopOfficialVoiceVideo(body);
  assert.equal(frame.removed,true);
  const other={
    ...body,
    dataset:{curatedKey:"characters:iron-man"}
  };
  assert.equal(playOfficialVoiceVideo(other,"spider-man",{doc}),false,
    "A stale button cannot activate another character's scene");
});


test("opening a mapped card explicitly requests visible autoplay without another play click",()=>{
  const app=repoFile("src/app.js");
  const css=repoFile("styles.css");
  const dossier=repoFile("src/dossier-view.js");
  assert.ok(app.includes('data-autoplay-scene="true"'),
    "Only characters with official clips receive an autoplay-consent card");
  assert.ok(app.includes("OPEN & PLAY SCENE"));
  assert.ok(app.includes("VIDEO PLAYS ON OPEN"));
  assert.ok(app.includes("play an official Marvel video"));
  assert.ok(app.includes('autoPlayScene:target.dataset.autoplayScene==="true"'),
    "The user's card click must explicitly opt into playback");
  assert.ok(app.includes('if (autoPlayScene && item.type==="characters") playOfficialVoiceVideo(detailBody,item.id);'),
    "Insert iframe during the same user activation, after opening dialog");
  assert.ok(app.includes('if (button)button.textContent=state.favorites.has(key)'),
    "Saving a favorite should not restart or close a playing video");
  assert.ok(dossier.includes("Watch on YouTube"));
  assert.ok(!dossier.includes("HEAR THE CHARACTER IN ACTION"));
  assert.ok(!dossier.includes("Video and sound stay together"));
  assert.ok(!dossier.includes("Original movie or television performance"));
  assert.ok(!dossier.includes("voice-preview-title"));
  assert.ok(css.includes(".dossier-layout > .cover-art--detail"));
  assert.ok(css.includes("max-height:min(76dvh,680px)"));
  assert.ok(css.includes("height:auto"));
  assert.ok(css.includes("object-position:center top"));
  assert.ok(css.includes(".voice-preview-source"));
  assert.ok(css.includes("min-height:200px"));
});

test("content security and dialog shutdown prevent hidden audio",()=>{
  const html=repoFile("index.html");
  const app=repoFile("src/app.js");
  const css=repoFile("styles.css");
  const source=repoFile("src/official-voice-player.js");
  assert.match(html,/frame-src https:\/\/www\.youtube-nocookie\.com https:\/\/www\.youtube\.com/);
  assert.ok(app.includes("playOfficialVoiceVideo"));
  assert.ok(app.includes('target.hasAttribute("data-voice-preview")'));
  assert.ok(app.includes('stopOfficialVoiceVideo($("#detailBody"))'));
  assert.ok(app.includes("getCharacterVoicePreview(item.id)"));
  assert.ok(css.includes(".official-voice-player"));
  assert.ok(css.includes(".card-voice-marker"));
  assert.ok(source.includes("mount.replaceChildren(iframe)"));
  assert.ok(source.includes("frame.remove()"));
  assert.ok(!source.includes("new Audio("));
  assert.ok(!source.includes("speechSynthesis"));
});
