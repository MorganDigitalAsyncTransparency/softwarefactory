import { parseScript } from './script-parser.js';
import { duration, fade, frameAt, share, startTimeFrom } from './timeline.js';
import { checkDrawings, draw, lineTime, peopleTime } from './scenes.js';
import { captionSpan, showCaption } from './caption.js';
import { createStage } from './stage.js';
import { createSound } from './sound.js';
import { createVoice } from './voice.js';
import { events, levels } from './score.js';

const SCRIPT_URL = 'script/script.md';
// The picture fades from and to black only where a scene asks for it; captions fade in
// and out over their own span.
const FADE_SECONDS = 0.8;
const CAPTION_FADE_SECONDS = 0.6;
// A frame later than this, as when the tab was hidden, starts the sound afresh like a jump.
const LATE_SECONDS = 1;
const canvas = document.getElementById('stage');
const stage = createStage(canvas);
const sound = createSound();
const voice = createVoice();
const caption = document.getElementById('caption');
const playButton = document.getElementById('play');
const restartButton = document.getElementById('restart');
const soundButton = document.getElementById('sound');
const progressBar = document.getElementById('progress');
const clock = document.getElementById('clock');
const playback = { scenes: [], time: 0, playing: false, lastTick: null, soundOn: true, heard: null };

start().catch(showError);

async function start() {
  const response = await fetch(SCRIPT_URL);
  if (!response.ok) throw new Error(`Could not load ${SCRIPT_URL} (${response.status}).`);
  playback.scenes = parseScript(await response.text());
  checkDrawings(playback.scenes);
  progressBar.max = duration(playback.scenes);
  wireControls();
  const startTime = startTimeFrom(window.location.search);
  seek(Math.min(Math.max(startTime ?? 0, 0), duration(playback.scenes)));
  if (startTime === null) play();
}

function wireControls() {
  playButton.addEventListener('click', () => (playback.playing ? pause() : play()));
  restartButton.addEventListener('click', () => { jump(0); play(); });
  progressBar.addEventListener('input', () => jump(Number(progressBar.value)));
  soundButton.addEventListener('click', toggleSound);
  // The browser lets sound start only after the viewer has clicked or pressed a key.
  ['pointerdown', 'keydown'].forEach((type) => document.addEventListener(type, listen));
  document.addEventListener('visibilitychange', () => (document.hidden ? silence() : listen()));
  window.addEventListener('resize', () => seek(playback.time));
  document.addEventListener('keydown', (event) => {
    if (event.code !== 'Space') return;
    event.preventDefault();
    playButton.click();
  });
}

function play() {
  if (playback.playing) return;
  if (playback.time >= duration(playback.scenes)) jump(0);
  playback.playing = true;
  playback.lastTick = null;
  listen();
  playButton.setAttribute('aria-label', 'Pause');
  playButton.textContent = '❚❚';
  requestAnimationFrame(tick);
}

function pause() {
  playback.playing = false;
  silence();
  playButton.setAttribute('aria-label', 'Play');
  playButton.textContent = '▶';
}

function tick(timestamp) {
  if (!playback.playing) return;
  const elapsed = playback.lastTick === null ? 0 : (timestamp - playback.lastTick) / 1000;
  playback.lastTick = timestamp;
  if (elapsed > LATE_SECONDS) playback.heard = null;
  const frame = seek(Math.min(playback.time + elapsed, duration(playback.scenes)));
  hear(frame);
  if (playback.soundOn) voice.follow(frame.spoken.id, frame.spoken.offset);
  if (playback.time >= duration(playback.scenes)) pause();
  else requestAnimationFrame(tick);
}

// A jump starts the sound afresh, so the short sounds it skipped over are not played.
function jump(time) {
  playback.heard = null;
  seek(time);
}

function seek(time) {
  playback.time = time;
  const frame = render(frameAt(playback.scenes, time));
  progressBar.value = time;
  clock.textContent = `${formatClock(time)} / ${formatClock(duration(playback.scenes))}`;
  return frame;
}

// Plays the frame's sound, and the short sounds that started since the frame before.
function hear({ shot, clock, fade: volume }) {
  const from = playback.heard ?? clock;
  sound.play({ volume, levels: levels(shot, clock), events: events(shot, from, clock) });
  playback.heard = clock;
}

function silence() {
  sound.suspend();
  voice.stop();
}

function listen() {
  if (playback.playing && playback.soundOn) sound.resume();
}

function toggleSound() {
  playback.soundOn = !playback.soundOn;
  soundButton.setAttribute('aria-label', playback.soundOn ? 'Sound off' : 'Sound on');
  soundButton.textContent = playback.soundOn ? '🔊' : '🔇';
  if (playback.soundOn) listen();
  else silence();
}

function render({ scene, progress }) {
  const length = scene.end - scene.start;
  const seconds = progress * length;
  const shot = draw({ scene, progress });
  const fades = shot.fades ?? [];
  const fadeIn = fades.includes('in') ? share(seconds, 0, FADE_SECONDS) : 1;
  const fadeOut = fades.includes('out') ? share(length - seconds, 0, FADE_SECONDS) : 1;
  const picture = Math.min(fadeIn, fadeOut);
  canvas.style.opacity = picture;
  const { start } = showSceneCaption(scene, seconds);
  // A scene without a caption has no voice, and stops the one before.
  const spoken = { id: scene.id, offset: scene.caption ? seconds - start : -1 };
  const { scenes, time } = playback;
  const clock = { film: time, line: lineTime(scenes, time), people: peopleTime(scenes, time) };
  stage.render(shot, { ...clock, buildShare: time / duration(scenes) });
  return { shot, clock, fade: picture, spoken };
}

// The last scene's caption is the film's closing message. Returns when the caption shows.
function showSceneCaption(scene, seconds) {
  const closing = scene === playback.scenes.at(-1);
  const span = captionSpan(scene.caption, scene.end - scene.start, closing);
  caption.classList.toggle('closing', closing);
  showCaption(caption, scene.caption, fade(seconds - span.start, span.end - span.start, CAPTION_FADE_SECONDS));
  return span;
}

function formatClock(seconds) {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function showError(error) {
  document.getElementById('error').textContent = `${error.message} Serve the film/ folder over HTTP; see docs/01-CONTRIBUTING.md.`;
}
