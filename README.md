# Level Editor — Deliverable 7

A browser-based 12×12 tile-map editor built with React 19, Redux Toolkit, and Tailwind CSS v4. Paint, erase, and flood-fill a grid using 20 terrain types, customise every tile's colour with a built-in colour editor, and toggle grid lines on or off — all with full responsive support across desktop, tablet, and mobile.

---

## Tech Stack

| Tool          | Version | Role                     |
| ------------- | ------- | ------------------------ |
| React         | 19      | UI framework             |
| Redux Toolkit | 2       | Grid state management    |
| react-redux   | 9       | React bindings for Redux |
| Tailwind CSS  | 4       | Utility-first styling    |
| Vite          | 8       | Dev server and bundler   |
| lucide-react  | latest  | Icon library             |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## Project Structure

```
src/
├── App.jsx                     # Root layout, drawer state
├── main.jsx                    # React DOM entry point
├── index.css                   # Global styles, Quantus CSS variables, scrollbar/slider overrides
│
├── components/
│   ├── Header.jsx              # Top bar — logo, active tool pill, active brush pill
│   ├── Toolbar.jsx             # Sidebar (desktop) / bottom drawer (mobile) — tools, tiles, grid toggle, clear
│   ├── GridCanvas.jsx          # Painting canvas — pointer event handling, renders 144 Tile cells
│   ├── Tile.jsx                # Individual grid cell — subscribes to its own Redux slice, memo-wrapped
│   └── ColorEditorModal.jsx    # Per-tile colour editor — colour wheel, flat sliders, HEX/RGB inputs
│
├── context/
│   └── EditorContext.jsx       # Session UI state — active tool, selected tile, grid lines, tile colour overrides
│
└── redux/
    ├── store.js                # Redux store configuration
    └── gridSlice.js            # Grid matrix state — updateTile, fillMap, clearMap reducers
```

---

## Architecture: Why Two State Systems?

The project uses **Redux** and **React Context** side by side for intentionally different purposes.

### Redux — the grid matrix

Redux owns the 12×12 tile matrix. This data is:

- **Frequently mutated** — drag-painting fires `updateTile` on every pointer-enter event
- **Read by many components** — every `Tile` component independently subscribes to its own cell
- **The source of truth for the map** — flood fill, clear, and any future undo/redo all operate here

`gridSlice.js` defines three reducers:

- `updateTile(x, y, tileType)` — paints or erases a single cell
- `fillMap(x, y, tileType)` — BFS flood fill across all connected cells sharing the same type
- `clearMap()` — resets every cell back to grass

### React Context — editor session config

`EditorContext` owns everything that is toolbar state, not map data:

- `activeTool` — draw, erase, or fill
- `selectedTileType` — the tile currently loaded into the brush
- `showGridLines` — whether the grid border is visible
- `tileColors` — per-tile colour overrides (what the colour editor saves into)
- `recentColors` — last 8 colours saved, shown in the colour editor

Context is the right choice here because these values change infrequently and only need to reach toolbar and header components, not every tile on the grid.

---

## Components

### `App.jsx`

Composes the two providers and manages `drawerOpen` state for the mobile toolbar drawer. The Redux Provider wraps the entire tree so any deeply nested Tile can dispatch. The EditorProvider is scoped inside because it is editor-screen-only UI config.

### `Header.jsx`

Displays the app logo, a hamburger button (visible only on mobile/tablet, hidden on desktop), an active-tool status pill, and a brush colour pill that shows the live colour of the currently selected tile type.

### `Toolbar.jsx`

Renders two layouts from the same content component (`ToolbarContent`):

- **Desktop (lg+)**: Fixed left sidebar, always visible
- **Mobile/tablet**: Bottom sheet drawer that slides up when the hamburger is tapped, with a drag handle at the top

Contains three sections:

1. **Tool selector** — Draw, Erase, Fill buttons
2. **Tile type list** — 20 terrain types with colour swatches; scrollable; each row has a pencil icon that opens the Colour Editor for that tile
3. **Grid Lines toggle** + **Clear Map** button at the bottom

### `GridCanvas.jsx`

Renders the 12×12 grid using CSS Grid. Handles all pointer events at the container level:

- `onPointerDown` — starts painting, sets `isPointerDown` ref
- `onPointerEnter` on each tile — drag-paints if pointer is held (fill tool is excluded from drag)
- `onPointerUp` / `onPointerLeave` — stops painting

The grid width is set with `min(calc(100vw - 1.5rem), calc(100vh - 8rem), 600px)` so it fits any screen without overflowing.

### `Tile.jsx`

Each tile is a `React.memo`-wrapped component that:

- Reads **only its own cell** from Redux via `useSelector((state) => state.grid.matrix[y][x].tileType)` — so only the painted cell re-renders, never all 144
- Reads its display colour from `EditorContext` via `getTileColor(tileType)` — so custom colours from the colour editor are reflected immediately
- Uses `onMouseEnter`/`onMouseLeave` with `filter: brightness(1.2)` for hover feedback without any pre-generated hover colours

