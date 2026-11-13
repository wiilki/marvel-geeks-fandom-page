"""Small remote image sanity check for Marvel Geeks' public portraits.

Checks that representative *source URLs* still serve actual images without an
API key. Browser image tags don't require cross-origin fetch permission.
This is a PR-only check, not part of normal Pages publishing.
"""
from urllib.request import Request, urlopen
SAMPLES = {
    "Spider-Man comic": "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/620-spider-man.jpg",
    "Iron Man comic": "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/346-iron-man.jpg",
    "Storm comic": "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/638-storm.jpg",
    "Deadpool screen": "https://image.tmdb.org/t/p/w500/trzgptffGvAlAT6MEu01fz47cLW.jpg",
    "Hope van Dyne screen": "https://image.tmdb.org/t/p/w500/zgztLIWTJZm3vjGU7ezhF8GXESJ.jpg",
    "Carol Danvers screen": "https://image.tmdb.org/t/p/w500/iqZ5uKJWbwSITCK4CqdlUHZTnXD.jpg",
}
for label,url in SAMPLES.items():
    req = Request(url,headers={"User-Agent":"Mozilla/5.0 MarvelGeeksFanArchiveImageCheck/1.0","Accept":"image/jpeg,image/*"})
    with urlopen(req,timeout=22) as response:
        assert response.status==200,(label,response.status)
        content_type=response.headers.get("Content-Type","")
        assert content_type.startswith("image/"),(label,content_type)
        magic=response.read(32)
        assert magic.startswith(b"\xff\xd8\xff") or magic.startswith(b"\x89PNG"),(label,"not JPEG/PNG")
        print(label,"OK:",content_type)
print("All representative API portrait image endpoints passed.")
