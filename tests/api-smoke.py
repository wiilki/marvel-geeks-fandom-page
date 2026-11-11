"""One small external smoke test on GitHub Actions (not in normal offline tests).

Validates public reachability, browser CORS, and response shapes. Does not fetch
comic contents, use keys, or copy the upstream database.
"""
import json
import urllib.request
import urllib.error
from urllib.parse import urlencode

BASE = "https://marvel.emreparker.com"
ORIGIN = "https://wiilki.github.io"
HEADERS = {"Origin": ORIGIN, "User-Agent": "MarvelGeeksWebsite/2.1 (non-commercial fan archive; API smoke test)", "Accept": "application/json"}

def fetch(path):
    req = urllib.request.Request(BASE + path,headers=HEADERS)
    with urllib.request.urlopen(req,timeout=25) as resp:
        assert resp.status == 200, f"HTTP {resp.status} at {path}"
        cors = resp.headers.get("Access-Control-Allow-Origin","")
        assert cors == "*" or cors == ORIGIN, f"Missing browser CORS header: {cors!r}"
        return json.loads(resp.read(800_000))

health = fetch("/v1/health")
assert isinstance(health,dict), "Invalid health response"
print("API health:",str(health)[:240])
search = fetch("/v1/search/issues?" + urlencode({"q":"Secret Wars","limit":3}))
assert isinstance(search.get("items"),list), "Missing search items array"
assert search["items"], "Expected known historical comic issues"
for item in search["items"]:
    assert isinstance(item.get("id"),int),item
    assert item.get("title"),item
print("API search:",len(search["items"]),"issues; example:",search["items"][0]["title"])
issue_id=search["items"][0]["id"]
detail = fetch(f"/v1/issues/{issue_id}")
assert detail.get("id")==issue_id and detail.get("title"), "Invalid issue detail response"
print("API detail:",detail["id"],detail["title"])
print("Live API / browser CORS smoke test passed.")