### `ColorEditorModal.jsx`

A per-tile colour editor that opens as a bottom sheet on mobile and a centred modal on desktop. Features:

- **Colour wheel** — canvas-drawn HSL wheel; click or drag to pick hue and saturation; updates live with the lightness value
- **Lightness slider** — flat solid-colour track (Electric Violet fill, Turbo thumb) — no CSS gradients
- **Opacity slider** — same flat design, controls alpha channel
- **HEX input** — 6-character editable field that syncs bidirectionally with the wheel
- **R / G / B number inputs** — all sync with each other and with the wheel
- **Go Random** — generates a random hex colour and applies it everywhere
- **Recent colours** — up to 8 previously saved colours shown as clickable swatches
- **Save** — writes the colour to `EditorContext` via `setTileColor`; the toolbar swatch and all tiles of that type on the canvas re-render instantly

---

## Tile Types (20)

| Tile       | Default Colour |
| ---------- | -------------- |
| Grass      | `#10b981`      |
| Water      | `#0ea5e9`      |
| Wall       | `#78716c`      |
| Lava       | `#ea580c`      |
| Sand       | `#facc15`      |
| Forest     | `#15803d`      |
| Mountain   | `#4b5563`      |
| Snow       | `#f1f5f9`      |
| Ice        | `#67e8f9`      |
| Swamp      | `#3f6212`      |
| Mud        | `#92400e`      |
| Road       | `#a3a3a3`      |
| Bridge     | `#92400e`      |
| Cave       | `#27272a`      |
| Crystal    | `#e879f9`      |
| Poison     | `#9333ea`      |
| Ash        | `#404040`      |
| Deep Water | `#1e40af`      |
| Desert     | `#fdba74`      |
| Volcanic   | `#b91c1c`      |

All defaults can be overridden per-session using the Colour Editor (hover a tile row → pencil icon).

---

## Design System — Quantus Palette 2025

All UI colours are defined as CSS custom properties in `index.css` and applied via inline `style` props (not Tailwind class strings) to guarantee they are never dropped by Tailwind's JIT scanner.

| Variable         | Hex       | Name            | Usage                                      |
| ---------------- | --------- | --------------- | ------------------------------------------ |
| `--q-violet`     | `#B34DFB` | Electric Violet | Primary accent, active states, slider fill |
| `--q-violet-dim` | `#9a35e8` | —               | Hover variant of violet                    |
| `--q-turbo`      | `#F0E100` | Turbo           | Slider thumb, logo accent tile             |
| `--q-haiti`      | `#18102B` | Haiti           | Deepest background                         |
| `--q-haiti-mid`  | `#1f1535` | —               | Header and sidebar background              |
| `--q-haiti-lite` | `#2a1d47` | —               | Card, input, and button backgrounds        |
| `--q-border`     | `#3a2660` | —               | All borders and dividers                   |
| `--q-chalk`      | `#F5F3FF` | Blue Chalk      | Primary text                               |
| `--q-muted`      | `#9980c4` | —               | Secondary/label text                       |

---

## Responsiveness

| Breakpoint    | Toolbar                                                | Canvas                          |
| ------------- | ------------------------------------------------------ | ------------------------------- |
| Mobile (< lg) | Hidden; opened as bottom sheet via hamburger in header | Full width minus padding        |
| Tablet (< lg) | Same as mobile                                         | Full width minus padding        |
| Desktop (lg+) | Fixed 256px left sidebar, always visible               | Remaining flex space, max 600px |

The mobile backdrop (tapping outside the drawer closes it) is a full-screen overlay rendered in `App.jsx` only when the drawer is open.

---

## Key Implementation Decisions

**Why inline `style` props for tile colours instead of Tailwind classes?**
Tailwind's JIT compiler scans source files at build time for complete class strings. Dynamically constructed strings like `bg-${color}` are never seen by the scanner, so the CSS is never generated. Inline hex values via `style={{ backgroundColor: hex }}` are immune to this.

**Why `React.memo` without a custom comparator on `Tile`?**
A custom comparator was initially used but caused a bug — it excluded `onPointerDown` and `onPointerEnter` from comparison, and since `tileType` comes from `useSelector` rather than props, the component never re-rendered after Redux updates. The default shallow comparator with `useSelector` is the correct combination.

**Why BFS flood fill instead of DFS?**
BFS (queue/visited set) avoids call-stack overflow on large connected regions and visits each cell exactly once. Immer (used internally by Redux Toolkit's `createSlice`) allows direct mutation of the draft state inside reducers, so the fill algorithm can mutate `cell.tileType` directly without returning a new object.

**Why clear the Vite cache after installing react-redux?**
Vite pre-bundles dependencies into `node_modules/.vite` on first run. Installing a package after the cache is built can leave React resolving to two different module instances — one for the app, one for the new package — which produces the `Cannot read properties of null (reading 'useMemo')` hook crash. Deleting `node_modules/.vite` forces a clean re-bundle.
#   d e l i v e r a b l e - 7 
 
 
