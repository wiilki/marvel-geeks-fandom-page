/**
 * Plays only the official, unmodified video in YouTube's visible player.
 * Playback is initiated by a visitor action; no background/audio-only player.
 */
import {getCharacterVoicePreview,officialEmbedUrl} from "./character-voice-clips.js";

export function playOfficialVoiceVideo(detailBody,characterId,{doc=document}={}) {
  if (!detailBody || detailBody.dataset?.curatedKey!=="characters:"+characterId)return false;
  const clip=getCharacterVoicePreview(characterId);
  if (!clip)return false;
  const url=officialEmbedUrl(clip,{autoplay:true});
  if (!url)return false;
  const mount=detailBody.querySelector("[data-official-voice-mount]");
  if (!mount)return false;
  const iframe=doc.createElement("iframe");
  iframe.className="official-voice-player";
  iframe.dataset.officialVoice="true";
  iframe.title="Official Marvel Entertainment video: "+clip.title;
  iframe.src=url;
  iframe.allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen";
  iframe.referrerPolicy="strict-origin-when-cross-origin";
  iframe.allowFullscreen=true;
  iframe.setAttribute("loading","eager");
  mount.replaceChildren(iframe);
  return true;
}
export function stopOfficialVoiceVideo(detailBody) {
  if (!detailBody)return;
  for (const frame of detailBody.querySelectorAll("iframe[data-official-voice]")) {
    // Removing the player halts playback, including if the user closes with Esc.
    frame.remove();
  }
}
