import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useEditor, TOOLS, TILE_TYPES } from '../context/EditorContext';
import { clearMap } from '../redux/gridSlice';
import { SquarePen, Eraser, PaintBucket, Pencil, Trash2 } from 'lucide-react';
import ColorEditorModal from './ColorEditorModal';

const TOOL_META = [
  { id: TOOLS.DRAW,  label: 'Draw',  icon: SquarePen   },
  { id: TOOLS.ERASE, label: 'Erase', icon: Eraser      },
  { id: TOOLS.FILL,  label: 'Fill',  icon: PaintBucket },
];

const TILE_META = [
  { id: TILE_TYPES.GRASS,     label: 'Grass'      },
  { id: TILE_TYPES.WATER,     label: 'Water'      },
  { id: TILE_TYPES.WALL,      label: 'Wall'       },
  { id: TILE_TYPES.LAVA,      label: 'Lava'       },
  { id: TILE_TYPES.SAND,      label: 'Sand'       },
  { id: TILE_TYPES.FOREST,    label: 'Forest'     },
  { id: TILE_TYPES.MOUNTAIN,  label: 'Mountain'   },
  { id: TILE_TYPES.SNOW,      label: 'Snow'       },
  { id: TILE_TYPES.ICE,       label: 'Ice'        },
  { id: TILE_TYPES.SWAMP,     label: 'Swamp'      },
  { id: TILE_TYPES.MUD,       label: 'Mud'        },
  { id: TILE_TYPES.ROAD,      label: 'Road'       },
  { id: TILE_TYPES.BRIDGE,    label: 'Bridge'     },
  { id: TILE_TYPES.CAVE,      label: 'Cave'       },
  { id: TILE_TYPES.CRYSTAL,   label: 'Crystal'    },
  { id: TILE_TYPES.POISON,    label: 'Poison'     },
  { id: TILE_TYPES.ASH,       label: 'Ash'        },
  { id: TILE_TYPES.DEEPWATER, label: 'Deep Water' },
  { id: TILE_TYPES.DESERT,    label: 'Desert'     },
  { id: TILE_TYPES.VOLCANIC,  label: 'Volcanic'   },
];

// ─── Shared content ──────────────────────────────────────────────────────────

function ToolbarContent({ onClose }) {
  const {
    activeTool, setActiveTool,
    selectedTileType, setSelectedTileType,
    showGridLines, toggleGridLines,
    getTileColor, setTileColor,
    recentColors,
  } = useEditor();

  const dispatch    = useDispatch();
  const [editingTile, setEditingTile] = useState(null);

  const handleSave = (hex) => {
    setTileColor(editingTile, hex);
    setEditingTile(null);
  };

  return (
    <>
      <div className="flex flex-col h-full gap-4 overflow-hidden">

        {/* ── Tools ── */}
        <div className="shrink-0">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-2"
            style={{ color: 'var(--q-muted)' }}
          >
            Tool
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {TOOL_META.map(({ id, label, icon: Icon }) => {
              const active = activeTool === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTool(id)}
                  aria-pressed={active}
                  className="flex flex-col items-center justify-center gap-1.5 rounded-lg py-3 text-xs font-medium transition"
                  style={{
                    backgroundColor: active ? 'var(--q-violet)' : 'var(--q-haiti-lite)',
                    color:           active ? 'var(--q-chalk)'  : 'var(--q-muted)',
                    boxShadow:       active ? `0 0 0 2px var(--q-violet-dim)` : 'none',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--q-border)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--q-haiti-lite)'; }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tile Types ── */}
        <div className="flex flex-col min-h-0 flex-1">
          <h2
            className="text-xs font-semibold uppercase tracking-wider mb-2 shrink-0"
            style={{ color: 'var(--q-muted)' }}
          >
            Tile Type
          </h2>
          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 scrollbar-thin">
            {TILE_META.map((tile) => {
              const color  = getTileColor(tile.id);
              const active = selectedTileType === tile.id;
              return (
                <div
                  key={tile.id}
                  className="group flex items-center gap-2 rounded-lg px-2 py-2 transition"
                  style={{
                    backgroundColor: active ? 'var(--q-haiti-lite)' : 'transparent',
                    boxShadow:       active ? `0 0 0 2px var(--q-violet)` : 'none',
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'var(--q-haiti-lite)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <button
                    type="button"
                    onClick={() => { setSelectedTileType(tile.id); onClose?.(); }}
                    aria-pressed={active}
                    className="flex items-center gap-2 flex-1 text-sm font-medium text-left min-w-0"
                    style={{ color: active ? 'var(--q-chalk)' : 'var(--q-muted)' }}
                  >
                    <span
                      className="h-4 w-4 rounded shrink-0"
                      style={{ backgroundColor: color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.25)' }}
                    />
                    <span className="truncate">{tile.label}</span>
                  </button>

                  {/* Edit color pencil — always shown on touch, hover-only on pointer */}
                  <button
                    type="button"
                    onClick={() => setEditingTile(tile.id)}
                    aria-label={`Edit color for ${tile.label}`}
                    className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition rounded p-0.5 shrink-0 touch-manipulation"
                    style={{ color: 'var(--q-muted)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--q-violet)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--q-muted)'; }}
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Grid Lines ── */}
        <div className="flex items-center justify-between shrink-0">
          <label
            htmlFor="grid-lines"
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--q-muted)' }}
          >
            Grid Lines
          </label>
          <button
            id="grid-lines"
            type="button"
            role="switch"
            aria-checked={showGridLines}
            onClick={toggleGridLines}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ backgroundColor: showGridLines ? 'var(--q-violet)' : 'var(--q-haiti-lite)' }}
          >
            <span
              className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full shadow transition-transform"
              style={{
                backgroundColor: 'var(--q-chalk)',
                transform: showGridLines ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>

        {/* ── Clear Map ── */}
        <button
          type="button"
          onClick={() => { dispatch(clearMap()); onClose?.(); }}
          className="shrink-0 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition"
          style={{ backgroundColor: 'var(--q-haiti-lite)', color: '#f87171', border: '1px solid #7f1d1d' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#450a0a'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--q-haiti-lite)'; }}
        >
          <Trash2 size={14} />
          Clear Map
        </button>
      </div>

      {/* Color Editor Modal */}
      {editingTile && (
        <ColorEditorModal
          tileName={TILE_META.find((t) => t.id === editingTile)?.label ?? editingTile}
          initialColor={getTileColor(editingTile)}
          recentColors={recentColors}
          onSave={handleSave}
          onClose={() => setEditingTile(null)}
        />
      )}
    </>
  );
}

// ─── Toolbar shell ────────────────────────────────────────────────────────────

export default function Toolbar({ drawerOpen, onDrawerClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex w-64 shrink-0 p-4 flex-col overflow-hidden"
        style={{
          backgroundColor: 'var(--q-haiti-mid)',
          borderRight: '1px solid var(--q-border)',
        }}
      >
        <ToolbarContent />
      </aside>

      {/* Mobile / tablet bottom drawer */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex flex-col rounded-t-2xl transition-transform duration-300 ease-in-out"
        style={{
          backgroundColor: 'var(--q-haiti-mid)',
          borderTop: '1px solid var(--q-border)',
          maxHeight: '80vh',
          transform: drawerOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
        aria-hidden={!drawerOpen}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: 'var(--q-border)' }} />
        </div>
        <div className="px-4 pb-6 pt-2 flex flex-col overflow-hidden flex-1 min-h-0">
          <ToolbarContent onClose={onDrawerClose} />
        </div>
      </div>
    </>
  );
}
