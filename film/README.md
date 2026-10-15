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
| Length           | 90–120 seconds.                                                                             |
| Form             | Animated silent film in a modern style. No voices; intertitles and instrumental music only. |
| Tone             | Matter-of-fact: "this is how it is". No humor, no selling.                                  |
| Language         | English intertitles.                                                                        |
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
- *Shift left* gets its own intertitle.
- The film is first built as an animation in code, with no sound and no recording to
  a video file.
- Users, Builders and IT infrastructure are three separate roles, always shown apart
  (see [roles](script/script.md#roles)).
