import { useEffect, useMemo, type ReactNode } from "react";
import type { BoardLayout } from "../data/boardLayout";
import { useLokEditor, type SilhouetteCorner } from "../store/lokEditorStore";
import LokSilhouetteEditor from "./LokSilhouetteEditor";
import lokSilhouetteJson from "../data/lokSilhouette.json";

// Frozen, hand-tuned silhouette corners (right side, top → bottom). When present
// they replace the auto-computed Lok shape as the editor's baseline.
const FROZEN_CORNERS: SilhouetteCorner[] | null =
  Array.isArray(lokSilhouetteJson.corners) && lokSilhouetteJson.corners.length >= 2
    ? (lokSilhouetteJson.corners as SilhouetteCorner[])
    : null;

// Decorative Lok Purusha frame around the variable-row grid.
//
// Padding (in grid units) reserves room outside the grid for the silhouette to
// extend beyond. Side labels and the apex marker have been removed for the
// kids' edition, so the top padding can be tight against the apex.
export const PAD_TOP = 0.6;
export const PAD_BOTTOM = 0.6;
export const PAD_X = 0.6;

export default function LokFrame({
  layout,
  children,
}: {
  layout: BoardLayout;
  children: ReactNode;
}) {
  const W = layout.width + 2 * PAD_X;
  const H = layout.height + PAD_TOP + PAD_BOTTOM;

  // Map grid coords (where row 0 = top of grid, col 0 = left of grid) into SVG coords.
  // Grid origin (0, 0) → SVG (PAD_X, PAD_TOP).
  const gx = (gridX: number) => gridX + PAD_X;
  const gy = (gridY: number) => gridY + PAD_TOP;

  // Baseline right-side corners. Prefer the frozen JSON; fall back to the auto-
  // computed shape if the file is missing or empty.
  const autoCorners = useMemo(
    () => (layout.shape === "lok" && FROZEN_CORNERS ? FROZEN_CORNERS : computeRightCorners(layout)),
    [layout],
  );

  const editorEnabled = useLokEditor((s) => s.enabled);
  const editorCorners = useLokEditor((s) => s.corners);
  const setEditorCorners = useLokEditor((s) => s.setCorners);
  const imageUrl = useLokEditor((s) => s.imageUrl);
  const imageOpacity = useLokEditor((s) => s.imageOpacity);
  const imageX = useLokEditor((s) => s.imageX);
  const imageY = useLokEditor((s) => s.imageY);
  const imageWidth = useLokEditor((s) => s.imageWidth);
  const imageAspect = useLokEditor((s) => s.imageNaturalAspect);

  // First time the editor turns on without saved corners, snapshot the auto ones.
  // Also discard any stored corners that no longer fit this layout — that happens
  // when layout.width changes (e.g. row redistribution), so old coordinates
  // would render the silhouette off-grid.
  useEffect(() => {
    if (!editorEnabled) return;
    const stale =
      editorCorners &&
      editorCorners.some((c) => c.x < 0 || c.x > layout.width || c.y < -1 || c.y > layout.height + 2);
    if (!editorCorners || stale) setEditorCorners(autoCorners);
  }, [editorEnabled, editorCorners, autoCorners, setEditorCorners, layout.width, layout.height]);

  const activeCorners = editorEnabled && editorCorners ? editorCorners : autoCorners;
  const silhouette = buildSilhouettePath(activeCorners, layout, gx, gy, 0.18);

  // CSS grid block position inside the frame (percent of W × H).
  const gridLeftPct = (PAD_X / W) * 100;
  const gridTopPct = (PAD_TOP / H) * 100;
  const gridWidthPct = (layout.width / W) * 100;
  const gridHeightPct = (layout.height / H) * 100;

  // Image display height keeps natural aspect ratio.
  const imageHeight = imageWidth > 0 && imageAspect > 0 ? imageWidth / imageAspect : 0;

  return (
    <div className="relative w-full" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <defs>
          <linearGradient id="lokSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#dbeafe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fde68a" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Background tracing image — only visible while the editor is on */}
        {editorEnabled && imageUrl && imageWidth > 0 && (
          <image
            href={imageUrl}
            x={gx(imageX)}
            y={gy(imageY)}
            width={imageWidth}
            height={imageHeight}
            opacity={imageOpacity}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* The Lok Purusha silhouette */}
        <path
          d={silhouette}
          fill="url(#lokSky)"
          stroke="#1e3a8a"
          strokeWidth="0.08"
          strokeLinejoin="round"
        />

        {/* Trasanadi — narrow vertical channel down the centre */}
        {layout.hasGap && (
          <line
            x1={gx(layout.gapCol + 0.5)}
            y1={gy(0)}
            x2={gx(layout.gapCol + 0.5)}
            y2={gy(layout.height)}
            stroke="#a8261c"
            strokeWidth="0.05"
            strokeDasharray="0.25 0.18"
            opacity="0.55"
          />
        )}

      </svg>

      {/* The grid block, positioned to land exactly inside the silhouette */}
      <div
        className="absolute z-10"
        style={{
          left: `${gridLeftPct}%`,
          top: `${gridTopPct}%`,
          width: `${gridWidthPct}%`,
          height: `${gridHeightPct}%`,
        }}
      >
        {children}
      </div>

      {/* Drag handles + add/remove logic — only mounted while the editor is on */}
      {editorEnabled && (
        <LokSilhouetteEditor layout={layout} autoCorners={autoCorners} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pure helpers — exported so the editor can reuse the same geometry.
// ---------------------------------------------------------------------------

function rowSpanOf(layout: BoardLayout, r: number): number {
  const row = layout.rows[r];
  const cells = row.left + row.right;
  if (cells === 1 && layout.hasGap) return 1;
  return cells + (layout.hasGap ? 1 : 0);
}

export function leftEdgeOf(layout: BoardLayout, r: number): number {
  return (layout.width - rowSpanOf(layout, r)) / 2;
}
export function rightEdgeOf(layout: BoardLayout, r: number): number {
  return (layout.width + rowSpanOf(layout, r)) / 2;
}

// Compute the auto right-side corners — the same five-point Lok shape we had,
// but returned as a pure array so the editor can take it as its starting point.
export function computeRightCorners(layout: BoardLayout): SilhouetteCorner[] {
  const n = layout.height;
  const rEs: number[] = [];
  for (let r = 0; r < n; r++) rEs.push(rightEdgeOf(layout, r));

  const waist = findValleyRun(rEs);
  const waistStart = waist?.start ?? -1;
  const waistEnd = waist?.end ?? -1;
  const minRE = waist?.val ?? Math.min(...rEs);

  let upperRow = -1;
  let upperRE = -Infinity;
  for (let r = 0; r < Math.max(waistStart, 0); r++) {
    if (rEs[r] > upperRE) { upperRE = rEs[r]; upperRow = r; }
  }

  let lowerRow = -1;
  let lowerRE = -Infinity;
  for (let r = waistEnd + 1; r < n; r++) {
    if (rEs[r] > lowerRE) { lowerRE = rEs[r]; lowerRow = r; }
  }

  const right: SilhouetteCorner[] = [];
  right.push({ x: rEs[0], y: 0 });

  if (upperRow >= 0) {
    const yEnd = upperRow + 1;
    let X1 = upperRE;
    for (let r = 1; r <= upperRow; r++) {
      const required = rEs[0] + ((rEs[r] - rEs[0]) * yEnd) / r;
      if (required > X1) X1 = required;
    }
    right.push({ x: X1, y: yEnd });

    if (waistStart > upperRow) {
      const yBeg = upperRow + 1;
      const yEnd2 = waistStart + 1;
      const xEnd = minRE;
      let xBeg = right[right.length - 1].x;
      for (let r = upperRow + 1; r <= waistStart; r++) {
        const t = (r + 1 - yBeg) / (yEnd2 - yBeg);
        if (t > 0 && t < 1) {
          const required = (rEs[r] - xEnd * t) / (1 - t);
          if (required > xBeg) xBeg = required;
        }
      }
      right[right.length - 1].x = xBeg;
      right.push({ x: xEnd, y: yEnd2 });
    }
  }

  if (waistEnd - 1 > waistStart) {
    right.push({ x: minRE, y: waistEnd });
  }

  if (lowerRow >= 0) {
    const yBeg = Math.max(waistEnd, 0);
    const yEnd = n;
    let X2 = lowerRE;
    for (let r = yBeg + 1; r < n; r++) {
      const required = minRE + ((rEs[r] - minRE) * (yEnd - yBeg)) / (r - yBeg);
      if (required > X2) X2 = required;
    }
    right.push({ x: X2, y: yEnd });
  } else {
    right.push({ x: minRE, y: n });
  }

  return right;
}

// Build the closed SVG path string from the right-side corners. The left side is
// mirrored across the vertical centreline (W/2). Outward padding O makes the
// outline breathe a little around the cells. corner[0] defines the apex (top
// edge); corner[last] defines the foot (bottom edge). All corners participate —
// dragging the first corner in the editor moves the apex, dragging the last
// moves the feet.
export function buildSilhouettePath(
  rightCorners: SilhouetteCorner[],
  layout: BoardLayout,
  gx: (x: number) => number,
  gy: (y: number) => number,
  O: number,
): string {
  const W = layout.width;
  const apex = rightCorners[0];
  const foot = rightCorners[rightCorners.length - 1];

  const pts: [number, number][] = [];
  // Top edge across the apex.
  pts.push([gx(W - apex.x) - O, gy(apex.y) - O]);
  pts.push([gx(apex.x) + O, gy(apex.y) - O]);
  // Intermediate right-side corners (between apex and foot).
  for (let i = 1; i < rightCorners.length - 1; i++) {
    pts.push([gx(rightCorners[i].x) + O, gy(rightCorners[i].y)]);
  }
  // Bottom edge across the foot.
  pts.push([gx(foot.x) + O, gy(foot.y) + O]);
  pts.push([gx(W - foot.x) - O, gy(foot.y) + O]);
  // Intermediate left-side corners back up to the apex.
  for (let i = rightCorners.length - 2; i >= 1; i--) {
    pts.push([gx(W - rightCorners[i].x) - O, gy(rightCorners[i].y)]);
  }
  return "M " + pts.map(([x, y]) => `${x.toFixed(3)} ${y.toFixed(3)}`).join(" L ") + " Z";
}

function findValleyRun(
  vals: number[],
): { start: number; end: number; val: number } | null {
  const n = vals.length;
  if (n === 0) return null;
  let best: { start: number; end: number; val: number } | null = null;
  let curStart = 0;
  let curVal = vals[0];
  for (let r = 1; r <= n; r++) {
    if (r === n || vals[r] !== curVal) {
      const leftVal = curStart > 0 ? vals[curStart - 1] : Infinity;
      const rightVal = r < n ? vals[r] : Infinity;
      if (curVal < leftVal && curVal < rightVal) {
        const candidate = { start: curStart, end: r - 1, val: curVal };
        if (!best || candidate.end - candidate.start > best.end - best.start) {
          best = candidate;
        }
      }
      if (r < n) {
        curStart = r;
        curVal = vals[r];
      }
    }
  }
  return best;
}

