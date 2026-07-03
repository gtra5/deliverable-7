import { createContext, useContext, useMemo, useState, useCallback } from 'react';

export const TOOLS = {
  DRAW: 'draw',
  ERASE: 'erase',
  FILL: 'fill',
};

export const TILE_TYPES = {
  GRASS:     'grass',
  WATER:     'water',
  WALL:      'wall',
  LAVA:      'lava',
  SAND:      'sand',
  FOREST:    'forest',
  MOUNTAIN:  'mountain',
  SNOW:      'snow',
  ICE:       'ice',
  SWAMP:     'swamp',
  MUD:       'mud',
  ROAD:      'road',
  BRIDGE:    'bridge',
  CAVE:      'cave',
  CRYSTAL:   'crystal',
  POISON:    'poison',
  ASH:       'ash',
  DEEPWATER: 'deepwater',
  DESERT:    'desert',
  VOLCANIC:  'volcanic',
};

// Default colors for every tile type
export const DEFAULT_TILE_COLORS = {
  grass:     '#10b981',
  water:     '#0ea5e9',
  wall:      '#78716c',
  lava:      '#ea580c',
  sand:      '#facc15',
  forest:    '#15803d',
  mountain:  '#4b5563',
  snow:      '#f1f5f9',
  ice:       '#67e8f9',
  swamp:     '#3f6212',
  mud:       '#92400e',
  road:      '#a3a3a3',
  bridge:    '#92400e',
  cave:      '#27272a',
  crystal:   '#e879f9',
  poison:    '#9333ea',
  ash:       '#404040',
  deepwater: '#1e40af',
  desert:    '#fdba74',
  volcanic:  '#b91c1c',
};

const EditorContext = createContext(undefined);

/**
 * EditorContext owns "session configuration" — the equivalent of a painting
 * app's toolbar state. It never touches the grid matrix itself. This keeps
 * every re-render triggered by, say, toggling grid lines, scoped to the
 * toolbar/canvas-styling consumers instead of cascading into Redux-connected
 * tile components.
 */
export function EditorProvider({ children }) {
  const [activeTool, setActiveTool] = useState(TOOLS.DRAW);
  const [selectedTileType, setSelectedTileType] = useState(TILE_TYPES.GRASS);
  const [showGridLines, setShowGridLines] = useState(true);
  
  // Custom colors per tile (overrides defaults)
  const [tileColors, setTileColors] = useState({});
  
  // Recent color history (max 8 entries)
  const [recentColors, setRecentColors] = useState([]);

  const toggleGridLines = useCallback(() => setShowGridLines((prev) => !prev), []);

  // Update a tile's color and track in recent
  const setTileColor = useCallback((tileType, color) => {
    setTileColors((prev) => ({ ...prev, [tileType]: color }));
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  }, []);

  // Get effective color (custom or default)
  const getTileColor = useCallback(
    (tileType) => tileColors[tileType] ?? DEFAULT_TILE_COLORS[tileType] ?? '#10b981',
    [tileColors]
  );

  // Memoize the context value so consumers that only care about one field
  // (e.g. GridCanvas reading showGridLines) don't re-render every time an
  // unrelated field changes due to a brand-new object reference.
  const value = useMemo(
    () => ({
      activeTool,
      setActiveTool,
      selectedTileType,
      setSelectedTileType,
      showGridLines,
      toggleGridLines,
      tileColors,
      setTileColor,
      getTileColor,
      recentColors,
    }),
    [activeTool, selectedTileType, showGridLines, toggleGridLines, tileColors, setTileColor, getTileColor, recentColors]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

/** Guarded consumer hook — fails loudly if used outside the provider tree. */
export function useEditor() {
  const ctx = useContext(EditorContext);
  if (ctx === undefined) {
    throw new Error('useEditor must be used within an <EditorProvider>');
  }
  return ctx;
}
