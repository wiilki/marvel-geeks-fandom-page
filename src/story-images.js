/** Movie poster metadata sourced from AugustoMarcelo/mcuapi public movie dataset.
 * These are linked external images, not files copied into this repository.
 * Marvel/Disney rights remain with their owners.
 */
import { safeImageUrl } from "./universe-api.js";
import { coverImageUrl } from "./marvel-api.js";

export const curatedMoviePosters = Object.freeze({
  "iron-man-2008": {
    "mcuId": 1,
    "title": "Iron Man",
    "year": 2008,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675206317/mcuapi/gallery/Movies/iron_man/posters/1.jpg"
  },
  "avengers-2012": {
    "mcuId": 6,
    "title": "The Avengers",
    "year": 2012,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675207189/mcuapi/gallery/Movies/the_avengers/posters/1.jpg"
  },
  "winter-soldier": {
    "mcuId": 9,
    "title": "Captain America: The Winter Soldier",
    "year": 2014,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675207589/mcuapi/gallery/Movies/captain_america_the_winter_soldier/posters/1.jpg"
  },
  "guardians-2014": {
    "mcuId": 10,
    "title": "Guardians of the Galaxy",
    "year": 2014,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675207727/mcuapi/gallery/Movies/guardians_of_the_galaxy/posters/1.jpg"
  },
  "ant-man-2015": {
    "mcuId": 12,
    "title": "Ant-Man",
    "year": 2015,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675207953/mcuapi/gallery/Movies/ant-man/posters/1.jpg"
  },
  "civil-war-film": {
    "mcuId": 13,
    "title": "Captain America: Civil War",
    "year": 2016,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675208047/mcuapi/gallery/Movies/captain_america_civil_war/posters/1.jpg"
  },
  "doctor-strange-film": {
    "mcuId": 14,
    "title": "Doctor Strange",
    "year": 2016,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675208132/mcuapi/gallery/Movies/doctor_strange/posters/1.jpg"
  },
  "homecoming": {
    "mcuId": 16,
    "title": "Spider-Man: Homecoming",
    "year": 2017,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675208337/mcuapi/gallery/Movies/spider-man_homecoming/posters/1.jpg"
  },
  "black-panther-film": {
    "mcuId": 18,
    "title": "Black Panther",
    "year": 2018,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675211435/mcuapi/gallery/Movies/black_panther/posters/1.jpg"
  },
  "infinity-war": {
    "mcuId": 19,
    "title": "Avengers: Infinity War",
    "year": 2018,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675211514/mcuapi/gallery/Movies/avengers_infinity_war/posters/1.jpg"
  },
  "endgame": {
    "mcuId": 22,
    "title": "Avengers: Endgame",
    "year": 2019,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675211808/mcuapi/gallery/Movies/avengers_endgame/posters/1.jpg"
  },
  "captain-marvel-film": {
    "mcuId": 21,
    "title": "Captain Marvel",
    "year": 2019,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675211712/mcuapi/gallery/Movies/captain_marvel/posters/1.jpg"
  },
  "shang-chi-film": {
    "mcuId": 25,
    "title": "Shang-Chi and The Legend of The Ten Rings",
    "year": 2021,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675212103/mcuapi/gallery/Movies/shang-chi_and_the_legends_of_the_ten_rings/posters/1.jpg"
  },
  "no-way-home": {
    "mcuId": 27,
    "title": "Spider-Man: No Way Home",
    "year": 2021,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675212281/mcuapi/gallery/Movies/spider-man_no_way_home/posters/1.jpg"
  },
  "multiverse-of-madness": {
    "mcuId": 28,
    "title": "Doctor Strange in the Multiverse of Madness",
    "year": 2022,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1675212381/mcuapi/gallery/Movies/doctor_strange_in_the_multiverse_of_madness/posters/2.jpg"
  },
  "wakanda-forever": {
    "mcuId": 30,
    "title": "Black Panther: Wakanda Forever",
    "year": 2022,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1665238515/mcuapi/gallery/Movies/black_panther_wakanda_forever/posters/3.jpg"
  },
  "guardians-vol-3": {
    "mcuId": 32,
    "title": "Guardians of the Galaxy Vol. 3",
    "year": 2023,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1676543203/mcuapi/gallery/Movies/guardians_of_the_galaxy_vol_3/posters/3.jpg"
  },
  "deadpool-wolverine": {
    "mcuId": 37,
    "title": "Deadpool & Wolverine",
    "year": 2024,
    "image": "https://res.cloudinary.com/augustomarcelo/image/upload/v1723381548/mcuapi/gallery/Movies/deadpool_3/posters/3.jpg"
  }
});

