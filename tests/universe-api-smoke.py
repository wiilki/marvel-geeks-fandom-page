"""Public API availability + CORS smoke for Marvel Geeks (no credentials).

Shows whether live MCUAPI, its CDN mirror, and superhero catalog are usable from
GitHub Pages. Uses a tiny sample (plus full superhero JSON needed for filtering).
"""
import json
import urllib.request
import urllib.error
import time
ORIGIN="https://wiilki.github.io"
HEADERS={"Origin":ORIGIN,"User-Agent":"MarvelGeeks-Fan-Archive/2026 (+https://github.com/wiilki/marvel-geeks-fandom-page)","Accept":"application/json"}
def request(url):
    req=urllib.request.Request(url,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=35) as response:
        assert response.status==200,(url,response.status)
        cors=response.headers.get("Access-Control-Allow-Origin","")
        assert cors in ("*",ORIGIN),f"Missing browser CORS header at {url}: {cors!r}"
        return json.loads(response.read(7_000_000))
base="https://mcuapi.up.railway.app/api/v1"
movies=request(base+"/movies?page=1&limit=2")
assert isinstance(movies.get("data"),list) and movies["data"],"Missing movies collection"
assert movies["data"][0].get("title") and isinstance(movies["data"][0].get("id"),int)
print("MCUAPI movies:",movies.get("total"),"sample:",movies["data"][0]["title"])
chars=request(base+"/characters?page=1&limit=2")
assert isinstance(chars.get("data"),list) and chars["data"],"Missing character collection"
print("MCUAPI characters:",chars.get("total"),"sample:",chars["data"][0]["name"])
mirror="https://cdn.jsdelivr.net/gh/AugustoMarcelo/mcuapi@master/data"
static_movies=request(mirror+"/movies.json")
static_chars=request(mirror+"/characters.json")
assert isinstance(static_movies,list) and static_movies and isinstance(static_chars,list) and static_chars
print("MCU CDN fallback:",len(static_movies),"movies /",len(static_chars),"screen characters")
heroes=request("https://akabab.github.io/superhero-api/api/all.json")
assert isinstance(heroes,list) and len(heroes)>100
marvel=[x for x in heroes if x.get("biography",{}).get("publisher")=="Marvel Comics"]
assert len(marvel)>40,"Marvel comic character filter appears broken"
print("Superhero API:",len(heroes),"total characters,",len(marvel),"Marvel Comics characters")
print("All public movie/character API and browser CORS checks passed.")
