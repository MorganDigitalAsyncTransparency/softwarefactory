# Requirements

What the code in this repository must do, as desired state in Given/When/Then. How it
is built is in [03-ARCHITECTURE.md](03-ARCHITECTURE.md).

## The film animation

The animation plays the film in a browser as a 3D scene drawn in code. It plays the
[script](../film/script/script.md) and looks as
[visual-descriptions.md](../film/script/visual-descriptions.md) says: the style, the
roles and their colors, the captions and the continuity.

### R1: The script is the only source of scenes and captions

- **Given** `film/script/script.md`,
- **when** the animation loads,
- **then** it reads every scene's ID, time range and caption from that file, and no
  scene time or caption is written anywhere in the code.

### R2: Every scene is drawn

- **Given** the script,
- **when** the animation reaches a scene,
- **then** it draws that scene, and a scene ID with no drawing stops the animation with
  an error that names the ID.

### R3: Captions are readable

- **Given** a scene with a caption,
- **when** it is shown,
- **then** it follows the [captions](../film/script/visual-descriptions.md#captions)
  rules, with long text wrapped onto balanced lines.

### R4: The viewer controls playback

- **Given** the animation in a browser,
- **when** the viewer presses play or pause, restarts, or clicks the progress bar,
- **then** playback starts, stops, restarts or jumps to that time.

### R5: A frame can be opened directly

- **Given** the address of the animation with `?t=<seconds>`,
- **when** it loads,
- **then** it shows the frame at that time, paused. This is how a reviewer or a test
  checks a single scene.

### R6: It runs without an install or a build

- **Given** a clone of the repository,
- **when** the `film/` folder is served by any static web server,
- **then** the animation plays in a current browser with no install and no build step;
  its one library, three.js, is loaded by the page at a pinned version.

### R7: The pictures carry no text and no brand

- **Given** any scene,
- **when** it is drawn,
- **then** the picture contains no words, symbols of a brand or national markers; the
  caption over its bottom edge is the only text.

### R8: The film is one continuous picture

- **Given** two scenes that follow each other,
- **when** the first ends and the second starts,
- **then** the camera goes on from where it was, with no title card, unless the first
  scene fades out and the second fades in through black.

### R9: The line stops when the cloud fails

- **Given** a scene where a service in the cloud fails,
- **when** it plays,
- **then** every belt, box and person on the floor stands still while the cloud is
  down, and nothing on the floor is built, and all of it goes on from where it stopped when the
  cloud is back; the same time always shows the same frame.

### R10: The factory is built while it runs

- **Given** any moment of the film, from the first frame to the last,
- **when** it is drawn,
- **then** at least one and at most three test stations are being built, no more than
  two of them begun before the film; about half of all test stations are built during
  the film; and the hall, the IT, some belts and some stations are still unfinished in
  the last frame.
