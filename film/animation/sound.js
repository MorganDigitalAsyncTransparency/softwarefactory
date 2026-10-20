import { SHORT, gainNode, tone } from './instruments.js';

// The film's sound, made in the browser with the Web Audio API so that no recording is
// kept (ADR 0005). It plays what score.js describes; the browser lets it start only
// after the viewer has clicked or pressed a key on the page.
const VOLUME = 0.5;
const GLIDE = 0.05;
// The music steps back and forward slowly, so the voice does not pump it.
const MUSIC_GLIDE = 0.3;
const MIX = { hum: 0.04, music: 0.18, alert: 0.07, reverb: 0.35 };
const REVERB_SECONDS = 2.4;

export function createSound() {
  let voices = null;
  return {
    resume() {
      voices ??= build(new AudioContext());
      voices.context.resume();
    },
    suspend() {
      voices?.context.suspend();
    },
    play({ volume, levels, events }) {
      if (voices?.context.state !== 'running') return;
      steady(voices, { volume, ...levels });
      events.forEach((event) => SHORT[event.kind](voices, event));
    },
  };
}

// The music and some cues ring in a hall: they go to the master both dry and through
// the hall's echo.
function build(context) {
  // The compressor keeps the loudest moments, as the last plays of the theme, from clipping.
  const limiter = new DynamicsCompressorNode(context);
  limiter.connect(context.destination);
  const master = gainNode(context, VOLUME, limiter);
  const room = new ConvolverNode(context, { buffer: hallEcho(context) });
  room.connect(gainNode(context, MIX.reverb, master));
  const music = gainNode(context, MIX.music, master);
  const ring = gainNode(context, 1, master);
  [music, ring].forEach((node) => node.connect(room));
  const hum = gainNode(context, 0, filtered(context, 'lowpass', 160, master));
  [55, 110].forEach((frequency) => tone(context, { type: 'sawtooth', frequency }, hum));
  const alert = gainNode(context, 0, filtered(context, 'lowpass', 2400, master));
  const siren = tone(context, { type: 'square', frequency: 880 }, alert);
  return { context, master, music, ring, hum, alert, siren };
}

function steady(voices, { volume, hum, music, alert }) {
  const glide = (param, value, seconds = GLIDE) => param.setTargetAtTime(value, voices.context.currentTime, seconds);
  glide(voices.master.gain, VOLUME * volume);
  glide(voices.hum.gain, MIX.hum * hum);
  glide(voices.music.gain, MIX.music * music, MUSIC_GLIDE);
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
