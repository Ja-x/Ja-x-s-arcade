# Ja-x's Arcade Racer

An old school pseudo-3D arcade racer, part of **Ja-x's Arcade**.

Drive as far as you can before the clock runs out. Every completed lap buys you more
time.

Open `index.html` (through any static web server) to play.

## Controls

| Action       | Keyboard                 | Touch          |
|--------------|--------------------------|----------------|
| Steer left   | `←` / `A`                | ◀ button       |
| Steer right  | `→` / `D`                | ▶ button       |
| Accelerate   | `↑` / `W`                | GAS button     |
| Brake        | `↓` / `S`                | BRAKE button   |
| Start / retry| `SPACE` or `ENTER`       | tap the screen |
| Pause        | `P`                      | –              |

The on-screen buttons only appear on devices with a touch screen.

## Project layout

```
racer/
├── index.html          the game
├── js/
│   ├── config.js       all tuning values in one place
│   ├── utils.js        small math helpers
│   ├── artwork.js      all graphics, drawn into canvas textures at boot
│   ├── sprites.js      texture keys and world sizes
│   ├── controls.js     keyboard + touch input
│   ├── background.js   parallax layers
│   ├── circuit.js      track building and pseudo-3D rendering
│   ├── player.js       car physics
│   ├── traffic.js      the other cars
│   ├── camera.js       camera following the player
│   ├── hud.js          readouts, title and game over screens
│   └── main.js         Phaser setup and the game loop
├── assets/             the original tutorial graphics, used by reference/ only
├── libs/               Phaser 3.24.1
└── reference/          the original tutorial versions, kept for comparison
```

## Graphics

The game draws all of its own artwork. `js/artwork.js` paints every picture into a
canvas texture when the game boots: the sky, clouds, mountains and distant town, the
cars and lorries, the player's car, and the roadside trees, billboards and signs.

That keeps the game to plain files with no binary assets, lets the pictures carry
shading and detail that hand-made placeholder sprites did not have, and costs nothing
while driving because everything is drawn once at start up.

Two details are worth knowing when editing it:

* The parallax layers are tiled sideways, so anything drawn near an edge is repeated
  on the opposite one and the mountain ridges start and end at the same height.
* The player's car is the only sprite that changes during play. Its brake lights go
  out under acceleration and the driver's hair moves, so every combination is drawn
  once at boot and `player.js` just swaps between the finished textures.

Every value worth balancing (speeds, grip, traffic density, scenery density, the
clock, scoring) lives in `js/config.js`.

## Credits and licence

This game is based on the **Pseudo-3d-Racer** prototype by **Srdjan Susnic**
(Ask For Game Task):

* original project: https://github.com/ssusnic/Pseudo-3d-Racer
* website: https://www.askforgametask.com

The original project is released under the **MIT licence**, which is kept in
[`LICENSE`](LICENSE) together with Srdjan Susnic's copyright notice. The PNG files in
`assets/` are from that same project; the game itself no longer uses them, but
`reference/part1` and `reference/part2` still load them.

The artwork the game actually shows is drawn by `js/artwork.js` and is original work
for Ja-x's Arcade. It is not traced from, or copied out of, any other game.

`reference/part1` and `reference/part2` are the unmodified tutorial versions the game
started from. Everything under `js/` is the Ja-x's Arcade continuation: player
controls, a curved and hilly circuit, off-road physics, traffic, roadside scenery,
the artwork, a HUD, a restart flow and touch controls.

Built with [Phaser 3](https://phaser.io/) (3.24.1, bundled in `libs/`).
