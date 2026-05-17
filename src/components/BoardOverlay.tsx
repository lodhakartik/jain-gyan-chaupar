import { ladders, snakes } from "../data/board";
import type { BoardLayout } from "../data/boardLayout";
import type { Severity } from "../types/game";

type Pt = { x: number; y: number };

const SNAKE_PALETTE: Record<Severity, string[]> = {
  small: ["#15803d", "#0f766e", "#65a30d"],
  medium: ["#854d0e", "#a16207", "#b45309"],
  big: ["#7f1d1d", "#581c87", "#1e3a8a"],
};

const SNAKE_WIDTH: Record<Severity, number> = {
  small: 0.13,
  medium: 0.18,
  big: 0.24,
};

const SNAKE_HEAD_R: Record<Severity, number> = {
  small: 0.13,
  medium: 0.17,
  big: 0.22,
};

const LADDER_RAIL_W: Record<Severity, number> = {
  small: 0.06,
  medium: 0.08,
  big: 0.1,
};

const LADDER_OFFSET: Record<Severity, number> = {
  small: 0.13,
  medium: 0.17,
  big: 0.21,
};

const RUNG_W: Record<Severity, number> = {
  small: 0.035,
  medium: 0.045,
  big: 0.055,
};

export default function BoardOverlay({ layout }: { layout: BoardLayout }) {
  const pt = (square: number): Pt => layout.squareToXY(square);
  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ overflow: "visible" }}
    >
      {ladders.map((l) => (
        <Ladder key={`L${l.from}`} from={pt(l.from)} to={pt(l.to)} severity={l.severity} />
      ))}
      {snakes.map((s, i) => {
        const palette = SNAKE_PALETTE[s.severity];
        const color = palette[i % palette.length];
        return (
          <Snake
            key={`S${s.from}`}
            from={pt(s.from)}
            to={pt(s.to)}
            color={color}
            severity={s.severity}
          />
        );
      })}
    </svg>
  );
}

function Ladder({ from, to, severity }: { from: Pt; to: Pt; severity: Severity }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const off = LADDER_OFFSET[severity];

  const ax1 = from.x + px * off;
  const ay1 = from.y + py * off;
  const ax2 = to.x + px * off;
  const ay2 = to.y + py * off;
  const bx1 = from.x - px * off;
  const by1 = from.y - py * off;
  const bx2 = to.x - px * off;
  const by2 = to.y - py * off;

  const rungs = Math.max(3, Math.floor(len * 1.6));
  const rungEls = [];
  for (let i = 1; i < rungs; i++) {
    const t = i / rungs;
    rungEls.push(
      <line
        key={i}
        x1={ax1 + (ax2 - ax1) * t}
        y1={ay1 + (ay2 - ay1) * t}
        x2={bx1 + (bx2 - bx1) * t}
        y2={by1 + (by2 - by1) * t}
        stroke="#92400e"
        strokeWidth={RUNG_W[severity]}
        strokeLinecap="round"
      />
    );
  }

  const railW = LADDER_RAIL_W[severity];
  return (
    <g opacity={0.95}>
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke="#a16207" strokeWidth={railW} strokeLinecap="round" />
      <line x1={bx1} y1={by1} x2={bx2} y2={by2} stroke="#a16207" strokeWidth={railW} strokeLinecap="round" />
      <line x1={ax1} y1={ay1} x2={ax2} y2={ay2} stroke="#fcd34d" strokeWidth={railW * 0.3} strokeLinecap="round" />
      <line x1={bx1} y1={by1} x2={bx2} y2={by2} stroke="#fcd34d" strokeWidth={railW * 0.3} strokeLinecap="round" />
      {rungEls}
    </g>
  );
}

function Snake({
  from,
  to,
  color,
  severity,
}: {
  from: Pt;
  to: Pt;
  color: string;
  severity: Severity;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;

  // Curve scales with path length so short verticals look like tight squiggles, not exaggerated S's.
  const baseAmp = severity === "big" ? 0.42 : severity === "medium" ? 0.32 : 0.22;
  const curveAmt = Math.min(1.0, baseAmp * Math.min(1.4, 0.55 + len * 0.45));
  const c1x = from.x + dx * 0.3 + px * curveAmt;
  const c1y = from.y + dy * 0.3 + py * curveAmt;
  const c2x = from.x + dx * 0.7 - px * curveAmt;
  const c2y = from.y + dy * 0.7 - py * curveAmt;

  const path = `M ${from.x} ${from.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${to.x} ${to.y}`;

  // Tangent at start for head orientation
  const tx = c1x - from.x;
  const ty = c1y - from.y;
  const tlen = Math.hypot(tx, ty) || 1;
  const fwdX = tx / tlen;
  const fwdY = ty / tlen;
  const epx = -fwdY;
  const epy = fwdX;

  const bodyW = SNAKE_WIDTH[severity];
  const headR = SNAKE_HEAD_R[severity];
  const eyeR = headR * 0.25;
  const pupilR = headR * 0.11;

  return (
    <g>
      <path d={path} stroke="#1f2937" strokeWidth={bodyW + 0.05} strokeLinecap="round" fill="none" opacity={0.35} />
      <path d={path} stroke={color} strokeWidth={bodyW} strokeLinecap="round" fill="none" />
      <path d={path} stroke="#fef3c7" strokeWidth={bodyW * 0.28} strokeLinecap="round" fill="none" opacity={0.55} />
      {severity !== "small" && (
        <path
          d={path}
          stroke="#1f2937"
          strokeWidth={bodyW * 0.18}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${bodyW * 0.45} ${bodyW * 1.05}`}
          opacity={0.45}
        />
      )}

      {/* tongue */}
      <path
        d={`M ${from.x - fwdX * headR * 0.4} ${from.y - fwdY * headR * 0.4}
            L ${from.x - fwdX * (headR + 0.18) + epx * 0.05} ${from.y - fwdY * (headR + 0.18) + epy * 0.05}
            M ${from.x - fwdX * headR * 0.4} ${from.y - fwdY * headR * 0.4}
            L ${from.x - fwdX * (headR + 0.18) - epx * 0.05} ${from.y - fwdY * (headR + 0.18) - epy * 0.05}`}
        stroke="#dc2626"
        strokeWidth={0.024}
        strokeLinecap="round"
        fill="none"
      />

      {/* head */}
      <circle cx={from.x} cy={from.y} r={headR} fill={color} stroke="#1f2937" strokeWidth={0.025} />
      <circle cx={from.x + epx * headR * 0.45 + fwdX * headR * 0.25} cy={from.y + epy * headR * 0.45 + fwdY * headR * 0.25} r={eyeR} fill="#fffbeb" />
      <circle cx={from.x - epx * headR * 0.45 + fwdX * headR * 0.25} cy={from.y - epy * headR * 0.45 + fwdY * headR * 0.25} r={eyeR} fill="#fffbeb" />
      <circle cx={from.x + epx * headR * 0.45 + fwdX * headR * 0.25} cy={from.y + epy * headR * 0.45 + fwdY * headR * 0.25} r={pupilR} fill="#000" />
      <circle cx={from.x - epx * headR * 0.45 + fwdX * headR * 0.25} cy={from.y - epy * headR * 0.45 + fwdY * headR * 0.25} r={pupilR} fill="#000" />

      {/* tail */}
      <circle cx={to.x} cy={to.y} r={bodyW * 0.35} fill={color} />
    </g>
  );
}
