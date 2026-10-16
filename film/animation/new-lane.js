import { belt, joiner } from './machines.js';
import { person } from './figures.js';
import { group } from './shapes.js';
import { station } from './lanes.js';
import {
  BELT_WORKERS, HALL, INTAKE, INTAKE_SPAN, INTAKE_TESTS, JOINER, NEW_LANE, middleTests, newLaneLaid, smallLanes,
} from './layout.js';

// The crew laying the lane works in front of it, toward the camera.
const CREW_DISTANCE = 1.6;
const WALL_CLEARANCE = 2;

// The sixth lane, laid while the factory runs: its two small belts grow from the office
// into the hall, its joiner rises, then its belt grows across the middle, Software
// factory developers at each tip and its test stations built behind them. No boxes run
// on it yet.
export function newLane(state) {
  const { intake, joiner: joined, middle } = newLaneLaid(state.filmShare);
  const { index, z } = NEW_LANE;
  const rising = joiner(index);
  rising.scale.y = Math.max(0.01, joined);
  return group([
    ...smallLanes(index).map((small) => intake > INTAKE.start && belt(INTAKE.start, intake, small, INTAKE.width)),
    intake < INTAKE.end && crew(intake, z),
    joined > 0 && rising,
    middle > JOINER.end && belt(JOINER.end, middle, z),
    middle > JOINER.end && crew(middle, z),
    ...INTAKE_TESTS.map((x, at) => station({ x, z, span: INTAKE_SPAN, key: `intake ${index} ${at}` }, state, null)),
    ...middleTests(index).map((x, at) => station({ x, z, span: 2.2, key: `middle ${index} ${at}` }, state, null)),
  ]);
}

// Two developers at the tip of a belt; they step around the hall's wall where the belt
// passes through it.
function crew(tip, z) {
  if (Math.abs(tip - HALL.left) < WALL_CLEARANCE) return null;
  const at = (dx, seed) => group([person('factory', { seed: seed + 2 })], { position: [tip + dx, 0, z + CREW_DISTANCE] });
  return group(BELT_WORKERS.map(at));
}
