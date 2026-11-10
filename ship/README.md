# Showpiece: Tap to ship

A short interactive page that shows the software factory in under a minute, made to
be shared as a link in a post. This file is its brief. What the code must do is in
[the requirements](../docs/02-REQUIREMENTS.md#the-showpiece) and how it is built is in
[the architecture](../docs/03-ARCHITECTURE.md#the-showpiece).

It is published at <https://morgandigitalasynctransparency.github.io/softwarefactory/ship/>.

## Brief

| Question         | Decision                                                                                  |
| ---------------- | ----------------------------------------------------------------------------------------- |
| Audience         | Anyone who sees the link in a post: no IT knowledge assumed, a few seconds of attention.  |
| Purpose          | Make the idea of a software factory felt at once, and show what an AI agent can build from text. |
| Length           | About 50 seconds to the ending, less for a viewer who taps; play on as long as they like. |
| Form             | One page: a 3D factory the viewer plays by tapping, music made in the browser, short captions. |
| Tone             | Bold and playful, but every caption is true to the [film](../film/README.md#core-message). |
| Where it is seen | A phone or a computer, opened from a post; the link shows a preview card.                 |
| Brand            | None. The ending says it was written by Claude, because showing that is the purpose.      |

## Decisions

- **It grabs before it asks.** The factory already runs behind the call to tap, so the
  first second shows motion, not a loading screen or a play button.
- **The viewer plays the factory.** A tap drops a change onto a belt; holding drops
  many. Every change that ships plays a note of the chord that is sounding, so any
  rhythm of taps becomes music, and the music grows with the factory.
- **The same story as the film, told in six steps.** Carried by hand with broken parts
  reaching users, gates, automation, more lanes, the hall built around running belts,
  and finally one factory among many. The count of shipped changes moves the story on,
  so a viewer who taps gets there faster.
- **The ending is the reveal.** No images, no video and no sound files: the page counts
  the lines of text it loaded and offers to show the code running, with the function
  at work lit up as it runs.
- **A look of its own.** Dark, with light that glows, unlike the film's daylight
  clarity: the showpiece is seen for seconds in a feed, the film is watched.
