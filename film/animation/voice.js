// The voice that reads the captions, one of the three layers of the film's sound
// (sound.js). Each caption has its own recording, made from the script when the film is
// published (ADR 0006). It plays in the same audio context as the music and the effects,
// so the three are mixed and none of them stops the others.
const DRIFT_SECONDS = 0.5;
// A recording is started this long before its caption appears, at the exact moment in
// the audio clock, since a frame comes only now and then.
const LOOKAHEAD_SECONDS = 0.25;
// A recording that could only start this late into its caption, as when it loaded late
// or the frames came slowly, starts from its first word anyway and runs that much late.
const CATCH_UP_SECONDS = 1;

export function createVoice(context, destination) {
  const recordings = new Map();
  let playing = null;
  return {
    // Keeps the scene's recording with the caption's offset, so a pause or a jump takes
    // the voice along; a negative offset is before the caption starts.
    follow(id, offset) {
      // The recording is fetched while the scene waits for its caption.
      const buffer = recordingFor(id);
      const late = playing?.id === id ? playing.late : 0;
      if (!buffer || offset < -LOOKAHEAD_SECONDS || offset - late >= buffer.duration) return stop();
      if (playing?.id !== id) return start(id, buffer, offset < CATCH_UP_SECONDS ? Math.max(offset, 0) : 0, offset);
      if (Math.abs(context.currentTime - playing.startedAt - (offset - late)) > DRIFT_SECONDS) start(id, buffer, late, offset);
    },
    stop,
  };

  // Plays the recording from `offset - late` seconds in; a negative position starts it
  // that much later.
  function start(id, buffer, late, offset) {
    stop();
    const position = offset - late;
    const source = new AudioBufferSourceNode(context, { buffer });
    source.connect(destination);
    source.start(context.currentTime + Math.max(0, -position), Math.max(0, position));
    playing = { id, source, late, startedAt: context.currentTime - position };
  }

  function stop() {
    playing?.source.stop();
    playing = null;
  }

  // A recording is fetched once, the first time its scene plays. A film served
  // without them, as from a fresh clone, has none and plays without the voice; any
  // other failure is reported, and that caption is not read.
  function recordingFor(id) {
    if (!recordings.has(id)) {
      recordings.set(id, undefined);
      load(`voice/${id}.mp3`).then((buffer) => recordings.set(id, buffer), console.error);
    }
    return recordings.get(id);
  }

  async function load(url) {
    const response = await fetch(url);
    if (response.status === 404) return undefined;
    if (!response.ok) throw new Error(`Could not load ${url} (${response.status}).`);
    return context.decodeAudioData(await response.arrayBuffer());
  }
}
