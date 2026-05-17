import type { BoardLayout } from "../data/boardLayout";

interface LokRegionsProps {
  layout: BoardLayout;
  gx: (x: number) => number;
  gy: (y: number) => number;
}

// Three-Lok annotation glyphs rendered in the empty left gutter of the Lok
// Purusha silhouette. Each glyph clusters a small symbolic icon plus a leader
// line pointing into the silhouette body at the corresponding y-coordinate.
//
// - Urdhva Lok (devloka): tiered heaven lines + Siddhashila crescent on top.
// - Madhya Lok (manushya): Mt. Meru triangle, a tree, and a sun — the realm of
//   humans, animals, and plants.
// - Adho Lok (naraka): seven darkening bands representing the seven hells.
export default function LokRegions({ layout, gx, gy }: LokRegionsProps) {
  // Anchor y-coordinates in grid units, balanced against the silhouette body.
  const urdhvaY = Math.max(2.5, layout.height * 0.15);
  const madhyaY = layout.height * 0.5;
  const adhoY = Math.min(layout.height - 2.5, layout.height * 0.85);
  // Glyphs render in the LEFT gutter — negative grid x lands in PAD_LEFT space.
  const glyphX = -1.5;

  return (
    <g className="lok-regions" opacity="0.85">
      {/* Urdhva Lok — devloka tiers + Siddhashila crescent */}
      <g transform={`translate(${gx(glyphX)}, ${gy(urdhvaY)})`}>
        {/* Siddhashila crescent — abode of liberated souls, above all heavens */}
        <path
          d="M -0.5 -0.8 A 0.5 0.5 0 0 0 0.5 -0.8 L 0.5 -0.85 L -0.5 -0.85 Z"
          fill="#C8A14B"
        />
        {/* Tiered devloka lines — narrowing as they rise */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={-0.6 + i * 0.05}
            y1={-0.55 + i * 0.15}
            x2={0.6 - i * 0.05}
            y2={-0.55 + i * 0.15}
            stroke="#7A1D1D"
            strokeWidth="0.05"
            strokeLinecap="round"
          />
        ))}
        {/* Leader line from glyph right edge into silhouette body */}
        <line
          x1="0.7"
          y1="0"
          x2="1.5"
          y2="0"
          stroke="#3A1F0E"
          strokeWidth="0.04"
          opacity="0.5"
          strokeDasharray="0.1 0.1"
        />
        {/* Labels */}
        <text
          x="0"
          y="0.55"
          textAnchor="middle"
          fontSize="0.32"
          fontFamily="Cinzel, serif"
          fill="#7A1D1D"
        >
          Urdhva
        </text>
        <text
          x="0"
          y="0.9"
          textAnchor="middle"
          fontSize="0.26"
          fontFamily="Cinzel, serif"
          fill="#3A1F0E"
          opacity="0.7"
        >
          Devloka
        </text>
      </g>

      {/* Madhya Lok — Mt. Meru + tree + sun (humans, animals, plants) */}
      <g transform={`translate(${gx(glyphX)}, ${gy(madhyaY)})`}>
        {/* Mt. Meru triangle — the cosmic axis at the centre of Madhyalok */}
        <path d="M -0.3 0.2 L 0 -0.4 L 0.3 0.2 Z" fill="#8C6A1F" opacity="0.85" />
        {/* Tree (trunk + canopy) — flora and fauna of the human realm */}
        <line x1="0" y1="0.2" x2="0" y2="0.5" stroke="#3A1F0E" strokeWidth="0.06" />
        <circle cx="0" cy="0.15" r="0.18" fill="#2f6a3a" />
        {/* Sun — jyotishka deva, lighting Madhyalok */}
        <circle cx="-0.6" cy="-0.3" r="0.12" fill="#D97706" />
        {/* Leader line */}
        <line
          x1="0.7"
          y1="0"
          x2="1.5"
          y2="0"
          stroke="#3A1F0E"
          strokeWidth="0.04"
          opacity="0.5"
          strokeDasharray="0.1 0.1"
        />
        {/* Labels */}
        <text
          x="0"
          y="0.95"
          textAnchor="middle"
          fontSize="0.32"
          fontFamily="Cinzel, serif"
          fill="#7A1D1D"
        >
          Madhya
        </text>
        <text
          x="0"
          y="1.3"
          textAnchor="middle"
          fontSize="0.26"
          fontFamily="Cinzel, serif"
          fill="#3A1F0E"
          opacity="0.7"
        >
          Manushya
        </text>
      </g>

      {/* Adho Lok — seven naraka bands, darkening as they descend */}
      <g transform={`translate(${gx(glyphX)}, ${gy(adhoY)})`}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const opacity = 0.35 + i * 0.09;
          const width = 0.8 + i * 0.05;
          return (
            <rect
              key={i}
              x={-width / 2}
              y={-0.35 + i * 0.11}
              width={width}
              height="0.08"
              fill="#7A1D1D"
              opacity={opacity}
              rx="0.02"
            />
          );
        })}
        {/* Leader line */}
        <line
          x1="0.7"
          y1="0"
          x2="1.5"
          y2="0"
          stroke="#3A1F0E"
          strokeWidth="0.04"
          opacity="0.5"
          strokeDasharray="0.1 0.1"
        />
        {/* Labels */}
        <text
          x="0"
          y="0.95"
          textAnchor="middle"
          fontSize="0.32"
          fontFamily="Cinzel, serif"
          fill="#7A1D1D"
        >
          Adho
        </text>
        <text
          x="0"
          y="1.3"
          textAnchor="middle"
          fontSize="0.26"
          fontFamily="Cinzel, serif"
          fill="#3A1F0E"
          opacity="0.7"
        >
          Naraka
        </text>
      </g>
    </g>
  );
}
