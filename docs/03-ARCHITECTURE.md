# Architecture

How the code in this repository is built. What it must do is in
[02-REQUIREMENTS.md](02-REQUIREMENTS.md); why it is built this way is in the
[decision records](decisions/README.md).

## The film animation

A static page, `film/index.html`, loads plain ES modules from `film/animation/` and
draws a 3D scene with three.js into one canvas with a 16:9 frame. Each scene's caption
is HTML text over the canvas. There is no framework and no build step;
three.js comes from a CDN through the page's import map (ADR 0004).

```text
film/script/script.md ─fetch─▶ script-parser ─▶ timeline ─▶ player ─┬─▶ caption (HTML)
                                                                   ├─▶ score ─▶ sound (Web Audio)
                                                                   ├─▶ voice (film/voice/*.mp3)
                                                                   │
                                          scenes (shot: camera + state)
                                                                   │
                                                                   ▼
                                     stage ─▶ world ─┬─ building, office
                                       │             ├─ lanes ─▶ machines, flow
                                       │             ├─ people ─▶ wander, troubleshoot
                                       │             ├─ cloud, wiring, server-room, new-lane
                                       │             └─ figures
                                       └─▶ panels
  (who calls whom, not every import: the 3D modules also share figures, shapes and materials)
```

| Module             | Responsibility                                                                      |
| ------------------ | ----------------------------------------------------------------------------------- |
| `script-parser.js` | Pure: turns the script's scene tables into a list of scenes (R1)                    |
| `timeline.js`      | Pure: finds the scene and its progress at a time, fades, and parses `?t=` (R5)      |
| `player.js`        | Loads the script, runs the clock, wires the controls and shows each frame (R4)      |
| `caption.js`       | The caption over the picture: when in its scene it shows, and balanced line wrapping (R3) |
| `score.js`         | Pure: what sounds at a moment of the clocks: the levels of the hum, music and alarms, and the notes, clicks, thuds and cues that start (R11) |
| `music.js`         | Pure: the Mountain King theme as notes, which start at a moment of the line's clock, how long and how loud (R11, ADR 0007) |
| `cues.js`          | Pure: the short sounds that mark a moment, from the shot of the frame before and this one (R11) |
| `sound.js`         | Plays the score with the Web Audio API, in a hall's echo, and stops when the film is paused or the sound is off (ADR 0005) |
| `instruments.js`   | The piano and the short sounds, made of oscillators that swell and die away       |
| `voice.js`         | Plays each caption's recording from the caption's offset, and keeps it there through pauses and jumps (R15) |
| `scenes.js`        | Pure: maps each scene ID to a shot: a camera path, a world state, fades and whether the music halts; throws on a missing ID; the line's and the people's clocks; which gates are fitted for new boxes and when, and who talks in S03 and the gate scene (R2, R8, R9, R13, R16) |
| `flow.js`          | Pure: where boxes, carriers and robots are at a time, which boxes are new, and what a gate stops or, once IT has fitted it, lets pass (R12, R13) |
| `wander.js`        | Pure: where a person who works here and there is at a time                          |
| `troubleshoot.js`  | Pure: where a Software factory developer runs and stops to inspect while the cloud is down (R9) |
| `layout.js`        | Pure: the positions shared by every scene, in metres, and repeatable noise          |
| `access.js`        | Pure: which stations have a cable, when a station's access is denied or still awaited, who works and waits at it, the firewall by the server room, and who tries the server room's card reader (R14, R17) |
| `schedule.js`      | Pure: when each part of the factory is built, and how far it has come, and how many racks are upgraded (R10, R13) |
| `stage.js`         | The renderer, camera and light; draws the factory or the split panels               |
| `world.js`         | Puts the factory together, with the crew of a scene and their speech bubbles, and shows its layers one by one in the opening |
| `building.js`      | The hall: floor, walls, windows and roof, and the site where it is still being built: the rising bay, scaffolding with a developer who may talk about code, and crane |
| `office.js`        | The open office left of the hall, with a desk at the start of every small belt     |
| `server-room.js`   | The small server room in the corner of the hall, its racks as they are installed, its firewall, and the card reader by it |
| `new-lane.js`      | The sixth lane, laid during the film, with its test stations                        |
| `wiring.js`        | Every cable, from the cloud or the server room, how far it is pulled in, and red while the cloud is down |
| `people.js`        | Who walks about where, by role, and the Users at the dock                           |
| `lanes.js`         | Each lane: two small belts and their joiner, the belt with its gaps, flowing boxes, carriers, test stations that test only with access and the people waiting at a denied one, gates with the adapter being lowered onto them, the belt still being laid and the builds that crawl |
| `machines.js`      | Belts, gates with the adapter IT fits them with, test stations and their locks, joiners, the assembly machine and the output to the dock |
| `cloud.js`         | IT: the cloud with its growing and upgraded server racks, IT developers and AI agents, cables, and the alarm when it fails |
| `figures.js`       | People by role, IT security developers in red hats, a Software factory developer who runs about while the cloud is down, robots, boxes, sealed or not, the laptops Software factory developers hold while the picture is digital, and wordless speech bubbles, one with the sign for code |
| `panels.js`        | The three close-ups where factory, IT and product do not fit                        |
| `shapes.js`        | Meshes from shared geometries                                                       |
| `materials.js`     | One material per surface, each with a physical and a digital look; some appear only in the digital one |

