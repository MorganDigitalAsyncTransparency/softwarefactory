import { noise } from './layout.js';

// Pure motion for people who work here and there: each walks to a random spot near
// their own patch of an aisle, works there a while, and walks on.
const LEG_SECONDS = 9;
const WALKING_SPEED = 1.4;
const PATCH = 6;

export function wanderAt({ area, seed }, time) {
  const leg = Math.floor(time / LEG_SECONDS + noise(seed));
  const seconds = (time / LEG_SECONDS + noise(seed) - leg) * LEG_SECONDS;
  const [from, to] = [spot(area, seed, leg), spot(area, seed, leg + 1)];
  const distance = Math.hypot(to.x - from.x, to.z - from.z);
  const walked = Math.min(seconds * WALKING_SPEED, distance);
  const along = distance ? walked / distance : 1;
  return {
    x: from.x + (to.x - from.x) * along,
    z: from.z + (to.z - from.z) * along,
    turn: Math.atan2(from.z - to.z, to.x - from.x),
    walked: leg * PATCH + walked,
  };
}

// A spot in the person's own patch of the area, so no walk is longer than a leg.
function spot({ x, z }, seed, leg) {
  return { x: within(patch(x, seed + 0.1), noise(seed + leg * 1.37)), z: within(patch(z, seed + 0.2), noise(seed + leg * 2.11 + 0.5)) };
}

function patch(range, seed) {
  const home = within(range, noise(seed));
  return [home - PATCH / 2, home + PATCH / 2].map((value) => Math.min(Math.max(value, range[0]), range[1]));
}

function within([low, high], share) {
  return low + (high - low) * share;
}
