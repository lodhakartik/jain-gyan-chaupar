import { useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { BoardLayout } from "../data/boardLayout";
import { useLokEditor, type SilhouetteCorner } from "../store/lokEditorStore";
import { PAD_BOTTOM, PAD_TOP, PAD_X } from "./LokFrame";

interface Props {
  layout: BoardLayout;
  autoCorners: SilhouetteCorner[];
}

// Drag-and-edit overlay for the Lok silhouette. Renders draggable circles at
// every right-side corner (plus mirrored read-only markers on the left), an
// image-tracing background, and a floating control panel.
export default function LokSilhouetteEditor({ layout, autoCorners }: Props) {
  const corners = useLokEditor((s) => s.corners) ?? autoCorners;
  const snap = useLokEditor((s) => s.snapToGrid);
  const updateCorner = useLokEditor((s) => s.updateCorner);
  const addCornerAfter = useLokEditor((s) => s.addCornerAfter);
  const removeCorner = useLokEditor((s) => s.removeCorner);
  const resetCorners = useLokEditor((s) => s.resetCorners);
  const setEnabled = useLokEditor((s) => s.setEnabled);
  const toggleSnap = useLokEditor((s) => s.toggleSnap);

  const setImage = useLokEditor((s) => s.setImage);
  const setImageOpacity = useLokEditor((s) => s.setImageOpacity);
  const setImageTransform = useLokEditor((s) => s.setImageTransform);
  const imageUrl = useLokEditor((s) => s.imageUrl);
  const imageOpacity = useLokEditor((s) => s.imageOpacity);
  const imageX = useLokEditor((s) => s.imageX);
  const imageY = useLokEditor((s) => s.imageY);
  const imageWidth = useLokEditor((s) => s.imageWidth);
  const imageAspect = useLokEditor((s) => s.imageNaturalAspect);

  const W = layout.width + 2 * PAD_X;
  const H = layout.height + PAD_TOP + PAD_BOTTOM;

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Convert a pointer event (client coords) to grid coords.
  const eventToGrid = (e: { clientX: number; clientY: number }): SilhouetteCorner => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const u = (e.clientX - rect.left) / rect.width;
    const v = (e.clientY - rect.top) / rect.height;
    const xFrame = u * W;
    const yFrame = v * H;
    let gx = xFrame - PAD_X;
    let gy = yFrame - PAD_TOP;
    if (snap) {
      gx = Math.round(gx * 2) / 2;
      gy = Math.round(gy * 2) / 2;
    }
    return { x: gx, y: gy };
  };

  const [dragKind, setDragKind] = useState<
    { kind: "corner"; index: number; side: "right" | "left" }
    | { kind: "image" }
    | null
  >(null);
  const dragStartRef = useRef<{ gx: number; gy: number; imgX: number; imgY: number } | null>(null);

  const handleCornerPointerDown = (
    e: ReactPointerEvent<SVGCircleElement>,
    index: number,
    side: "right" | "left",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as SVGCircleElement).setPointerCapture(e.pointerId);
    setDragKind({ kind: "corner", index, side });
  };

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragKind) return;
    const g = eventToGrid(e);
    if (dragKind.kind === "corner") {
      // Apex (i=0) and final foot (last) are constrained to the centre/edge
      // visually we still let users move them.
      const xRight = dragKind.side === "right" ? g.x : layout.width - g.x;
      updateCorner(dragKind.index, { x: xRight, y: g.y });
    } else if (dragKind.kind === "image" && dragStartRef.current) {
      const dx = g.x - dragStartRef.current.gx;
      const dy = g.y - dragStartRef.current.gy;
      setImageTransform(
        dragStartRef.current.imgX + dx,
        dragStartRef.current.imgY + dy,
        imageWidth,
      );
    }
  };

  const handlePointerUp = () => {
    setDragKind(null);
    dragStartRef.current = null;
  };

  // Double-click on a corner deletes it (unless it's one of the last 2).
  const handleCornerDblClick = (index: number) => {
    if (corners.length <= 2) return;
    removeCorner(index);
  };

  // Double-click on a segment adds a corner there.
  const handleSegmentDblClick = (index: number) => {
    addCornerAfter(index);
  };

  // Image upload — read file as DataURL and store with aspect ratio.
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const aspect = img.naturalWidth / img.naturalHeight;
        setImage(dataUrl, aspect);
        if (imageWidth === 0) {
          // Auto-fit to the grid width on first upload.
          setImageTransform(0, 0, layout.width);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleImagePointerDown = (e: ReactPointerEvent<SVGRectElement>) => {
    if (!imageUrl) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as SVGRectElement).setPointerCapture(e.pointerId);
    const g = eventToGrid(e);
    dragStartRef.current = { gx: g.x, gy: g.y, imgX: imageX, imgY: imageY };
    setDragKind({ kind: "image" });
  };

  const copyJSON = async () => {
    const payload = {
      corners: corners.map((c) => ({
        x: round(c.x, 4),
        y: round(c.y, 4),
      })),
    };
    const text = JSON.stringify(payload, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copy this JSON:", text);
    }
  };

  // Geometry for handles in SVG (frame) coords.
  const toFrame = (c: SilhouetteCorner) => ({ x: c.x + PAD_X, y: c.y + PAD_TOP });
  const leftCorners = corners.map((c) => ({ x: layout.width - c.x, y: c.y }));

  const imageHeight = imageWidth > 0 && imageAspect > 0 ? imageWidth / imageAspect : 0;

  return (
    <>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full z-20"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        {/* Invisible drag-zone over the image so the user can reposition it. */}
        {imageUrl && imageWidth > 0 && (
          <rect
            x={imageX + PAD_X}
            y={imageY + PAD_TOP}
            width={imageWidth}
            height={imageHeight}
            fill="transparent"
            style={{ cursor: "move", pointerEvents: "auto" }}
            onPointerDown={handleImagePointerDown}
          />
        )}

        {/* Dotted edges so segments are easy to click between handles. */}
        {[corners, leftCorners].map((side, sideIdx) => (
          <g key={sideIdx}>
            {side.slice(0, -1).map((c, i) => {
              const a = toFrame(c);
              const b = toFrame(side[i + 1]);
              const isRight = sideIdx === 0;
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#a8261c"
                  strokeWidth="0.04"
                  strokeDasharray="0.18 0.12"
                  opacity={0.7}
                  style={{ cursor: "copy", pointerEvents: isRight ? "auto" : "none" }}
                  onDoubleClick={() => isRight && handleSegmentDblClick(i)}
                />
              );
            })}
          </g>
        ))}

        {/* Right-side corners — fully editable. */}
        {corners.map((c, i) => {
          const p = toFrame(c);
          return (
            <circle
              key={`r${i}`}
              cx={p.x}
              cy={p.y}
              r={0.28}
              fill="#a8261c"
              stroke="#fff"
              strokeWidth="0.06"
              style={{ cursor: "grab", pointerEvents: "auto" }}
              onPointerDown={(e) => handleCornerPointerDown(e, i, "right")}
              onDoubleClick={() => handleCornerDblClick(i)}
            >
              <title>Drag to move • Double-click to delete</title>
            </circle>
          );
        })}

        {/* Mirrored left-side handles — also draggable; the right side stays the source of truth. */}
        {leftCorners.map((c, i) => {
          const p = toFrame(c);
          return (
            <circle
              key={`l${i}`}
              cx={p.x}
              cy={p.y}
              r={0.24}
              fill="#fff"
              stroke="#a8261c"
              strokeWidth="0.07"
              style={{ cursor: "grab", pointerEvents: "auto" }}
              onPointerDown={(e) => handleCornerPointerDown(e, i, "left")}
              onDoubleClick={() => handleCornerDblClick(i)}
            >
              <title>Mirrored handle — drag to move (right side updates)</title>
            </circle>
          );
        })}
      </svg>

      {/* Floating control panel */}
      <div className="absolute top-2 right-2 z-30 w-60 bg-parchment/95 backdrop-blur border border-ink/15 rounded-lg shadow-lg p-3 text-xs space-y-2 pointer-events-auto">
        <div className="flex items-center justify-between">
          <div className="font-display font-bold text-crimson">Edit Lok Shape</div>
          <button
            onClick={() => setEnabled(false)}
            className="text-ink/60 hover:text-ink"
            title="Close editor"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1">
          <div className="text-ink/70">
            <strong>Drag</strong> the red dots. <strong>Double-click</strong> a dot to
            delete, a segment to add.
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={snap}
            onChange={toggleSnap}
            className="accent-crimson"
          />
          <span>Snap to half-cell grid</span>
        </label>

        <div className="border-t border-ink/10 pt-2 space-y-2">
          <div className="font-semibold text-ink/80">Tracing image</div>
          <label className="block">
            <span className="sr-only">Upload image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-[11px] file:mr-2 file:px-2 file:py-1 file:rounded file:border-0 file:bg-crimson file:text-parchment hover:file:bg-crimson/90"
            />
          </label>
          {imageUrl && (
            <>
              <label className="block">
                <span className="text-ink/70">Opacity: {(imageOpacity * 100).toFixed(0)}%</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={imageOpacity}
                  onChange={(e) => setImageOpacity(Number(e.target.value))}
                  className="w-full accent-crimson"
                />
              </label>
              <label className="block">
                <span className="text-ink/70">Width: {imageWidth.toFixed(1)} cells</span>
                <input
                  type="range"
                  min={1}
                  max={layout.width * 2}
                  step={0.1}
                  value={imageWidth}
                  onChange={(e) =>
                    setImageTransform(imageX, imageY, Number(e.target.value))
                  }
                  className="w-full accent-crimson"
                />
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setImageTransform(0, 0, layout.width)}
                  className="flex-1 px-2 py-1 rounded bg-ink/10 hover:bg-ink/20 text-ink/80"
                >
                  Fit
                </button>
                <button
                  onClick={() => setImage(null)}
                  className="flex-1 px-2 py-1 rounded bg-ink/10 hover:bg-ink/20 text-ink/80"
                >
                  Remove
                </button>
              </div>
              <div className="text-[10px] text-ink/55 italic">
                Tip: drag the image directly to reposition.
              </div>
            </>
          )}
        </div>

        <div className="border-t border-ink/10 pt-2 flex flex-wrap gap-2">
          <button
            onClick={resetCorners}
            className="flex-1 px-2 py-1 rounded bg-ink/10 hover:bg-ink/20 text-ink/80"
            title="Restore the auto-computed corners"
          >
            Reset
          </button>
          <button
            onClick={copyJSON}
            className="flex-1 px-2 py-1 rounded bg-saffron text-ink font-semibold hover:bg-saffron/90"
            title="Copy current corners as JSON"
          >
            Copy JSON
          </button>
        </div>

        <div className="text-[10px] text-ink/55 italic">
          {corners.length} corners · saved in this browser.
        </div>
      </div>
    </>
  );
}

function round(n: number, digits: number): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}
