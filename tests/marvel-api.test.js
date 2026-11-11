import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeIssue, normalizeIssueList, normalizeSearchResults,
  officialComicUrl,coverImageUrl,searchIssues,fetchIssues,fetchIssueDetail,
  API_ORIGIN,PAGE_SIZE
} from "../src/marvel-api.js";

const sample = {
  id:52447,title:"Secret Wars (2015) #1",issueNumber:"1",
  detailUrl:"https://www.marvel.com/comics/issue/52447/secret_wars_2015_1",
  seriesId:18468,seriesName:"Secret Wars (2015 - 2016)",
  yearPage:2015,onSaleDate:"2015-05-06",
  description:"A universe-ending event.",pageCount:54,
  cover:{path:"http://i.annihil.us/u/prod/marvel/i/mg/1/20/test",extension:"jpg"},
  creators:[{id:11743,name:"Jonathan Hickman",role:"writer"}]
};

test("normalize detail and official links without changing IDs",() => {
  const x=normalizeIssue(sample);
  assert.equal(x.id,52447);
  assert.equal(x.title,sample.title);
  assert.equal(x.year,2015);
  assert.equal(x.seriesId,18468);
  assert.equal(x.creators[0].name,"Jonathan Hickman");
  assert.equal(x.image,"https://i.annihil.us/u/prod/marvel/i/mg/1/20/test.jpg");
  assert.equal(x.url,sample.detailUrl);
});
test("normalize list, reject broken entries and remove duplicates",() => {
  const list=normalizeIssueList({items:[sample,sample,{id:0,title:"Bad"},{id:12,title:"Hello"}],total:37526,has_next:true,offset:18});
  assert.equal(list.items.length,2);
  assert.equal(list.total,37526);
  assert.equal(list.hasNext,true);
  assert.equal(list.offset,18);
  const search=normalizeSearchResults({query:"wars",items:[sample],count:1});
  assert.equal(search.count,1);
  assert.throws(()=>normalizeIssueList({items:{}}),/unexpected response/);
});
test("reject untrusted external URLs and unsupported cover types",() => {
  assert.equal(officialComicUrl("https://evil.example/comics/issue/123"),null);
  assert.equal(officialComicUrl("javascript:alert(1)"),null);
  assert.equal(officialComicUrl("https://www.marvel.com.evil.example/comics/issue/123"),null);
  assert.equal(coverImageUrl({path:"https://example.com/foo",extension:"jpg"}),null);
  assert.equal(coverImageUrl({path:"http://i.annihil.us/abc",extension:"svg"}),null);
  assert.equal(normalizeIssue({id:"none",title:"Bad"}),null);
});
test("the hosted API routes use no credentials or secrets", async () => {
  const calls=[];
  const payload={items:[sample],count:1};
  const fetchStub=async (url,options) => {
    calls.push({url,options});
    return {ok:true,status:200,json:async()=>payload};
  };
  const originalFetch=globalThis.fetch;
  globalThis.fetch=fetchStub;
  try {
    const res=await searchIssues("Secret Wars");
    assert.equal(res.items.length,1);
    assert.equal(calls.length,1);
    assert.ok(calls[0].url.includes("/v1/search/issues?q=Secret+Wars&limit=60"));
    assert.equal(calls[0].options.credentials,"omit");
    assert.equal(calls[0].options.mode,"cors");
    assert.equal(calls[0].options.headers.Accept,"application/json");
  } finally { globalThis.fetch=originalFetch; }
  assert.ok(API_ORIGIN.startsWith("https://"));
  assert.equal(PAGE_SIZE,18);
});
