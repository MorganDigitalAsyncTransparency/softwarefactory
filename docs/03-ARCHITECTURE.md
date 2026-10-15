# Architecture

How the code in this repository is built. What it must do is in
[02-REQUIREMENTS.md](02-REQUIREMENTS.md); why it is built this way is in the
[decision records](decisions/README.md).

## The film animation

A static page, `film/index.html`, loads plain ES modules from `film/animation/` and
draws into one SVG with a fixed 1600 × 900 frame (ADR 0004). There is no framework, no
build step and no dependency.

```text
film/script/script.md ──fetch──▶ script-parser ──▶ timeline ──▶ player ──▶ SVG
                                                                 │
                                         scenes ◀── world, figures, intertitle
```

| Module             | Responsibility                                                                   |
| ------------------ | -------------------------------------------------------------------------------- |
| `script-parser.js` | Pure: turns the script's scene tables into a list of scenes (R1)                 |
| `timeline.js`      | Pure: finds the scene and its progress at a time, and parses `?t=` (R5)          |
| `player.js`        | Loads the script, runs the clock, wires the controls and draws each frame (R4)   |
| `scenes.js`        | Maps each scene ID to a drawing; throws on an ID with no drawing (R2)            |
| `world.js`         | The factory floor, belts, gaps, gates, cloud and cables, from a state object     |
| `figures.js`       | People by role, robots and boxes                                                 |
| `intertitle.js`    | The intertitle card: wrapping and fade (R3)                                      |
| `panels.js`        | The three-panel detail scene, where factory, IT and product do not fit           |
| `svg.js`           | Creating SVG elements, and the palette                                           |

### The world and the camera

Every factory scene draws the same world and only changes two things: the camera,
which is the SVG `viewBox` moved between two rectangles over the scene, and the state,
which says which gaps in the middle are closed, which have gates and which are still
carried by hand. That keeps the layout identical across scenes, as the continuity rules
in [visual-descriptions.md](../film/script/visual-descriptions.md#continuity) ask.

Motion is a pure function of time: a box's position is computed from the clock, never
stored, so seeking to any time draws the same frame.

### Tests

`script-parser.js` and `timeline.js` are pure and tested with Node's built-in test
runner (`tests/`). The drawings are checked by eye: open a frame with `?t=` per scene.
