/**
 * Original, hand-curated editorial context for the 66 starter entries.
 *
 * These notes intentionally stay readable without third-party APIs. The
 * optional movie/comic detail feed adds factual metadata only after a visitor
 * opens a dossier; no API is needed to understand who or what an entry is.
 * Keep comic continuity and MCU portrayals distinct.
 */
import {characters,comics,movies,findCharacter} from "./catalog.js";

const heroNotes = {
  "spider-man":"Peter Parker's appeal lies in the pressure of being a superhero while juggling school, work, relationships and responsibility. His stories move between everyday New York troubles and much larger crossover events.",
  "iron-man":"Tony Stark creates a succession of increasingly sophisticated suits, but his biggest battles often concern the consequences of his inventions. In the films, his transformation anchors the beginning of the interconnected MCU.",
  "captain-america":"Steve Rogers was an idealist before he became a super-soldier. His clash with changing institutions and changing eras gives his wartime origins a continuing relevance in modern Avengers stories.",
  "thor":"Marvel's Thor combines Norse mythology with cosmic superhero adventures. Questions of family, duty, power and worthiness follow him from Asgard to his adventures alongside the Avengers.",
  "hulk":"Bruce Banner and the Hulk embody a conflict between intellect, fear and overwhelming physical power. Some stories treat the Hulk as a destructive force; others explore him as a protector with an identity of his own.",
  "black-widow":"Natasha Romanoff's espionage history makes her an unusual Avenger: her strength comes from training, judgment and the relationships she builds. Her redemption arc is a recurring theme across comics and film.",
  "black-panther":"The mantle of Black Panther is deeply connected to the nation of Wakanda, its people and the responsibilities of leadership. Stories blend advanced technology, cultural tradition and difficult political choices.",
  "doctor-strange":"Stephen Strange's journey from surgeon to sorcerer opens the door to magical dimensions and supernatural threats. His stories often hinge on the cost of protecting reality rather than on physical strength.",
  "scarlet-witch":"Wanda Maximoff's connection to magic and reality alteration has made her central to some of Marvel's most consequential stories. Her portrayal varies between comics continuity and the screen adaptations.",
  "loki":"Loki is more than a straightforward villain: shifting loyalties, rivalry with Thor and a search for identity drive many of his appearances. His cunning and illusions often matter more than a direct fight.",
  "wolverine":"Logan's healing factor and adamantium claws make him formidable, but his most memorable stories examine memory, trauma and the struggle to remain humane. His path has crossed many X-Men eras and timelines.",
  "storm":"Ororo Munroe is a leader as well as a weather-controlling mutant. Her relationship with the X-Men connects global-scale power with the everyday work of protecting and guiding others.",
  "deadpool":"Wade Wilson combines mercenary action, regeneration and fourth-wall-breaking comedy. Despite the jokes, many stories also explore friendship, loneliness and what being a hero can mean for him.",
  "daredevil":"Matt Murdock balances law and vigilantism in New York's Hell's Kitchen. The tension between justice, faith, violence and personal loyalty gives his street-level stories their distinct character.",
  "captain-marvel":"Carol Danvers' career takes her from military aviation into interstellar conflicts. Her adventures sit at the intersection of Earth's heroes and the wider Marvel cosmic universe.",
  "star-lord":"Peter Quill is often an imperfect leader, but the Guardians of the Galaxy work because their unlikely members become a family. Humor, mistakes and sacrifice are central to his spacefaring stories.",
  "gamora":"Gamora's past as a trained fighter shapes her complicated relationships and determination to make her own choices. She brings both battlefield skill and emotional stakes to cosmic adventures.",
  "groot":"Groot's simple vocabulary disguises a character defined by empathy and loyalty. His ability to grow, regenerate and reshape his body also makes him an important member of the Guardians.",
  "ant-man":"Scott Lang brings a small-scale, family-driven perspective to superhero stories. His size-changing technology enables unusual heists and clever fights rather than straightforward contests of strength.",
  "wasp":"This profile follows Hope van Dyne's MCU version of the Wasp. Her technical skill, combat training and partnership with Scott Lang differ in background from Janet van Dyne's original comic-book Wasp.",
  "moon-knight":"Marc Spector's adventures combine detective work, street-level vigilantism and Egyptian mythology. Different comics and screen stories approach his identities and relationship to Khonshu in distinct ways.",
  "ms-marvel":"Kamala Khan is a young superhero and fan who must decide what heroism means on her own terms. The comic and MCU versions differ in their powers, so story details should be read in their respective continuities.",
  "shang-chi":"Shang-Chi's defining skill is mastery of martial arts, while his stories repeatedly return to family, agency and the legacy of his upbringing. Screen adaptations add their own supernatural and Ten Rings elements.",
  "magneto":"Erik Lehnsherr's experiences inform a militant vision of mutant survival that often conflicts with Professor X. His complicated roles as adversary, ally and leader are central to X-Men history."
};
const comicNotes = {
  "amazing-fantasy-15":"The issue introduces Peter Parker and the moral lesson that defines Spider-Man's adventures. It's a natural starting point before exploring later New York stories or multiverse crossovers.",
  "tales-of-suspense-39":"Tony Stark's original armored identity emerges from captivity and invention. The character and his technology evolve dramatically over the following decades.",
  "captain-america-1":"Captain America's debut belongs to the Golden Age of superhero comics and its World War II setting. Later stories build on Steve Rogers' transition into an unfamiliar modern era.",
  "journey-into-mystery-83":"This Silver Age issue brings Thor into Marvel's superhero universe. It's a foundation for his later adventures with Asgard, Loki and the Avengers.",
  "incredible-hulk-1":"Bruce Banner's gamma-ray accident and his transformation establish the central tension of the Hulk. Subsequent writers have interpreted that conflict in different ways.",
  "fantastic-four-52":"This landmark Fantastic Four adventure introduces the Black Panther and Wakanda. It's the starting point for generations of stories about the nation's technology, traditions and leadership.",
  "strange-tales-110":"Doctor Strange's first appearance marks the beginning of Marvel's mystical storytelling. Readers will recognize many ideas that become important in later magical adventures.",
  "x-men-4":"An early X-Men issue featuring the Brotherhood of Evil Mutants, with Magneto and the Scarlet Witch. Their later histories are significantly more complicated than a single early appearance.",
  "giant-size-x-men-1":"This special helps launch a new international X-Men era with characters including Storm. Its line-up has a lasting influence on subsequent mutant teams and adventures.",
  "new-mutants-98":"Deadpool debuts in this New Mutants issue before growing into his own solo stories and an unusual kind of antihero. Early appearances show a different stage of the character's development.",
  "daredevil-1":"Matt Murdock's origin establishes the hero's unusual senses and dual life as a lawyer and vigilante. Later stories move further into the moral ambiguities of Hell's Kitchen.",
  "infinity-gauntlet":"This 1991 cosmic event revolves around Thanos, the Infinity Gems and an extraordinary threat to existence. The MCU's Infinity Saga is an adaptation, not a one-to-one retelling of the comics.",
  "civil-war":"The original comic event puts Iron Man and Captain America on opposite sides of a conflict over superhero oversight. Its central tension inspired, but differs from, the later film.",
  "house-of-m":"A reality-altering Marvel event closely tied to Wanda Maximoff and mutant continuity. It has important consequences for several X-Men storylines.",
  "old-man-logan":"This dystopian Wolverine storyline begins in Wolverine (2003) #66. The original 2008 arc is distinct from the later series that also uses the Old Man Logan name.",
  "ms-marvel-2014":"Kamala Khan's solo debut follows a young fan who takes up the Ms. Marvel identity. Her community, family and growing confidence are as important as her shapeshifting powers.",
  "moon-knight-2014":"A stylish modern entry point to Moon Knight, blending investigation and supernatural unease. His identity and interpretation can vary across creative teams.",
  "shang-chi-1":"This issue sits early in Shang-Chi's long-running martial-arts adventures under the Master of Kung Fu title. It predates many of the mystical elements emphasized in later adaptations.",
  "black-panther-2016":"A new run places Wakanda's stability and T'Challa's responsibilities as king under pressure. It's useful for readers interested in Black Panther beyond action scenes.",
  "thor-god-of-thunder":"The opening of a sweeping Thor story that connects different eras of the thunder god. Its scope emphasizes Marvel's mix of mythology and cosmic-scale adventure.",
  "guardians-2008":"A modern incarnation of the Guardians forms against dangerous cosmic threats. This is an important comics counterpart to the team that later became familiar to film audiences.",
  "secret-wars-2015":"The first issue opens a Marvel event dealing with a collapsing multiverse. It is distinct from the original 1980s Secret Wars series and should not be confused with any future film title.",
  "vision-2015":"Vision's attempt to build a family in a suburban setting becomes an unsettling character study. The story contrasts ordinary domestic life with the dangers of superhero existence.",
  "spider-verse":"Spider-heroes from alternate realities unite against a shared threat. It's a good entry point for readers interested in different interpretations of the Spider-Man mantle."
};
const filmNotes = {
  "iron-man-2008":"The first film in the Marvel Cinematic Universe introduces its approach to interconnected storytelling and technological superheroism. Tony Stark's choices establish themes revisited throughout the franchise.",
  "avengers-2012":"A major MCU crossover brings characters from several earlier solo films into one team. Their clashing personalities matter just as much as the external threat.",
  "winter-soldier":"This Captain America sequel mixes superhero action with espionage and institutional distrust. Natasha Romanoff and Steve Rogers form an important on-screen partnership.",
  "guardians-2014":"The film establishes a comic, music-filled tone for the MCU's cosmic adventures. Its central relationship is the found family formed by a group of reluctant allies.",
  "ant-man-2015":"A superhero heist built around Scott Lang and experimental shrinking technology. The film sets up the family and scientific relationships that continue in later Ant-Man stories.",
  "civil-war-film":"The Avengers fracture over political and personal disagreements about accountability. This adaptation uses a different storyline and cast from the original comic event.",
  "doctor-strange-film":"Stephen Strange's origin introduces mystical training and dimensions to the MCU. It broadens the franchise beyond science fiction and conventional superhero action.",
  "homecoming":"Peter Parker's first solo MCU film places high-school challenges beside neighborhood-scale heroism. Tony Stark's influence raises questions about mentorship and independence.",
  "black-panther-film":"Wakanda becomes the center of a story about isolation, leadership, family and responsibility. The setting and its conflicts give the film a distinctive perspective in the MCU.",
  "infinity-war":"A large ensemble story brings Earth-based and cosmic heroes into the same confrontation. It functions as a major turning point for several overlapping MCU storylines.",
  "endgame":"The film follows surviving heroes responding to the events of Infinity War. It brings long-running character arcs toward a conclusion while opening paths for newer MCU stories.",
  "captain-marvel-film":"Carol Danvers' origin expands the MCU's cosmic history and explores questions of memory and identity. The film's setting predates many of the other main MCU adventures.",
  "shang-chi-film":"Martial-arts action and family conflict shape an origin story connected to the Ten Rings. It introduces another set of relationships and traditions to the MCU.",
  "no-way-home":"Peter Parker faces consequences that reach beyond his own world. The story uses the multiverse to examine identity, responsibility and the cost of being Spider-Man.",
  "multiverse-of-madness":"Doctor Strange encounters alternate realities and the danger of powerful magic. Wanda Maximoff plays a central role in a story connected to earlier MCU events.",
  "wakanda-forever":"Wakanda responds to grief, a changing world and a new international threat. The film shifts attention to the people and obligations surrounding the Black Panther mantle.",
  "guardians-vol-3":"The Guardians face a deeply personal crisis. The film emphasizes the team's loyalty and the complicated histories beneath its humor.",
  "deadpool-wolverine":"The film combines Deadpool's irreverence with Wolverine's darker personality and a multiverse setting. Its characters come from distinct on-screen Marvel continuities."
};

