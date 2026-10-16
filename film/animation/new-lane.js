import { belt, joiner } from './machines.js';
import { person } from './figures.js';
import { group } from './shapes.js';
import { station } from './lanes.js';
import {
  INTAKE, INTAKE_TESTS, JOINER, LANES, NEW_LANE, PAIR, TESTS, newLaneLaid, smallLanes,
} from './layout.js';

const LANE = LANES.length;
const CREW_SIDE = 1.6;

// The sixth lane, laid while the factory runs: its two small belts grow from the office
// into the hall, then its belt grows across the middle, Software factory developers at
// each tip, with its test stations built behind them. No boxes run on it yet.
export function newLane(state) {
  const { intake, middle } = newLaneLaid(state.filmShare);
  const { z } = NEW_LANE;
  const started = middle > JOINER.end;
  return group([
    ...smallLanes(LANE).map((small) => intake > INTAKE.start && belt(INTAKE.start, intake, small, INTAKE.width)),
    intake < INTAKE.end && crew(intake, z),
    started && joiner(LANE),
    started && belt(JOINER.end, middle, z),
    started && crew(middle, z),
    ...INTAKE_TESTS.map((x, index) => station({ x, z, span: 2 * PAIR + INTAKE.width + 0.4, key: `intake ${LANE} ${index}` }, state, null)),
    ...TESTS.slice(0, 2).map((x, index) => station({ x, z, span: 2.2, key: `middle ${LANE} ${index}` }, state, null)),
  ]);
}

function crew(tip, z) {
  return group([0.4, 1.4].map((dx, seed) => group([person('factory', { seed: seed + 2 })], { position: [tip + dx, 0, z + CREW_SIDE] })));
}
