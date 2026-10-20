import { SHORT, gainNode, tone } from './instruments.js';
import { createVoice } from './voice.js';

// The film's sound, made in the browser with the Web Audio API so that no recording is
// kept (ADR 0005), except the voice's (ADR 0006). It mixes three layers that play side
// by side: the music and the effects, which score.js describes and which fade with the
// picture, and the voice. The browser lets it start only after the viewer has clicked or
// pressed a key on the page.
const VOLUME = 0.5;
const GLIDE = 0.05;
// The music stays in the background, under the voice, the whole film.
const MIX = { music: 0.06, effects: 0.7, voice: 2, hum: 0.04, alert: 0.05, reverb: 0.35 };
const REVERB_SECONDS = 2.4;

export function createSound() {
  let voices = null;
  return {
    resume() {
      voices ??= build(new AudioContext());
      voices.context.resume();
    },
    suspend() {
      voices?.voice.stop();
      voices?.context.suspend();
    },
    play({ volume, levels, events }) {
      if (voices?.context.state !== 'running') return;
      steady(voices, { volume, ...levels });
      events.forEach((event) => SHORT[event.kind](voices, event));
    },
    // The voice reads the caption `offset` seconds after it appeared.
    speak(id, offset) {
      if (voices?.context.state === 'running') voices.voice.follow(id, offset);
    },
  };
}

// The layers meet in the master, and a compressor keeps the loudest moments from
// clipping. The music and some cues also ring in the hall's echo.
function build(context) {
  const limiter = new DynamicsCompressorNode(context);
  limiter.connect(context.destination);
  const master = gainNode(context, VOLUME, limiter);
  const scene = gainNode(context, 1, master);
  const music = gainNode(context, MIX.music, scene);
  const effects = gainNode(context, MIX.effects, scene);
  const room = new ConvolverNode(context, { buffer: hallEcho(context) });
  room.connect(gainNode(context, MIX.reverb, scene));
  const ring = gainNode(context, 1, effects);
  [music, ring].forEach((node) => node.connect(room));
  const hum = gainNode(context, 0, filtered(context, 'lowpass', 160, effects));
  [55, 110].forEach((frequency) => tone(context, { type: 'sawtooth', frequency }, hum));
  const alert = gainNode(context, 0, filtered(context, 'lowpass', 2400, effects));
  const siren = tone(context, { type: 'square', frequency: 880 }, alert);
  const voice = createVoice(context, gainNode(context, MIX.voice, master));
  return { context, scene, music, effects, ring, hum, alert, siren, voice };
}

function steady(voices, { volume, hum, alert }) {
  const glide = (param, value) => param.setTargetAtTime(value, voices.context.currentTime, GLIDE);
  glide(voices.scene.gain, volume);
  glide(voices.hum.gain, MIX.hum * hum);
  glide(voices.alert.gain, MIX.alert * alert.level);
  voices.siren.frequency.setValueAtTime(alert.pitch, voices.context.currentTime);
}

// The echo of a large hall: a burst that dies away, so what it colors rings on softly.
function hallEcho(context) {
  const length = context.sampleRate * REVERB_SECONDS;
  const buffer = context.createBuffer(2, length, context.sampleRate);
  [0, 1].forEach((channel) => buffer.getChannelData(channel).forEach((_, index, samples) => {
    samples[index] = (Math.random() * 2 - 1) * (1 - index / length) ** 3;
  }));
  return buffer;
}

function filtered(context, type, frequency, destination) {
  const filter = new BiquadFilterNode(context, { type, frequency });
  filter.connect(destination);
  return filter;
}
