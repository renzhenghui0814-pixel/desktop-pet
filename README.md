# 🐾 Desktop Pet

A desktop pet that lives on your screen — walks along edges, naps, meows, and keeps you company while you work. Built with Electron and Canvas2D, with an importable skin system.

## Features

- **Always on top** — frameless, transparent, sits above all windows
- **4 built-in styles** — realistic cat, robot (Doraemon-like), block (LEGO brick), demon dragon
- **Importable skins** — drop in a `.zip` skin package; custom renderers run sandboxed
- **Themeable skins** — a skin package can ship multiple themes; pick one per skin
- **Per-style theme memory** — each built-in style remembers its own theme, independently
- **Default phrases per skin** — imported packages can seed their own speech bubbles
- **Self-drawn avatars** — style cards render a live preview from the actual renderer, following the current theme
- **Edge patrol** — walks screen edges with natural idle / sit / sleep / groom / stretch / meow behaviors
- **Interactive** — drag to move, click to jump, hover for instant speech bubbles
- **Settings panel** — switch style/theme, resize, edit phrases, set reminders, import skins
- **Persistent** — remembers your style, each style's theme, size, phrases, and reminders across restarts

## Visual Styles

| Style | Icon | Description |
|-------|------|-------------|
| Realistic | 🐱 | Watercolor storybook style — pear body, swan neck, big eyes, paw pads, fluffy tail |
| Robot | 🤖 | Doraemon-like — blue round body, white belly pouch, bell, bean eyes |
| Block | 🧱 | LEGO brick — 3D bricks, top studs, multi-color assembly, slope brick ears |
| Demon | 👿 | Shadow beast — multiple eyes, curved horns, jagged teeth, barbed tail |
| _Imported_ | ✳️ | Any `.zip` skin you import (e.g. the bundled **克劳德 / Claude** skin) |

## Themes

Built-in styles share three global themes, and **each style remembers its own choice independently** — set the realistic cat to black and the robot to white, and they keep their own colors.

| Theme | Palette |
|-------|---------|
| Orange | Classic orange tabby |
| Black | Sleek dark coat |
| White | Clean white |

Imported skins bring **their own themes** (declared in `skin.json`), shown in the Themes tab only when that skin is selected. Your last style and its theme are restored on next launch.

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- Windows 10+ (transparent frameless window depends on Win32 APIs)

### Install & Run

```powershell
git clone https://github.com/renzhenghui0814-pixel/desktop-pet.git
cd desktop-pet
npm install
.\pet.ps1            # Start (recommended)
```

> Do **not** use `npm start` — see "ELECTRON_RUN_AS_NODE" below.

### Script Commands

```powershell
.\pet.ps1          # Start (default)
.\pet.ps1 start    # Start
.\pet.ps1 stop     # Stop
.\pet.ps1 restart  # Restart
```

## Usage

| Action | How |
|--------|-----|
| Open settings | Right-click the pet |
| Drag pet | Click and drag |
| Make it jump | Left-click the pet |
| Speech bubble | Hover over the pet (pops instantly), or wait for auto-meow |
| Reminders | Set time + message in settings — pet shows at screen center |

## Importing Custom Skins

Open **Settings → Style → 📦 Import Skin (.zip)** and pick a skin package.

A skin package is a `.zip` containing two files at its root:

- **`skin.json`** — manifest:
  ```json
  {
    "id": "cat.claude", "name": "克劳德", "type": "cat",
    "style": "claude", "entry": "renderer.js", "icon": "✳️",
    "themes": [ { "id": "coral", "name": "珊瑚橙", "colors": { "main": "#D97757", "...": "..." } } ],
    "phrases": ["Need a hand with this code?", "..."]
  }
  ```
  `themes` and `phrases` are optional. Without `themes`, the skin shows no theme options.
- **`renderer.js`** — the renderer class, **sandboxed** (no `import`/`require`):
  ```js
  var DEFAULT = { main: '#D97757', /* ... */ };
  exports.default = class {
    draw(ctx, state, options) {
      var C = (options && options.theme) || DEFAULT; // theme-aware
      // draw on a 240x200 design canvas using C.*
    }
    getBounds() { return { w: 180, h: 150 }; }
  };
  ```

