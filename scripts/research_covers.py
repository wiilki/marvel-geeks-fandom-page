#!/usr/bin/env python3
"""One-off bounded research to match original editorial comics with real issue covers.

Run only on PR to verify exact title/year/issue, never guess from a fuzzy title.
Print JSON lines for human-reviewed, deterministic frontend mapping. No keys.
"""
import json
import re
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

source=Path("src/catalog.js").read_text()
comics=source.split("export const comics = [",1)[1].split("];",1)[0]
rows=[{"slug":m.group(1),"title":m.group(2),"year":int(m.group(3))}
      for m in re.finditer(r'\{id:"([^"]+)",title:"([^"]+)",year:(\d+)',comics)]
assert len(rows)==24,len(rows)
BASE="https://marvel.emreparker.com/v1"
HEADERS={"Accept":"application/json","User-Agent":"MarvelGeeksFansiteCoverResearch/1.0"}
last=0
def get(path,params={}):
    global last
    wait=max(0,1.25-(time.monotonic()-last))
    if wait: time.sleep(wait)
    url=BASE+path+("?"+urlencode(params) if params else "")
    last=time.monotonic()
    try:
        with urlopen(Request(url,headers=HEADERS),timeout=20) as r:
            assert r.status==200,(url,r.status)
            return json.load(r)
    except Exception as e:
        print("WARNING request",url,type(e).__name__,str(e)[:120],flush=True)
        return {}
def norm(text):
    text=text.lower().replace("the new mutants","new mutants")
    text=re.sub(r'\((?:19|20)\d\d(?:\s*-\s*(?:19|20)\d\d)?\)',"",text)
    text=text.replace("the vision","vision").replace("the incredible hulk","incredible hulk")
    text=re.sub(r'\bthe\b',"",text)
    return re.sub(r'[^a-z0-9]+',"",text)
def base_title(name):
    return re.sub(r'\s*(?:\((?:19|20)\d\d\))?\s*#\d+.*$',"",name).strip()
def number(text):
    m=re.search(r'#\s*(\d+)',text)
    return int(m.group(1)) if m else None
def decide(original,items):
    original_title=original["title"]
    base=norm(base_title(original_title))
    expected=number(original_title) or 1
    matches=[]
    for item in items:
        title=item.get("title","")
        parsed=number(title)
        if parsed != expected: continue
        same=norm(base_title(title))==base
        close=norm(base_title(title)).endswith(base) or base.endswith(norm(base_title(title)))
        if not (same or close): continue
        year=int(str(item.get("yearPage") or item.get("onSaleDate") or "0")[:4] or 0)
        yearMatch=year==original["year"]
        points=(2 if same else 0)+(4 if yearMatch else 0)
        matches.append((points,item))
    matches.sort(key=lambda pair:(-pair[0],pair[1].get("id",0)))
    if not matches or matches[0][0]<2:return None,[]
    if len(matches)>1 and matches[0][0]==matches[1][0]:
        return None,[{"id":i.get("id"),"title":i.get("title"),"year":i.get("yearPage")} for _,i in matches[:4]]
    return matches[0][1],[]
all_data=[]
for row in rows:
    title=row["title"]
    short=base_title(title)
    searches=[]
    for q in [title,short+" ("+str(row["year"])+")",short]:
        if q not in searches:searches.append(q)
    candidates=[]
    found=None
    notes=[]
    for q in searches:
        data=get("/search/issues",{"q":q,"limit":200})
        items=data.get("items",[])
        candidates+=items
        item,ambiguity=decide(row,candidates)
        if item:
            found=item
            break
        if ambiguity:notes=ambiguity
    if found:
        detail=get("/issues/"+str(found["id"]))
        cover=detail.get("cover") or {}
        path=cover.get("path","")
        ext=cover.get("extension","jpg")
        image=(path.removeprefix("http://").removeprefix("https://"))
        image=("https://"+image+"."+ext) if image.startswith("i.annihil.us/") and ext in ("jpg","jpeg","png","webp") else None
        output={**row,"id":found["id"],"apiTitle":found.get("title"),"apiYear":found.get("yearPage"),"cover":image,
                "official":detail.get("detailUrl"),"status":"matched"}
    else:
        output={**row,"status":"unmatched","candidates":notes,"searched":searches}
    all_data.append(output)
    print("COVER_EVIDENCE "+json.dumps(output,ensure_ascii=False),flush=True)
print("SUMMARY",json.dumps({"total":len(all_data),"matched":sum(x["status"]=="matched" for x in all_data),
     "with_image":sum(bool(x.get("cover")) for x in all_data)}),flush=True)
