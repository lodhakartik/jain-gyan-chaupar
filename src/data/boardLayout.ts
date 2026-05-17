import type { BoardShape } from "../types/game";
import lokShape from "./lokShape.json";
import { BOARD_SIZE } from "./board";

// Row "spec" — how many cells sit to the LEFT and to the RIGHT of the central gap.
// For classic mode the gap is suppressed (hasGap=false) and right is 0, so cells just fill left.
export interface RowSpec {
  left: number;
  right: number;
}

export const CLASSIC_ROWS: RowSpec[] = Array.from({ length: 12 }, () => ({ left: 7, right: 0 }));

// Edit src/data/lokShape.json to reshape the Lok board — rows array, top → bottom.
export const LOK_ROWS: RowSpec[] = (lokShape.rows as [number, number][]).map(
  ([left, right]) => ({ left, right }),
);

if (import.meta.env.DEV) {
  const sum = LOK_ROWS.reduce((acc, r) => acc + r.left + r.right, 0);
  if (sum !== BOARD_SIZE) {
    console.warn(
      `[lokShape.json] cells sum to ${sum}, expected ${BOARD_SIZE}. ` +
        `Adjust rows so every left+right totals ${BOARD_SIZE}.`,
    );
  }
  for (const r of LOK_ROWS) {
    if (!Number.isInteger(r.left) || !Number.isInteger(r.right) || r.left < 0 || r.right < 0) {
      console.warn(`[lokShape.json] every row entry must be [nonNegInt, nonNegInt].`);
      break;
    }
  }
}

export interface BoardLayout {
  shape: BoardShape;
  rows: RowSpec[];      // top → bottom
  hasGap: boolean;      // true if there's a vertical empty column down the middle
  gapCol: number;       // column index of the gap (only meaningful if hasGap)
  width: number;        // total grid columns (including the gap if any)
  height: number;       // rows.length
  totalSquares: number;
  rowCells: (row: number) => number;
  squareToCell: (square: number) => { row: number; col: number };
  squareToXY: (square: number) => { x: number; y: number };
}

const cache = new Map<BoardShape, BoardLayout>();

export function getLayout(shape: BoardShape): BoardLayout {
  const cached = cache.get(shape);
  if (cached) return cached;
  const layout = buildLayout(shape);
  cache.set(shape, layout);
  return layout;
}

// Effective grid span occupied by a row, including the central gap column when
// present. A row with exactly one cell (left + right == 1) collapses to a single
// centred column — the cell sits IN the gap column, no left/right split.
function rowSpan(r: RowSpec, hasGap: boolean): number {
  const cells = r.left + r.right;
  if (cells === 1 && hasGap) return 1;
  return cells + (hasGap ? 1 : 0);
}

function buildLayout(shape: BoardShape): BoardLayout {
  const rows = shape === "lok" ? LOK_ROWS : CLASSIC_ROWS;
  const hasGap = shape === "lok";
  const height = rows.length;
  const width = Math.max(...rows.map((r) => rowSpan(r, hasGap)));
  const gapCol = hasGap ? Math.floor(width / 2) : -1;
  const totalSquares = rows.reduce((a, r) => a + r.left + r.right, 0);

  // For a row, compute the absolute column for the i-th cell in its left→right order
  // (i ranges 0..left+right-1). The gap column is skipped when i >= left, except
  // for single-cell rows which sit directly IN the gap column.
  const colOf = (r: number, i: number): number => {
    const spec = rows[r];
    const cells = spec.left + spec.right;
    if (cells === 1 && hasGap) return gapCol;
    const span = cells + (hasGap ? 1 : 0);
    const leftEdge = Math.round((width - span) / 2);
    if (i < spec.left) return leftEdge + i;
    // i is on the right side. Skip the gap if present.
    return leftEdge + spec.left + (hasGap ? 1 : 0) + (i - spec.left);
  };

  // Boustrophedon: bottom row → LTR; row above → RTL; etc.
  const squareToCellMap = new Map<number, { row: number; col: number }>();
  let sq = 1;
  for (let rFromBottom = 0; rFromBottom < height; rFromBottom++) {
    const row = height - 1 - rFromBottom;
    const spec = rows[row];
    const cellCount = spec.left + spec.right;
    const leftToRight = rFromBottom % 2 === 0;
    for (let step = 0; step < cellCount; step++) {
      const i = leftToRight ? step : cellCount - 1 - step;
      squareToCellMap.set(sq, { row, col: colOf(row, i) });
      sq++;
    }
  }

  const squareToCell = (square: number) => {
    const cell = squareToCellMap.get(square);
    if (!cell) throw new Error(`Square ${square} out of layout (totalSquares=${totalSquares})`);
    return cell;
  };

  const squareToXY = (square: number) => {
    const { row, col } = squareToCell(square);
    return { x: col + 0.5, y: row + 0.5 };
  };

  const rowCells = (row: number) => rows[row].left + rows[row].right;

  return { shape, rows, hasGap, gapCol, width, height, totalSquares, rowCells, squareToCell, squareToXY };
}
