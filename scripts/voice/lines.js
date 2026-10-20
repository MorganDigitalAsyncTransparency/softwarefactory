import { captionSpan } from '../../film/animation/caption.js';

// What the voice says differs from the caption only where reading the text aloud
// would sound wrong: the role colors are seen, not heard, and "CI/CD" is not "slash".
const SPOKEN = [[/\s*\([^)]*\)/g, ''], [/CI\/CD/g, 'CI CD']];

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
