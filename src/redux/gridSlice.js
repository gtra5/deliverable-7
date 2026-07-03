import { createSlice } from '@reduxjs/toolkit';

export const GRID_SIZE = 12;
export const DEFAULT_TILE = 'grass';

/**
 * Builds a fresh NxN matrix. Each cell is a self-describing object rather
 * than a bare string, so any future consumer (minimap, save/export, undo
 * history) can read coordinates directly off the cell without re-deriving
 * them from array indices.
 */
const buildInitialGrid = () =>
  Array.from({ length: GRID_SIZE }, (_, y) =>
    Array.from({ length: GRID_SIZE }, (_, x) => ({
      x,
      y,
      tileType: DEFAULT_TILE,
    }))
  );

const initialState = {
  matrix: buildInitialGrid(),
  // Lightweight history counter — demonstrates that Redux, not Context,
  // owns anything tied to the mutable data model (undo/redo, autosave, etc).
  lastAction: null,
};

/**
 * Classic 4-directional flood fill (BFS) used by fillMap.
 * Mutates a plain matrix copy in place — safe because Immer (used
 * internally by createSlice) already gives us a draft we can mutate.
 */
function floodFill(matrix, startX, startY, targetType, replacementType) {
  if (targetType === replacementType) return;

  const stack = [[startX, startY]];
  const visited = new Set();

  while (stack.length) {
    const [x, y] = stack.pop();
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) continue;

    const cell = matrix[y][x];
    if (cell.tileType !== targetType) continue;

    visited.add(key);
    cell.tileType = replacementType;

    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }
}

const gridSlice = createSlice({
  name: 'grid',
  initialState,
  reducers: {
    /**
     * Updates a single cell. Used by both 'draw' and 'erase' tools —
     * the *type* being written is decided by the caller (see GridCanvas),
     * which reads the active tool/tile straight out of EditorContext.
     */
    updateTile: (state, action) => {
      const { x, y, tileType } = action.payload;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return;
      state.matrix[y][x].tileType = tileType;
      state.lastAction = `updateTile(${x}, ${y} -> ${tileType})`;
    },

    /** Resets every cell back to the default tile type. */
    clearMap: (state) => {
      state.matrix = buildInitialGrid();
      state.lastAction = 'clearMap';
    },

    /** Bucket-fill: replaces the connected region sharing the clicked cell's type. */
    fillMap: (state, action) => {
      const { x, y, tileType } = action.payload;
      if (x < 0 || y < 0 || x >= GRID_SIZE || y >= GRID_SIZE) return;
      const targetType = state.matrix[y][x].tileType;
      floodFill(state.matrix, x, y, targetType, tileType);
      state.lastAction = `fillMap(${x}, ${y} -> ${tileType})`;
    },
  },
});

export const { updateTile, clearMap, fillMap } = gridSlice.actions;
export default gridSlice.reducer;
