import { cable, connect } from './cloud.js';
import { material } from './materials.js';
import { group } from './shapes.js';
import {
  ALL_LANES, ASSEMBLY, GAPS, HALL, INTAKE_TESTS, LANES, OUTPUT, OUTPUT_TESTS, SERVER_ROOM, TESTS, middleOf, stationBuilt,
  unfinishedStations,
} from './layout.js';

const PLACES = {
  intake: (laneIndex, index) => ({ x: INTAKE_TESTS[index], y: 2.6, z: ALL_LANES[laneIndex] }),
  middle: (laneIndex, index) => ({ x: TESTS[index], y: 2.6, z: ALL_LANES[laneIndex] }),
  output: (_, index) => ({ x: OUTPUT_TESTS[index], y: 4.2, z: OUTPUT.z }),
};

// Every cable in the factory, built once per state. The server room talks to the cloud,
// to its own stations (SERVER_ROOM.stations), the assembly and the dock; cables from the
// cloud run to every gate and to the other stations that are first on their belt or
// still being built.
export function wiring(state) {
  const room = SERVER_ROOM.port;
  const stations = new Set([...firstStations(), ...unfinishedStations()]);
  const fromCloud = [...stations].filter((key) => !SERVER_ROOM.stations.includes(key));
  return group([
    ...[...fromCloud, ...gates(state)].map((key) => wire(key, place(key))),
    wire('server room', room),
    ...SERVER_ROOM.stations.map((key) => wire(key, place(key), room)),
    wire('assembly', { x: middleOf(ASSEMBLY), y: 5, z: OUTPUT.z }, room),
    wire('dock', { x: HALL.right - 0.6, y: 4.6, z: OUTPUT.z - 2.4 }, room),
  ]);
}

// Each frame: how much of each cable is pulled in, and red while the cloud is down.
export function pull(cables, { shown, filmShare, outage }) {
  cables.children.forEach((line) => {
    connect(line, Math.min(shown, stationBuilt(line.userData.key, filmShare)));
    line.material = material(outage ? 'stop' : 'it');
  });
}

function firstStations() {
  return LANES.flatMap((_, laneIndex) => [`intake ${laneIndex} 0`, `middle ${laneIndex} 0`]);
}

function gates(state) {
  return Object.entries(state.gaps).filter(([, mode]) => mode === 'gate').map(([key]) => key);
}

function place(key) {
  if (GAPS[key[0]]) return { x: middleOf(GAPS[key[0]]), y: 3.3, z: LANES[Number(key[1]) - 1] };
  const [kind, laneIndex, index] = key.split(' ');
  return PLACES[kind](Number(laneIndex), Number(index));
}

function wire(key, end, from) {
  return Object.assign(cable(end, 1, from), { userData: { key } });
}
