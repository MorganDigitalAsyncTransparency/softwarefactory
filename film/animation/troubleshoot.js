import { noise } from './layout.js';

// Pure motion for Software factory developers while the cloud is down: they drop their
// work and run like mad from spot to spot near it, stop at each to inspect the machine,
// and are back at their work when the cloud is back. Each leg is long enough to reach
// the next spot, so no one jumps.
const RUN_SPEED = 9;
const LEG_SECONDS = 1.6;
const REACH = 4;

// Where someone who would be at `home` is, given how many `seconds` into an outage of
// `length` seconds it is; `area` bounds where they run.
export function rushAt(home, { area, seed }, outage) {
  if (!outage) return home;
  const { seconds, length } = outage;
  const legs = Math.floor(length / LEG_SECONDS);
  const leg = Math.floor(seconds / LEG_SECONDS);
  const [from, to] = [leg, leg + 1].map((index) => spot(home, { area, seed }, index < legs ? index : 0));
  const distance = Math.hypot(to.x - from.x, to.z - from.z);
  const ran = Math.min((seconds - leg * LEG_SECONDS) * RUN_SPEED, distance);
  const along = distance ? ran / distance : 1;
  return {
    x: from.x + (to.x - from.x) * along,
    z: from.z + (to.z - from.z) * along,
    turn: distance ? Math.atan2(from.z - to.z, to.x - from.x) : home.turn,
    walked: ran < distance ? ran : 0,
    inspecting: ran === distance && to !== home,
  };
}

// The run starts and ends where they work; every other spot lies within reach of it.
function spot(home, { area: { x, z }, seed }, leg) {
  if (leg === 0) return home;
  const near = (value, range, offset) => clamp(value + REACH * (2 * noise(seed + leg * 1.91 + offset) - 1), range);
  return { x: near(home.x, x, 0.3), z: near(home.z, z, 0.7) };
}

function clamp(value, [low, high]) {
  return Math.min(Math.max(value, low), high);
}