### The world and the camera

Every factory scene draws the same world and changes only two things: the camera,
which glides along a path over the scene and starts where the scene before stopped,
and the state, which says which gaps in the middle are closed, gated or carried by a
robot, whether the cloud has failed, and who works where. How far the hall, the cloud and
the unfinished belts and test stations have come is not part of a scene: it follows the share of the film
that has played (`schedule.js`), so the factory grows all through the film and is never finished. That
keeps the layout identical across scenes, as the continuity rules in
[visual-descriptions.md](../film/script/visual-descriptions.md#continuity) ask.
What changes only with the state (the hall, the belts, the cables) is built once and
kept; what moves is drawn again each frame.

Motion is a pure function of time: a box's position is computed from the clock, never
stored, so seeking to any time draws the same frame. There are three clocks. The film's
clock drives the camera, the crane, the cloud's robots and alarm, and how far the
factory is built. The line's clock is the film's clock minus the seconds the line has
stood still while the cloud was down; it drives the belts, the boxes and the robots on
the floor, so they stop and go on from where they were. The people's clock runs faster
while the line stands still, so they hurry about (R9); the Software factory developers
leave their work and run about near it, stopping to inspect. During the outage the
scene's state carries `outage: { seconds, length }`, how far into it the frame is. The sound follows the same
clocks: the music and the station clicks the line's, the hum, the crane and the alarms
the film's. Each frame the player asks `score.js` for the sound between the frame
before and this one, given as both frames' shots and clocks, so a jump plays nothing it
skipped and a cue sounds where the shot changes. The voice follows the captions
instead: each frame the player tells `voice.js` how far into its caption the scene is.
The digital look blends every material between its two looks instead of
drawing a second world.

### The voice

The voice's recordings are made, not kept (ADR 0006). `scripts/voice/generate.sh`
downloads the Kokoro model once, checks it against `model.sha256`, and pipes the
script's lines from `print-lines.js` (the words to say and the seconds each caption is
shown, from `lines.js`) into `speak.py`, which writes `film/voice/<scene>.mp3` and
fails when a recording is longer than its caption is shown. The `Checks` workflow runs
it on every pull request and the `Publish the film` workflow before each publish.

### Tests

Node's built-in test runner runs `tests/`: the parser, the timeline, the motion of
boxes and people, the line's and the people's clocks, the score, caption wrapping and when a caption shows, that every scene has a drawing
and continues the camera of the one before, that the layout gives every running belt two test
stations, one of them working from the start, that the schedule spreads the building over
the whole film and never finishes it (R10), what the voice says for each caption (R15), that an access change stops one station at a time outside the outage and the firewall stops the server room's stations together (R14), and that the script itself keeps its timing rules.
None of them needs three.js. The drawings are checked by eye: open a frame with `?t=`
per scene.