The renderer reads colors from `options.theme` (falling back to its own `DEFAULT`), so one package can support multiple themes. `phrases` seed the speech-bubble list, and the style card's avatar is drawn by the renderer itself.

A complete working example ships in **`claude-pet-skin/`** (the **克劳德** skin: 3 themes + default phrases), pre-packaged as **`claude-pet.zip`**.

### Skin sandbox safety

Imported `renderer.js` runs via `new Function` with no Node/`require` access. The importer rejects executables (`.exe/.bat/.ps1/.sh/.dll/...`), requires `skin.json` with `id/name/entry`, and caps package size at 5 MB.

## Project Structure

```
desktop-pet/
├── main.js                  # Electron main process (windows, IPC, skin import/unzip)
├── preload.js               # Main window preload (IPC bridge)
├── preload-settings.js      # Settings window preload
├── index.html               # Main window (pet renderer)
├── settings.html            # Settings panel (separate window)
├── settings.js              # Settings panel logic (ES module)
├── styles.css
├── pet.ps1                  # Start/stop script
├── build.ps1                # Packaging script
├── assets/                  # icon.ico / icon.png
├── claude-pet-skin/         # Example importable skin (source)
├── claude-pet.zip           # Example importable skin (packaged)
├── skins/                   # Skin renderers
│   ├── cat.realistic/renderer.js
│   ├── cat.robot/renderer.js
│   ├── cat.block/renderer.js
│   ├── cat.demon/renderer.js
│   └── imported/            # User-imported skins (runtime, gitignored)
└── src/
    ├── app.js               # Application entry (DesktopPetApp)
    ├── constants.js         # Colors, themes, phrases, sizing
    ├── engine/
    │   ├── AnimationLoop.js  # rAF loop, adaptive frame rate
    │   ├── Easing.js
    │   └── StateMachine.js   # Pet state machine
    ├── skins/
    │   ├── SkinManager.js    # Skin registry + sandboxed import + theme management
    │   └── AnimationState.js # Animation state passed to renderers
    ├── cat/
    │   └── CatRenderer.js    # Renderer facade (scaling, bubble overlay, caching)
    ├── behaviors/
    │   └── PatrolBehavior.js # Screen edge patrol
    ├── interaction/
    │   ├── MouseTracker.js
    │   └── SpeechBubble.js
    └── utils/
        ├── Colors.js
        ├── Random.js
        └── ScreenBounds.js
```

## Tech Stack

- **Runtime**: Electron 25.x
- **Rendering**: Canvas2D (off-screen + on-screen double buffering)
- **Animation**: action-based `AnimationState` interpreted per-skin + tween easing, adaptive frame rate (up to 60fps)
- **Skins**: each style is a self-contained renderer; built-ins statically imported, imports compiled in a sandbox
- **Window**: transparent, frameless, always-on-top, `backgroundThrottling` disabled so it keeps rendering when unfocused
- **Security**: contextIsolation + preload IPC bridges
- **State**: localStorage — `pet-style`, `pet-style-themes`, `pet-skin-themes`, `pet-imported-skins`, `pet-phrases`, `pet-scale`, `pet-reminders`

## Build

```powershell
.\build.ps1            # NSIS installer + portable exe
.\build.ps1 -Quick     # Portable only (faster, for testing)
.\build.ps1 -Clean     # Clear dist/
```

Output goes to `dist/`. The bundled Electron runtime means target machines need no Node.js.

## ELECTRON_RUN_AS_NODE gotcha

`set ELECTRON_RUN_AS_NODE=` (cmd) and `$env:ELECTRON_RUN_AS_NODE=""` (PowerShell) only set the var to an empty string — Electron's C++ layer still detects it and runs in pure Node mode, so **no window appears**. The only correct fix is to fully remove it: `Remove-Item Env:ELECTRON_RUN_AS_NODE`. `pet.ps1` does this for you; `npm start` does not.

## Known Issues

- Windows disk-cache permission warning on startup (system limitation, harmless)
- After packaging, skin import writes under the app directory — for installed builds this may need a writable path (use the portable build, or run from source, for skin import)

## License

MIT

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
