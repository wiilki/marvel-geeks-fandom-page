/**
 * Verified portrait URLs from two free character sources:
 * - akabab/superhero-api (Marvel Comics characters)
 * - AugustoMarcelo/mcuapi (MCU screen portrayals)
 *
 * Explicit identity mapping avoids cross-character mixups for Wasp, Ant-Man,
 * Captain Marvel and MCU multiverse variants. External images are referenced
 * rather than copied. Artwork remains owned by its respective rights holders.
 */
import { safeImageUrl } from "./universe-api.js";

const comic = (id,slug) =>
  "https://cdn.jsdelivr.net/gh/akabab/superhero-api@0.3.0/api/images/md/" + id + "-" + slug + ".jpg";
const tmdb = file => "https://image.tmdb.org/t/p/w500/" + file;

// Source IDs and filenames were cross-checked against the providers' GitHub datasets.
export const characterPortraits = Object.freeze({
  "spider-man":     [comic(620,"spider-man"),        tmdb("xKBAaPIa1c7tzZD3Y0MhBLv4hPE.jpg")],
  "iron-man":       [comic(346,"iron-man"),          tmdb("5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg")],
  "captain-america":[comic(149,"captain-america"),  tmdb("3bOGNsHlrswhyW79uvIHH1V43JI.jpg")],
  "thor":           [tmdb("piQGdoIQOF3C1EI5cbYZLAW1gfj.jpg")],
  "hulk":           [comic(332,"hulk"),              tmdb("5GilHMOt5PAQh6rlUKZzGmaKEI7.jpg")],
  "black-widow":    [comic(107,"black-widow"),       tmdb("druW5adKddizHNSoPbI0q7Mvn0K.jpg")],
  "black-panther":  [comic(106,"black-panther"),     tmdb("nL16SKfyP1b7Hk6LsuWiqMfbdb8.jpg")],
  "doctor-strange": [comic(226,"doctor-strange"),   tmdb("wz3MRiMmoz6b5X3oSzMRC9nLxY1.jpg")],
  "scarlet-witch":  [comic(579,"scarlet-witch"),     tmdb("wIU675y4dofIDVuhaNWPizJNtep.jpg")],
  "loki":           [comic(414,"loki"),              tmdb("mclHxMm8aPlCPKptP67257F5GPo.jpg")],
  "wolverine":      [comic(717,"wolverine"),         tmdb("4Xujtewxqt6aU0Y81tsS9gkjizk.jpg")],
  "storm":          [comic(638,"storm")],
  "deadpool":       [tmdb("trzgptffGvAlAT6MEu01fz47cLW.jpg")],
  "daredevil":      [comic(201,"daredevil"),         tmdb("jBHDZ8MA4I7krNQx4IfqdfPfleD.jpg")],
  "captain-marvel": [tmdb("iqZ5uKJWbwSITCK4CqdlUHZTnXD.jpg")],
  "star-lord":      [comic(630,"star-lord"),         tmdb("cRH6HPAQ98PlOwwEvhYO4CM9lwu.jpg")],
  "gamora":         [comic(275,"gamora"),            tmdb("fCJuIn1PMUQtYdRRSnnoZeMJVWs.jpg")],
  "groot":          [comic(303,"groot"),             tmdb("nZdVry7lnUkE24PnXakok9okvL4.jpg")],
  "ant-man":        [tmdb("6jtwNOLKy0LdsRAKwZqgYMAfd5n.jpg")],
  "wasp":           [tmdb("zgztLIWTJZm3vjGU7ezhF8GXESJ.jpg")],
  "moon-knight":    [comic(470,"moon-knight"),       tmdb("dW5U5yrIIPmMjRThR9KT2xH6nTz.jpg")],
  "ms-marvel":      [tmdb("oBpOjLAH8heYNNJZN1Z5jVQhAKC.jpg")],
  "shang-chi":      [comic(587,"shang-chi"),         tmdb("cCx2OghLj9KN73oyRZe92i2p3Ih.jpg")],
  "magneto":        [comic(423,"magneto"),           tmdb("5cnnnpnJG6TiYUSS7qgJheUZgnv.jpg")]
});

/** Rejects URLs that do not use one of the known API image host/path patterns. */
export function portraitUrlsForCharacter(id) {
  return (characterPortraits[id] || []).map(safeImageUrl).filter(Boolean);
}
