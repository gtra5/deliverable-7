import { useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useEditor, TOOLS, TILE_TYPES } from '../context/EditorContext';
import { updateTile, fillMap, GRID_SIZE } from '../redux/gridSlice';
import Tile from './Tile';

export default function GridCanvas() {
  const { activeTool, selectedTileType, showGridLines } = useEditor();
  const dispatch = useDispatch();
  const isPointerDown = useRef(false);

  const applyToolAt = useCallback(
    (x, y) => {
      if (activeTool === TOOLS.FILL) {
        dispatch(fillMap({ x, y, tileType: selectedTileType }));
        return;
      }
      const tileType = activeTool === TOOLS.ERASE ? TILE_TYPES.GRASS : selectedTileType;
      dispatch(updateTile({ x, y, tileType }));
    },
    [activeTool, selectedTileType, dispatch]
  );

  const handlePointerDown = useCallback(
    (x, y) => { isPointerDown.current = true; applyToolAt(x, y); },
    [applyToolAt]
  );

  const handlePointerEnter = useCallback(
    (x, y) => {
      if (!isPointerDown.current || activeTool === TOOLS.FILL) return;
      applyToolAt(x, y);
    },
    [applyToolAt, activeTool]
  );

  const handlePointerUp = useCallback(() => { isPointerDown.current = false; }, []);

  const rows = Array.from({ length: GRID_SIZE }, (_, y) => y);
  const cols = Array.from({ length: GRID_SIZE }, (_, x) => x);

  return (
    <div
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className="flex items-center justify-center flex-1 p-3 sm:p-6 md:p-8 pb-6 lg:pb-8"
      style={{ backgroundColor: 'var(--q-haiti)' }}
    >
      <div
        className="grid gap-0 rounded-xl overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          width: 'min(calc(100vw - 1.5rem), calc(100vh - 8rem), 600px)',
          boxShadow: '0 0 0 2px var(--q-border), 0 25px 50px rgba(24,16,43,0.8)',
        }}
      >
        {rows.map((y) =>
          cols.map((x) => (
            <Tile
              key={`${x}-${y}`}
              x={x}
              y={y}
              showGridLines={showGridLines}
              onPointerDown={handlePointerDown}
              onPointerEnter={handlePointerEnter}
            />
          ))
        )}
      </div>
    </div>
  );
}
