import { memo } from 'react';
import { useSelector } from 'react-redux';
import { useEditor } from '../context/EditorContext';

/**
 * Each Tile subscribes to ONLY its own cell in the Redux store via a
 * per-cell selector, and is wrapped in React.memo. This means clicking one
 * cell re-renders exactly one <Tile>, not all 144 — critical once the grid
 * grows past a trivial size or drag-painting fires updateTile rapidly.
 */
function Tile({ x, y, showGridLines, onPointerDown, onPointerEnter }) {
  const tileType  = useSelector((state) => state.grid.matrix[y][x].tileType);
  const { getTileColor } = useEditor();

  const base = getTileColor(tileType);

  return (
    <div
      role="button"
      aria-label={`Tile ${x}, ${y}: ${tileType}`}
      onPointerDown={() => onPointerDown(x, y)}
      onPointerEnter={() => onPointerEnter(x, y)}
      onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.2)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = ''; }}
      style={{ backgroundColor: base }}
      className={`aspect-square select-none cursor-pointer transition-all duration-75
        ${showGridLines ? 'border border-slate-950/40' : ''}`}
    />
  );
}

// No custom comparator — React.memo's default shallow prop compare is correct
// here. tileType is read via useSelector inside the component, so Redux
// handles that re-render path independently of memo.
export default memo(Tile);
