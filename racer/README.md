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
│   ├── sprites.js      sprite sheet frames and world sizes
│   ├── controls.js     keyboard + touch input
│   ├── background.js   parallax layers
│   ├── circuit.js      track building and pseudo-3D rendering
│   ├── player.js       car physics
│   ├── traffic.js      the other cars
│   ├── camera.js       camera following the player
│   ├── hud.js          readouts, title and game over screens
│   └── main.js         Phaser setup and the game loop
├── assets/             graphics
├── libs/               Phaser 3.24.1
└── reference/          the original tutorial versions, kept for comparison
```

Every value worth balancing (speeds, grip, traffic density, scenery density, the
clock, scoring) lives in `js/config.js`.

## Credits and licence

This game is based on the **Pseudo-3d-Racer** prototype by **Srdjan Susnic**
(Ask For Game Task):

* original project: https://github.com/ssusnic/Pseudo-3d-Racer
* website: https://www.askforgametask.com

The original project is released under the **MIT licence**, which is kept in
[`LICENSE`](LICENSE) together with Srdjan Susnic's copyright notice. The graphics in
`assets/` are from that same project.

`reference/part1` and `reference/part2` are the unmodified tutorial versions the game
started from. Everything under `js/` is the Ja-x's Arcade continuation: player
controls, a curved and hilly circuit, off-road physics, traffic, roadside scenery, a
HUD, a restart flow and touch controls.

Built with [Phaser 3](https://phaser.io/) (3.24.1, bundled in `libs/`).
