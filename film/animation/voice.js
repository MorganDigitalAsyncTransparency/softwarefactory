// The voice that reads the captions. Each caption has its own recording, made from
// the script when the film is published (ADR 0006); a film served without them, as
// from a fresh clone, plays without the voice.
const DRIFT_SECONDS = 0.25;
// Refusals that pass: no click on the page yet, a pause during loading, or no
// recording; the next frame tries again, or the clip is dropped on its error event.
const PASSING_REFUSALS = ['NotAllowedError', 'AbortError', 'NotSupportedError'];

export function createVoice() {
  const clips = new Map();
  let current;
  return {
    // Keeps the scene's recording at the caption's offset, so a pause or a jump
    // takes the voice along; a negative offset is before the caption starts.
    follow(id, offset) {
      const clip = offset >= 0 ? clipFor(id) : undefined;
      if (current !== clip) current?.pause();
      current = clip;
      // A seek still under way is left to finish, or it would start again each frame.
      if (!clip || clip.seeking || offset >= clip.duration) return;
      if (Math.abs(clip.currentTime - offset) > DRIFT_SECONDS) clip.currentTime = offset;
      if (clip.paused && !clip.ended) clip.play().catch(passRefusal);
    },
    speaking() {
      return Boolean(current && !current.paused);
    },
    stop() {
      current?.pause();
      current = undefined;
    },
  };

  function clipFor(id) {
    if (!clips.has(id)) {
      const clip = new Audio(`voice/${id}.mp3`);
      clip.addEventListener('error', () => clips.set(id, undefined));
      clips.set(id, clip);
    }
    return clips.get(id);
  }
}

function passRefusal(error) {
  if (!PASSING_REFUSALS.includes(error.name)) throw error;
}
