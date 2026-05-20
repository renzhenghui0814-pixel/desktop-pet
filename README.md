# 🐾 Desktop Pet

A desktop pet that lives on your screen — walks along edges, naps, meows, and keeps you company while you work. Built with Electron and Canvas2D.

https://github.com/user-attachments/assets/4a8b9c3d-2e1f-4a5c-b6d7-8e9f0a1b2c3d

## Features

- **Always on top** — sits above all windows, frameless and transparent background
- **4 visual styles** — realistic, robot, block (brick), and demon
- **Edge patrol** — walks along screen edges, with natural idle/meow/sleep behaviors
- **Interactive** — drag to move, click to make it jump, hover for speech bubbles
- **Settings panel** — switch styles, themes, adjust size, customize phrases, set reminders
- **Skeletal animation** — pose-based animation system with tween easing (60fps)

## Visual Styles

| Style | Preview | Description |
|-------|---------|-------------|
| Realistic | 🐱 | Watercolor storybook style — pear body, swan neck, big eyes, paw pads, fluffy tail |
| Robot | 🤖 | Cyber lucky cat — porcelain shell, OLED face, gold joints, neon accents |
| Block | 🧱 | LEGO brick — 3D bricks, top studs, multi-color assembly, slope brick ears |
| Demon | 👿 | Shadow dragon — long snout, vertical slit pupils, jagged teeth, wing membrane |

## Themes

| Theme | Palette |
|-------|---------|
| Orange | Classic orange tabby |
| Black | Sleek dark coat |
| White | Clean white with blue eyes |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- Windows 10+ (transparent frameless window depends on Win32 APIs)

### Install & Run

```powershell
# Clone the repo
git clone https://github.com/renzhenghui0814-pixel/desktop-pet.git
cd desktop-pet

# Install dependencies
npm install

# Launch with the script (recommended)
.\pet.ps1

# Or launch manually
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
npx electron .
```

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
| Speech bubble | Hover over the pet, or wait for auto-meow |
| Reminders | Set time+message in settings — pet will show at center of screen |

## Project Structure

```
desktop-pet/
├── main.js                  # Electron main process
├── preload.js               # Main window preload (IPC bridge)
├── preload-settings.js      # Settings window preload
├── index.html               # Main window (pet renderer)
├── settings.html            # Settings panel (separate window)
├── settings.js              # Settings panel logic
├── styles.css               # Main window styles
├── pet.ps1                  # Start/stop script
└── src/
    ├── app.js               # Application entry point
    ├── constants.js         # Colors, themes, phrases, sizing
    ├── engine/
    │   ├── AnimationLoop.js    # rAF loop with error isolation
    │   ├── Easing.js           # Easing function library
    │   ├── Skeleton.js         # Skeleton definitions & pose keyframes
    │   └── StateMachine.js     # Pet state machine (idle/walk/sleep/...)
    ├── cat/
    │   └── CatRenderer.js      # Renderer facade with caching
    ├── pets/
    │   ├── index.js            # Pet registry (petType → petStyle → class)
    │   └── cat/
    │       ├── Realistic.js    # Watercolor storybook cat
    │       ├── Robot.js        # Cyber lucky cat
    │       ├── Block.js        # LEGO brick cat
    │       └── Demon.js        # Shadow dragon
    ├── behaviors/
    │   └── PatrolBehavior.js   # Screen edge perimeter patrol
    ├── interaction/
    │   ├── MouseTracker.js     # Mouse hover/drag/click detection
    │   └── SpeechBubble.js     # Canvas speech bubble rendering
    └── utils/
        ├── Colors.js           # Color manipulation helpers
        ├── Random.js           # Random number utilities
        └── ScreenBounds.js     # Multi-display screen bounds
```

## Tech Stack

- **Runtime**: Electron 25.x
- **Rendering**: Canvas2D (off-screen + on-screen double buffering)
- **Animation**: Skeletal pose system + tween easing (60fps rAF loop)
- **Window**: Transparent, frameless, always-on-top, toolbar type
- **Security**: contextIsolation + preload-based IPC bridges
- **State**: localStorage for persistence (scale, style, theme, phrases, reminders)

## Known Issues

- Windows disk cache permission warning on startup (system limitation, harmless)
- Bubble font size may need manual refresh after scale slider change
- Block style legs use hardcoded Y offset (148px), other renderers use relative skeleton positions

## License

MIT

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
