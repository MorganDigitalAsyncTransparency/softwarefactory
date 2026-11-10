import { frequency } from './harmony.js';

// The instruments, made of oscillators and noise that swell and die away. Nothing is
// recorded: every sound is computed when it plays.
export function createSynth(ctx) {
  const out = ctx.createDynamicsCompressor();
  out.connect(ctx.destination);
  const wet = echo(ctx, out);
  const noise = noiseBuffer(ctx);
  return { ctx, out, wet, noise };
}

export function kick({ ctx, out }, t, level = 1) {
  const osc = ctx.createOscillator();
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
  play(osc, envelope(ctx, out, { t, level: 0.9 * level, length: 0.35 }), t, 0.4);
}

export function hat(synth, t) {
  burst(synth, t, { cutoff: 8000, level: 0.12, length: 0.05 });
}

export function clap(synth, t) {
  burst(synth, t, { cutoff: 1800, level: 0.35, length: 0.14 });
}

export function bass({ ctx, out }, t, midi) {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.value = frequency(midi);
  const filter = lowpass(ctx, 420);
  filter.connect(envelope(ctx, out, { t, level: 0.32, length: 0.22 }));
  play(osc, filter, t, 0.25);
}

export function pluck({ ctx, out, wet }, t, midi, level = 0.3) {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = frequency(midi);
  const gain = envelope(ctx, out, { t, level, length: 0.6 });
  gain.connect(wet);
  play(osc, gain, t, 0.7);
}

export function pad({ ctx, out, wet }, t, chord, length) {
  for (const midi of chord) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = frequency(midi - 12);
    osc.detune.value = (midi % 3 - 1) * 8;
    const filter = lowpass(ctx, 700);
    const gain = swell(ctx, wet, { t, level: 0.05, length });
    filter.connect(gain);
    gain.connect(out);
    play(osc, filter, t, length);
  }
}

export function thud({ ctx, out }, t) {
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(70, t);
  osc.frequency.exponentialRampToValueAtTime(35, t + 0.3);
  const filter = lowpass(ctx, 300);
  filter.connect(envelope(ctx, out, { t, level: 0.5, length: 0.3 }));
  play(osc, filter, t, 0.35);
}

export function riser(synth, t, length) {
  const { ctx, out, noise } = synth;
  const source = ctx.createBufferSource();
  source.buffer = noise;
  source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(300, t);
  filter.frequency.exponentialRampToValueAtTime(9000, t + length);
  filter.connect(swell(ctx, out, { t, level: 0.25, length, rising: true }));
  play(source, filter, t, length);
}

function burst({ ctx, out, noise }, t, { cutoff, level, length }) {
  const source = ctx.createBufferSource();
  source.buffer = noise;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = cutoff;
  filter.connect(envelope(ctx, out, { t, level, length }));
  play(source, filter, t, length + 0.05);
}

function envelope(ctx, out, { t, level, length }) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(level, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  gain.connect(out);
  return gain;
}

// Fades in and out over the length, or only in, for a riser that ends on the beat.
function swell(ctx, out, { t, level, length, rising = false }) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.linearRampToValueAtTime(level, t + (rising ? length : length * 0.3));
  gain.gain.linearRampToValueAtTime(0.0001, t + length + (rising ? 0.05 : 0));
  gain.connect(out);
  return gain;
}

function play(source, first, t, length) {
  source.connect(first);
  source.start(t);
  source.stop(t + length);
}

function lowpass(ctx, cutoff) {
  const filter = ctx.createBiquadFilter();
  filter.frequency.value = cutoff;
  return filter;
}

function echo(ctx, out) {
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.38;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.35;
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(out);
  return delay;
}

function noiseBuffer(ctx) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}
