import { STAGES } from './story.js';

const ENDING_AFTER = 9;

// The words over the picture: the opening call to tap, the count, each stage's caption
// and the closing card.
export function createUi(document) {
  const find = (id) => document.getElementById(id);
  return { root: document.body, shipped: find('shipped'), stopped: find('stopped'), caption: find('caption'), lines: find('lines') };
}

export function showUi(ui, game, coding) {
  ui.root.dataset.started = game.started;
  ui.root.dataset.ended = !coding && game.stage === STAGES.length - 1 && game.clock - game.stagedAt > ENDING_AFTER;
  ui.shipped.textContent = game.shipped.toLocaleString('en');
  ui.stopped.textContent = game.stopped.toLocaleString('en');
  const caption = STAGES[game.stage].caption;
  if (ui.caption.textContent !== caption) swapCaption(ui.caption, caption);
}

export function showLineCount(ui, lines) {
  ui.lines.textContent = lines.toLocaleString('en');
}

function swapCaption(element, text) {
  element.textContent = text;
  element.classList.remove('fresh');
  void element.offsetWidth;
  element.classList.add('fresh');
}
