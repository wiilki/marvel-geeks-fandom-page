"""PR-only smoke test for actual movie poster and comic cover endpoints.

Checks representative provider URLs serve JPEG/PNG bytes; does not scrape,
download full artwork to the repo, or assume rights to any Marvel images.
"""
from urllib.request import Request,urlopen
EXAMPLES={
"Iron Man movie poster":"https://res.cloudinary.com/augustomarcelo/image/upload/v1675206317/mcuapi/gallery/Movies/iron_man/posters/1.jpg",
"Deadpool Wolverine poster":"https://res.cloudinary.com/augustomarcelo/image/upload/v1723381548/mcuapi/gallery/Movies/deadpool_3/posters/3.jpg",
"Guardians Vol 3 poster":"https://res.cloudinary.com/augustomarcelo/image/upload/v1676543203/mcuapi/gallery/Movies/guardians_of_the_galaxy_vol_3/posters/3.jpg",
"Amazing Fantasy 1962 #15":"https://i.annihil.us/u/prod/marvel/i/mg/f/10/598363848588e.jpg",
"Infinity Gauntlet 1991 #1":"https://i.annihil.us/u/prod/marvel/i/mg/9/20/51f6911ce3cc3.jpg",
"Ms Marvel 2014 #1":"https://i.annihil.us/u/prod/marvel/i/mg/9/d0/52e6c3c8df654.jpg",
}
for label,url in EXAMPLES.items():
    req=Request(url,headers={"User-Agent":"Mozilla/5.0 MarvelGeeksFanArchiveImageCheck/1.0","Accept":"image/jpeg,image/png,image/*"})
    with urlopen(req,timeout=24) as r:
        assert r.status==200,(label,r.status)
        start=r.read(16)
        assert start.startswith(b"\xff\xd8\xff") or start.startswith(b"\x89PNG"),(label,"not JPEG/PNG",start[:12])
        print(label,"OK",r.headers.get("Content-Type"),flush=True)
print("Public poster and cover image smoke checks passed.")