export const dossierNotes = Object.freeze({
  characters:Object.freeze(heroNotes),
  comics:Object.freeze(comicNotes),
  movies:Object.freeze(filmNotes)
});

/** Concise, existing-data facts to show without opening a modal. */
export function cardHighlights(item) {
  if (!item || typeof item!=="object") return [];
  if (item.type==="characters") return [
    item.alias && item.alias!==item.title ? item.alias : null,
    item.first || null
  ].filter(Boolean);
  if (item.type==="comics") return [
    item.era ? item.era+" · "+item.year : String(item.year || ""),
    item.cast?.length ? "Featuring "+item.cast.slice(0,2).map(id=>findCharacter(id)?.name||id).join(" & ") : null
  ].filter(Boolean);
  if (item.type==="movies") return [
    item.director ? "Directed by "+item.director : null,
    item.cast?.length ? "Featuring "+item.cast.slice(0,2).map(id=>findCharacter(id)?.name||id).join(" & ") : null
  ].filter(Boolean);
  return [];
}

export function getDossierNote(item) {
  return item ? dossierNotes[item.type]?.[item.id] || "" : "";
}

/** Type-safe in-site navigation: never infer stories from title substrings. */
export function dossierConnections(item) {
  if (!item)return {characters:[],comics:[],movies:[]};
  if (item.type==="characters") {
    const relatedComics=comics.filter(x=>x.cast.includes(item.id)).map(x=>({...x,type:"comics"}));
    const relatedMovies=movies.filter(x=>x.cast.includes(item.id)).map(x=>({...x,type:"movies"}));
    return {characters:[],comics:relatedComics,movies:relatedMovies};
  }
  if (item.type!=="comics" && item.type!=="movies") return {characters:[],comics:[],movies:[]};
  const ids=new Set(item.cast || []);
  const relatedCharacters=characters.filter(x=>ids.has(x.id)).map(x=>({...x,type:"characters",title:x.name,summary:x.bio}));
  const overlap=x=>x.id!==item.id && x.cast.some(id=>ids.has(id));
  const relatedComics=comics.filter(overlap).slice(0,6).map(x=>({...x,type:"comics"}));
  const relatedMovies=movies.filter(overlap).slice(0,6).map(x=>({...x,type:"movies"}));
  return {characters:relatedCharacters,comics:relatedComics,movies:relatedMovies};
}

/** Small, reliable categories for accessible related-entry lists. */
export function dossierFacts(item) {
  if (!item)return [];
  if (item.type==="characters")return [
    ["Civilian identity",item.alias],
    ["Affiliation",item.team],
    ["First comic / screen appearance",item.first],
    ["Original archive links",String(dossierConnections(item).comics.length)+" comics · "+String(dossierConnections(item).movies.length)+" films"]
  ].filter(([,v])=>Boolean(v));
  if (item.type==="comics")return [
    ["Year",item.year],
    ["Publishing era",item.era],
    ["Featured characters",item.cast?.map(id=>findCharacter(id)?.name||id).join(", ")]
  ].filter(([,v])=>v!==null && v!==undefined && v!=="");
  if (item.type==="movies")return [
    ["Year",item.year],
    ["MCU grouping",item.phase],
    ["Director",item.director],
    ["Featured characters",item.cast?.map(id=>findCharacter(id)?.name||id).join(", ")]
  ].filter(([,v])=>v!==null && v!==undefined && v!=="");
  return [];
}
