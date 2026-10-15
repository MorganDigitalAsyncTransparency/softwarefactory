# Requirements

What the code in this repository must do, as desired state in Given/When/Then. How it
is built is in [03-ARCHITECTURE.md](03-ARCHITECTURE.md).

## The film animation

The animation plays the film in a browser, drawn in code. It is a flat 2D rendition of
the [script](../film/script/script.md). From
[visual-descriptions.md](../film/script/visual-descriptions.md) it takes the roles,
their colors, the intertitle cards and the continuity, but not the isometric style
meant for AI video.

### R1: The script is the only source of scenes and intertitles

- **Given** `film/script/script.md`,
- **when** the animation loads,
- **then** it reads every scene's ID, time range, type and intertitle text from that file,
  and no scene time or intertitle text is written anywhere in the code.

### R2: Every scene is drawn

- **Given** the script,
- **when** the animation reaches a scene of type Scene,
- **then** it draws that scene, and a scene ID with no drawing stops the animation with
  an error that names the ID.

### R3: Intertitles are readable

- **Given** an intertitle,
- **when** it is shown,
- **then** it follows the [intertitle cards](../film/script/visual-descriptions.md#intertitle-cards)
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

### R6: It runs without a build or dependencies

- **Given** a clone of the repository,
- **when** the `film/` folder is served by any static web server,
- **then** the animation plays in a current browser with no install and no build step.

### R7: The pictures carry no text and no brand

- **Given** any scene of type Scene,
- **when** it is drawn,
- **then** it contains no words, symbols of a brand or national markers; only
  intertitles carry text.
