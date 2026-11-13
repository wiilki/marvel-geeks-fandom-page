"""Verify original Ms. Marvel #1 2014 issue and cover via public Marvel metadata."""
import json
from urllib.request import Request,urlopen
url="https://marvel.emreparker.com/v1/issues/49089"
with urlopen(Request(url,headers={"Accept":"application/json","User-Agent":"MarvelGeeksCoverVerification/1.0"}),timeout=35) as r:
    assert r.status==200
    d=json.load(r)
assert d.get("id")==49089 and d.get("title")=="Ms. Marvel (2014) #1",(d.get("id"),d.get("title"))
assert int(d.get("yearPage") or 0)==2014,d.get("yearPage")
cover=d.get("cover") or {}
print("MS_MARVEL_COVER "+json.dumps({"id":d["id"],"title":d["title"],"year":d["yearPage"],"cover":cover}),flush=True)
