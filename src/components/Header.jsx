import { useEditor } from '../context/EditorContext';
import { Menu, X } from 'lucide-react';

export default function Header({ onMenuToggle, drawerOpen }) {
  const { activeTool, selectedTileType, getTileColor } = useEditor();
  const brushColor = getTileColor(selectedTileType);

  return (
    <header
      className="flex items-center justify-between px-4 py-2.5 md:px-6 md:py-3 shrink-0"
      style={{
        backgroundColor: 'var(--q-haiti-mid)',
        borderBottom: '1px solid var(--q-border)',
      }}
    >
      {/* Left: hamburger + brand */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={drawerOpen}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg transition"
          style={{ color: 'var(--q-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--q-chalk)'; e.currentTarget.style.backgroundColor = 'var(--q-haiti-lite)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--q-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          {drawerOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Logo: 2×2 tile grid with Turbo accent */}
        <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0">
          <rect x="0"  y="0"  width="8" height="8" rx="1.5" fill="var(--q-haiti-lite)" />
          <rect x="10" y="0"  width="8" height="8" rx="1.5" fill="var(--q-haiti-lite)" />
          <rect x="0"  y="10" width="8" height="8" rx="1.5" fill="var(--q-haiti-lite)" />
          <rect x="10" y="10" width="8" height="8" rx="1.5" fill="var(--q-turbo)" />
        </svg>

        <h1 className="text-sm font-bold tracking-tight" style={{ color: 'var(--q-chalk)' }}>
          Level Editor
          <span className="ml-2 font-mono text-xs font-normal hidden sm:inline" style={{ color: 'var(--q-muted)' }}>
            12×12
          </span>
        </h1>
      </div>

      {/* Right: status pills */}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        {/* Tool pill */}
        <span
          className="flex items-center gap-1.5 rounded-full px-2 py-1 md:px-2.5"
          style={{ border: '1px solid var(--q-border)', backgroundColor: 'var(--q-haiti)' }}
        >
          <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: 'var(--q-violet)' }} />
          <span className="hidden sm:inline" style={{ color: 'var(--q-muted)' }}>tool</span>
          <span className="font-medium capitalize" style={{ color: 'var(--q-chalk)' }}>{activeTool}</span>
        </span>

        {/* Brush pill */}
        <span
          className="flex items-center gap-1.5 rounded-full px-2 py-1 md:px-2.5"
          style={{ border: '1px solid var(--q-border)', backgroundColor: 'var(--q-haiti)' }}
        >
          <span
            className="h-2.5 w-2.5 rounded-sm shrink-0"
            style={{ backgroundColor: brushColor, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)' }}
          />
          <span className="hidden sm:inline" style={{ color: 'var(--q-muted)' }}>brush</span>
          <span className="font-medium capitalize max-w-[80px] truncate" style={{ color: 'var(--q-chalk)' }}>
            {selectedTileType}
          </span>
        </span>
      </div>
    </header>
  );
}
