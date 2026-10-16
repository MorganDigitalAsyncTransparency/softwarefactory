# Film: The factory that builds itself while it produces

A short animated silent film that explains a software factory by comparing it with a
physical factory. This file is the film brief: who the film is for and the decisions
that shape it. The scenes themselves are in [script/script.md](script/script.md).

The film plays as an animation drawn in code: [`index.html`](index.html). How to watch
it is in the [contributing guide](../docs/01-CONTRIBUTING.md#watching-the-animation).

## Brief

| Question         | Decision                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------- |
| Audience         | Employees, with a message from senior management. No IT knowledge assumed.                  |
| Purpose          | Explain the current state, so that viewers understand it.                                   |
| Length           | 90–150 seconds.                                                                             |
| Form             | Animated silent film in a modern style. No voices; captions and instrumental music only.    |
| Tone             | Matter-of-fact: "this is how it is". No humor, no selling.                                  |
| Language         | English captions.                                                                           |
| Where it is seen | On the web, on the viewer's own computer.                                                   |
| Brand            | None. Neutral and global: no logo, no company colors, no national markers.                  |

## Core message

A software factory is being built while it already produces software. The left end
(small units checked early, *shift left*) and the right end (release) have worked for
years. In between, much is still manual: boxes are carried by hand, arrive at random
times and in varying quality, and factory, IT and product do not always fit together.
We are building gates at every step and automating the manual steps away.

## Analogies

| Physical factory                          | Software factory                                |
| ----------------------------------------- | ----------------------------------------------- |
| Many small boxes arriving on the left     | Small code changes, checked early (shift left)  |
| Conveyor belts                            | The CI/CD pipeline                              |
| Carrying boxes by hand between belts      | Manual hand-offs between pipeline stages        |
| Gates that stop damaged boxes             | Quality gates                                   |
| Long cables from the cloud to each station | Integrations, tested at every step             |
| Robots                                    | Automation and AI agents                        |
| The large box at the loading dock         | A release                                       |
| The factory being built around the belts  | The software factory built while it runs        |

## Decisions

- The software layer is revealed late, after the factory story, so the factory image
  carries the film.
- *Shift left* gets its own caption.
- The film is one continuous picture with captions at the bottom, not cut by black title
  cards, which broke its flow.
- The factory is never finished: the hall and some belts are still being built when the
  film ends.
- The first version is an animation in code, silent for now: the music in the form
  above comes later, and so does any recording to a video file.
- The film introduces the people first: Product developers, Software factory developers
  and IT developers each wear their own color and are always shown apart (see
  [roles](script/script.md#roles)).
- The parts come from an open office where Product developers work, so viewers see
  where the product starts.
- When a service in the cloud fails, every belt stops: the film shows how much the
  whole line depends on IT.
- People work here and there on the floor, not only along the belts.