// Real comic issue cover artwork is selected only when the title and issue
// identity can be checked against the unofficial Marvel Metadata API.
export const curatedComicCovers = Object.freeze({
  "amazing-fantasy-15": {
    "apiId": 16926,
    "apiTitle": "Amazing Fantasy (1962) #15",
    "year": 1962,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/f/10/598363848588e",
      "extension": "jpg"
    }
  },
  "tales-of-suspense-39": {
    "apiId": 11280,
    "apiTitle": "Tales of Suspense (1959) #39",
    "year": 1963,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/9/b0/536d69b8ae3b4",
      "extension": "jpg"
    }
  },
  "captain-america-1": {
    "apiId": 7849,
    "apiTitle": "Captain America Comics (1941) #1",
    "year": 1941,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/3/a0/5991fa03329b7",
      "extension": "jpg"
    }
  },
  "journey-into-mystery-83": {
    "apiId": 9779,
    "apiTitle": "Journey Into Mystery (1952) #83",
    "year": 1962,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/2/80/5a83133fa0008",
      "extension": "jpg"
    }
  },
  "fantastic-four-52": {
    "apiId": 13258,
    "apiTitle": "Fantastic Four (1961) #52",
    "year": 1966,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/3/60/5372d7b815a17",
      "extension": "jpg"
    }
  },
  "strange-tales-110": {
    "apiId": 11029,
    "apiTitle": "Strange Tales (1951) #110",
    "year": 1963,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/8/c0/4bc480360bd1f",
      "extension": "jpg"
    }
  },
  "x-men-4": {
    "apiId": 12488,
    "apiTitle": "Uncanny X-Men (1963) #4",
    "year": 1964,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/d/60/589de3be4c9d8",
      "extension": "jpg"
    }
  },
  "giant-size-x-men-1": {
    "apiId": 8797,
    "apiTitle": "Giant-Size X-Men (1975) #1",
    "year": 1975,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/3/f0/5b314996e924c",
      "extension": "jpg"
    }
  },
  "daredevil-1": {
    "apiId": 8073,
    "apiTitle": "Daredevil (1964) #1",
    "year": 1964,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/7/10/51894efb25f92",
      "extension": "jpg"
    }
  },
  "civil-war": {
    "apiId": 4216,
    "apiTitle": "Civil War (2006) #1",
    "year": 2006,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/e/f0/511307b2f1200",
      "extension": "jpg"
    }
  },
  "house-of-m": {
    "apiId": 2092,
    "apiTitle": "House of M (2005) #1",
    "year": 2005,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/3/c0/589b3f23c9324",
      "extension": "jpg"
    }
  },
  "moon-knight-2014": {
    "apiId": 49077,
    "apiTitle": "Moon Knight (2014) #1",
    "year": 2014,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/2/80/530e4d1b02751",
      "extension": "jpg"
    }
  },
  "shang-chi-1": {
    "apiId": 67106,
    "apiTitle": "Master of Kung Fu (1974) #17",
    "year": 1974,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/6/d0/5abd4665788b2",
      "extension": "jpg"
    }
  },
  "black-panther-2016": {
    "apiId": 57382,
    "apiTitle": "Black Panther (2016) #1",
    "year": 2016,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/c/80/567065cfebad5",
      "extension": "jpg"
    }
  },
  "guardians-2008": {
    "apiId": 21268,
    "apiTitle": "Guardians of the Galaxy (2008) #1",
    "year": 2008,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/6/60/517ad3738f6a1",
      "extension": "jpg"
    }
  },
  "secret-wars-2015": {
    "apiId": 52447,
    "apiTitle": "Secret Wars (2015) #1",
    "year": 2015,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/c/70/5cb736a3cdd49",
      "extension": "jpg"
    }
  },
  "spider-verse": {
    "apiId": 50554,
    "apiTitle": "Spider-Verse (2014) #1",
    "year": 2014,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/8/a0/545d017cdbb04",
      "extension": "jpg"
    }
  },
  "incredible-hulk-1": {
    "apiId": 8906,
    "apiTitle": "Incredible Hulk (1962) #1",
    "year": 1962,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/9/a0/59933ea5b5c2e",
      "extension": "jpg"
    }
  },
  "new-mutants-98": {
    "apiId": 10441,
    "apiTitle": "New Mutants (1983) #98",
    "year": 1991,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/9/00/4c7d506d22f2b",
      "extension": "jpg"
    }
  },
  "infinity-gauntlet": {
    "apiId": 9286,
    "apiTitle": "Infinity Gauntlet (1991) #1",
    "year": 1991,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/9/20/51f6911ce3cc3",
      "extension": "jpg"
    }
  },
  "old-man-logan": {
    "apiId": 21330,
    "apiTitle": "Wolverine (2003) #66",
    "year": 2008,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/6/90/5899faf0241c2",
      "extension": "jpg"
    }
  },
  "thor-god-of-thunder": {
    "apiId": 44198,
    "apiTitle": "Thor: God of Thunder (2012) #1",
    "year": 2012,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/3/30/51646f6c2a712",
      "extension": "jpg"
    }
  },
  "vision-2015": {
    "apiId": 57306,
    "apiTitle": "Vision (2015) #1",
    "year": 2015,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/6/30/5637ada325f34",
      "extension": "jpg"
    }
  },
  "ms-marvel-2014": {
    "apiId": 49089,
    "apiTitle": "Ms. Marvel (2014) #1",
    "year": 2014,
    "cover": {
      "path": "https://i.annihil.us/u/prod/marvel/i/mg/9/d0/52e6c3c8df654",
      "extension": "jpg"
    }
  }
});

export function storyImageUrls(item) {
  if (item?.type === "movies") {
    const entry=curatedMoviePosters[item.id];
    return entry && entry.year===item.year ? [safeImageUrl(entry.image)].filter(Boolean) : [];
  }
  if (item?.type === "comics") {
    const entry=curatedComicCovers[item.id];
    return entry && entry.year===item.year ? [coverImageUrl(entry.cover)].filter(Boolean) : [];
  }
  return [];
}
