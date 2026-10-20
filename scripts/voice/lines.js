import { captionSpan } from '../../film/animation/caption.js';

// What the voice says, as the sound description sets out
// (film/script/visual-descriptions.md#sound).
const SPOKEN = [[/CI\/CD/g, 'CI CD']];

// One line for each scene with a caption: the words to speak and the seconds the
// caption is on screen, which the voice must not run over (R15).
export function voiceLines(scenes) {
  return scenes.filter((scene) => scene.caption).map((scene) => ({
    id: scene.id,
    text: spoken(scene.caption),
    seconds: shownSeconds(scene, scene === scenes.at(-1)),
  }));
}

export function spoken(caption) {
  return SPOKEN.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), caption);
}

function shownSeconds(scene, closing) {
  const span = captionSpan(scene.caption, scene.end - scene.start, closing);
  return span.end - span.start;
}
