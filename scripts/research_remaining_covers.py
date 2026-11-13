"""Resolve the seven remaining curated comic covers without fuzzy mismatches.

An issue cover is used only if known year and number match the editorial entry.
"""
import json,re,time
from urllib.parse import urlencode
from urllib.request import Request,urlopen
BASE="https://marvel.emreparker.com/v1"
HEADERS={"Accept":"application/json","User-Agent":"MarvelGeeksFanArchive/IssueCoverResearch"}
specs={
"incredible-hulk-1":{"query":"Incredible Hulk","year":1962,"issue":1,"stem":"Incredible Hulk","known":8906},
"new-mutants-98":{"query":"New Mutants","year":1991,"issue":98,"stem":"New Mutants"},
"infinity-gauntlet":{"query":"Infinity Gauntlet","year":1991,"issue":1,"stem":"Infinity Gauntlet","known":9286},
"old-man-logan":{"query":None,"year":2008,"issue":66,"stem":"Wolverine","known":21330},
"ms-marvel-2014":{"query":"Ms. Marvel","year":2014,"issue":1,"stem":"Ms. Marvel"},
"thor-god-of-thunder":{"query":"God of Thunder","year":2012,"issue":1,"stem":"Thor: God of Thunder"},
"vision-2015":{"query":"Vision","year":2015,"issue":1,"stem":"Vision","known":57306}
}
def norm(x):return re.sub(r'[^a-z0-9]','',x.lower())
def get(path,params=None):
    url=BASE+path+("?"+urlencode(params) if params else "")
    try:
        with urlopen(Request(url,headers=HEADERS),timeout=25) as r:
            if r.status!=200:raise ValueError("status "+str(r.status))
            return json.load(r)
    except Exception as e:
        print("REMOTE_ERROR",url,str(e)[:130],flush=True)
        return {}
def accept(x,spec):
    title=x.get("title","")
    issue=str(x.get("issueNumber","")).strip()
    year=int(x.get("yearPage") or 0)
    title_clean=re.sub(r'\s*\((?:19|20)\d\d(?:\s*-\s*(?:19|20)\d\d)?\)\s*'," ",title).strip()
    title_clean=re.sub(r'\s*#\s*\d+.*$',"",title_clean).strip()
    return issue==str(spec["issue"]) and year==spec["year"] and norm(title_clean)==norm(spec["stem"])
for slug,spec in specs.items():
    matched=None
    if spec["query"]:
        data=get("/search/issues",{"q":spec["query"],"limit":200})
        matches=[x for x in data.get("items",[]) if accept(x,spec)]
        if len(matches)==1:matched=matches[0]
        elif len(matches)>1:print("AMBIGUOUS",slug,[(x.get("id"),x.get("title")) for x in matches[:6]],flush=True)
    if not matched and spec.get("known"):
        known=get("/issues/"+str(spec["known"]))
        if accept(known,spec):matched=known
    result={"slug":slug,"status":"unmatched"}
    if matched:
        detail=matched if matched.get("cover") else get("/issues/"+str(matched["id"]))
        cover=detail.get("cover") or {}
        path=cover.get("path") or ""
        ext=cover.get("extension") or ""
        if path.startswith(("http://i.annihil.us/","https://i.annihil.us/")) and ext in ("jpg","jpeg","webp","png"):
            image="https://"+path.split("://",1)[1]+"."+ext
        else:image=None
        result={"slug":slug,"status":"matched","id":matched["id"],"apiTitle":matched.get("title"),"year":spec["year"],"cover":image}
    print("FINAL_COVER_EVIDENCE "+json.dumps(result),flush=True)
    time.sleep(2)
