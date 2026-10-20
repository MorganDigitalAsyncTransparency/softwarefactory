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
  rules: when it appears and leaves, how the closing caption looks, and long text
  wrapped onto balanced lines.

### R4: The viewer controls playback

- **Given** the animation in a browser,
- **when** the viewer presses play or pause, restarts, clicks the progress bar or turns
  the sound off or on,
- **then** playback starts, stops, restarts or jumps to that time, or the sound stops or
  plays again.

### R5: A frame can be opened directly

- **Given** the address of the animation with `?t=<seconds>`,
- **when** it loads,
- **then** it shows the frame at that time, paused. This is how a reviewer or a test
  checks a single scene.

### R6: It runs without an install or a build

- **Given** a clone of the repository,
- **when** the `film/` folder is served by any static web server,
- **then** the animation plays in a current browser with no install and no build step;
  its one library, three.js, is loaded by the page at a pinned version. Only the voice
  needs a step of its own (R15).

### R7: The pictures carry no text and no brand

- **Given** any scene,
- **when** it is drawn,
- **then** the picture contains no words, symbols of a brand or national markers; the
  caption over it is the only text.

### R8: The film is one continuous picture

- **Given** two scenes that follow each other,
- **when** the first ends and the second starts,
- **then** the camera goes on from where it was, with no title card, unless the first
  scene fades out and the second fades in through black.

### R9: The line stops when the cloud fails

- **Given** a scene where a service in the cloud fails,
- **when** it plays,
- **then** every belt, box and robot stands still while the cloud is down and goes on
  from where it stopped when the cloud is back, while the other people keep working and
  those who walk about or carry boxes hurry, faster than before; every Software factory
  developer leaves their work and runs about near it, fast, stopping again and again to
  inspect what is near, and is back at their work when the cloud is back; the same time
  always shows the same frame.

### R10: The factory is built while it runs

- **Given** any moment of the film, from the first frame to the last,
- **when** it is drawn,
- **then** at least one and at most three test stations are being built, no more than
  two of them begun before the film; about half of all test stations are built during
  the film; and the hall, the IT, some belts and some stations are still unfinished in
  the last frame. Beside these, a few builds in the lines crawl: each moves on all film
  long and covers less than half of its way.

### R11: The film sounds like its picture

- **Given** the animation playing with sound on, after the viewer has clicked or
  pressed a key on the page,
- **when** a scene plays,
- **then** it sounds as [the sound description](../film/script/visual-descriptions.md#sound)
  says:
  - the music speeds up and grows towards its closing chord, which lands as the last
    scene begins, wherever the script puts it;
  - the music, the factory sounds and the voice play together as three layers: the
    music plays the whole film without a pause, also while the voice reads and while
    the station clicks stop with the belts and the alarm sounds;
  - short sounds mark the moments the description names, once each, and none plays
    for what a jump skipped;
  - the sound fades with the picture, and a paused film is silent.

### R12: The middle is uneven

- **Given** the five belts in the middle,
- **when** any frame is drawn,
- **then** their gaps lie and measure differently on each belt, a few boxes are missing
  on their even stretches while the small belts and the release belt keep an even
  pace, and a person carrying now and then rests for a whole round.

### R13: IT adapts to what the product needs

- **Given** the product, which now and then needs something new,
- **when** the film plays,
- **then** some boxes all through it carry a band in a color of their own; a gate that
  IT has not fitted for them pushes them off with an amber light, while it still stops
  damaged boxes with a red one; in the gate scene a Product developer and the IT
  developer talk in wordless speech bubbles before IT lowers an adapter onto the gate,
  and only new boxes that reach the gate after that pass it, so none jumps out of the
  bin; one of the gates added in the last scenes is still not fitted; and racks in the cloud
  are upgraded in the same color one after the other.

### R14: Communication is access controlled

- **Given** the film,
- **when** it plays,
- **then**
  - every test station with a cable has a lock on top whose dot shows green with
    access, red when denied or while the cloud is down, and nothing while it waits;
  - a few times an IT security developer changes an access and one station at a time,
    never during the cloud outage, stops testing, so boxes pass it unchecked, while the
    IT security developer works at its lock and a Product developer waits at it until
    an IT developer comes;
  - in the scene that introduces IT security developers, one of them raises a firewall
    on the server room's link to the cloud, which stays, and the server room's finished
    stations stop together until an IT developer opens the way;
  - some stations built during the film wait for their first access;
  - a card reader by the server room lets IT developers in after a second step, and no
    one else;
  - each release is sealed after its last test station, where an IT security developer
    watches.

### R15: A voice reads the captions

- **Given** the published film playing with sound on, after the viewer has clicked or
  pressed a key on the page,
- **when** a caption is shown,
- **then** [the voice](../film/script/visual-descriptions.md#sound) reads it as that
  description says, from the moment it appears, and is done before it leaves; it
  starts with the first word, also when it can only start up to a second late, as
  after slow loading; after a jump into a caption the voice goes on from the same
  point in it, and the
  recordings are made from the script, so a changed caption is read anew. A clone
  served as R6 says plays without the voice until it is made (ADR 0006).

### R16: The Software factory developers build software

- **Given** the Software factory developers, who build with walls, belts and cranes,
- **when** the film plays,
- **then** one of them talks in a speech bubble with the sign for code, </>, in the
  scene that introduces them and while the gate is installed in the gate scene, and
  each of them holds a laptop while the picture is digital, and only then.

### R17: IT security developers secure the factory

- **Given** IT, which also secures the factory,
- **when** the film plays,
- **then** IT security developers wear the blue of IT with a red hat, as the
  [style block](../film/script/visual-descriptions.md#style-block) says, walk about the
  hall and work in the cloud, and do the security work that R14 describes.
