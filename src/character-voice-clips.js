/**
 * Curated, official Marvel Entertainment YouTube video scenes with dialogue.
 *
 * These are VIDEO previews, not licensed standalone voice audio files.
 * Never download, extract, cache, hide, or separate YouTube audio; always use
 * the visible official YouTube player after an explicit visitor click.
 *
 * To add another preview, confirm the exact video is published by Marvel
 * Entertainment (the verified official channel) and that its title/scene
 * actually fits this character. Clip availability and embeddability may change.
 * Character-specific mappings are intentionally sparse rather than speculative.
 */
const officialPreviews={
  "spider-man":{
    id:"GyQVFOTmSC0",
    title:"Spider-Man Meets Doctor Strange | Avengers: Infinity War | Official Clip",
    note:"Peter Parker meets Doctor Strange in a scene from Avengers: Infinity War."
  },
  "iron-man":{
    id:"fNj7ykvewGE",
    title:"Tony Stark and Nick Fury - The Avenger Initiative | Iron Man | Official Clip",
    note:"Tony Stark and Nick Fury speak in the first Iron Man film."
  },
  "captain-america":{
    id:"THJ1kTC6UFs",
    title:"Steve and Bucky Train Sequence | Captain America: The First Avenger | Official Clip",
    note:"Steve Rogers and Bucky Barnes in an official film scene."
  },
  "thor":{
    id:"mWWf8zgh5Dk",
    title:"Thor Meets the Guardians of the Galaxy | Avengers: Infinity War | Official Clip",
    note:"Thor meets Peter Quill and the Guardians in Avengers: Infinity War."
  },
  "star-lord":{
    id:"mWWf8zgh5Dk",
    title:"Thor Meets the Guardians of the Galaxy | Avengers: Infinity War | Official Clip",
    note:"Star-Lord and Thor trade words aboard the Guardians' ship."
  },
  "doctor-strange":{
    id:"TkG3XgOYgjQ",
    title:"Doctor Strange and Spider-Man's Pep Talk",
    note:"Doctor Strange and Spider-Man talk in an official Marvel video."
  },
  "scarlet-witch":{
    id:"SHMM4abUWfk",
    title:"Wanda Becomes the Scarlet Witch | WandaVision | Official Clip",
    note:"Wanda Maximoff speaks during a pivotal WandaVision moment."
  },
  "ant-man":{
    id:"hU-VBdjqudI",
    title:"Spider-Man and Team Iron Man Fight Ant-Man | Captain America: Civil War | Official Clip",
    note:"Scott Lang faces Spider-Man and Iron Man's allies in Civil War."
  },
  "daredevil":{
    id:"VbK6wCUADyY",
    title:"Matt Murdock Confronts Punisher | Daredevil: Born Again | Official Clip",
    note:"Matt Murdock and Frank Castle discuss their different approaches to justice."
  },
  "shang-chi":{
    id:"S4Mj6D0ubNk",
    title:"Shang-Chi Reunites with Ying Nan | Shang-Chi and The Legend of The Ten Rings | Official Clip",
    note:"Shang-Chi has an important conversation with Ying Nan."
  }
};

export const characterVoicePreviews=Object.freeze(
  Object.fromEntries(Object.entries(officialPreviews)
    .map(([id,entry])=>[id,Object.freeze({...entry,channel:"Marvel Entertainment"})]))
);

export function getCharacterVoicePreview(characterId){
  const clip=characterVoicePreviews[characterId];
  return clip && /^[a-zA-Z0-9_-]{11}$/.test(clip.id)?clip:null;
}
export function officialVideoUrl(clip) {
  if (!clip || !/^[a-zA-Z0-9_-]{11}$/.test(clip.id) ||
      clip.channel!=="Marvel Entertainment")return null;
  return "https://www.youtube.com/watch?v="+clip.id;
}
/** Visible YouTube iframe only. Set autoplay on explicit play-click, never on opening a card. */
export function officialEmbedUrl(clip,{autoplay=false}={}){
  if (!officialVideoUrl(clip))return null;
  return "https://www.youtube-nocookie.com/embed/"+clip.id+
    "?rel=0&playsinline=1"+(autoplay?"&autoplay=1":"");
}
