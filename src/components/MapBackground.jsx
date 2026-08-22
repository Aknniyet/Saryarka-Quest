// Original stylised terrain illustration used as the interactive map's backdrop.
// Coordinates are in a 0-100 (x) by 0-100 (y) unit space matching place.coords percentages.

const hillClusters = [
  { cx: 60, cy: 55, r: 16 },
  { cx: 22, cy: 58, r: 13 },
  { cx: 66, cy: 62, r: 11 },
  { cx: 63, cy: 42, r: 10 },
  { cx: 48, cy: 20, r: 12 },
  { cx: 42, cy: 16, r: 9 },
];

const lakeBlobs = [
  { cx: 42, cy: 38, rx: 6, ry: 3.4, rot: -10 },
  { cx: 50, cy: 22, rx: 4.5, ry: 2.6, rot: 8 },
  { cx: 44, cy: 18, rx: 3.6, ry: 2.1, rot: -6 },
  { cx: 30, cy: 20, rx: 4.2, ry: 2.3, rot: 12 },
  { cx: 67, cy: 41, rx: 2.6, ry: 1.6, rot: 0 },
  { cx: 37, cy: 64, rx: 2.2, ry: 1.4, rot: 5 },
];

function Hachures({ cx, cy, r }) {
  const lines = [];
  const rows = 5;
  for (let i = 0; i < rows; i++) {
    const yOff = -r * 0.6 + (i * (r * 1.2)) / rows;
    const width = Math.sqrt(Math.max(r * r - yOff * yOff, 0)) * 1.15;
    if (width < 1) continue;
    lines.push(
      <path
        key={i}
        d={`M ${cx - width} ${cy + yOff} Q ${cx} ${cy + yOff - width * 0.18} ${cx + width} ${cy + yOff}`}
        stroke="var(--color-steppe)"
        strokeWidth="0.35"
        fill="none"
        opacity={0.28 - i * 0.02}
        strokeLinecap="round"
      />
    );
  }
  return <g>{lines}</g>;
}

export default function MapBackground({ questRoute = [] }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <rect x="0" y="0" width="100" height="100" fill="var(--color-cream)" />
      <rect x="0" y="0" width="100" height="100" fill="url(#grain)" opacity="0.5" />

      {/* subtle contour rings for texture */}
      {[...Array(6)].map((_, i) => (
        <circle key={i} cx={15 + i * 16} cy={8 + (i % 3) * 4} r={2 + (i % 2)} fill="none" stroke="var(--color-sand)" strokeWidth="0.15" opacity="0.25" />
      ))}

      {hillClusters.map((h, i) => (
        <Hachures key={i} {...h} />
      ))}

      {lakeBlobs.map((l, i) => (
        <ellipse
          key={i}
          cx={l.cx}
          cy={l.cy}
          rx={l.rx}
          ry={l.ry}
          transform={`rotate(${l.rot} ${l.cx} ${l.cy})`}
          fill="var(--color-lake-light)"
          stroke="var(--color-lake)"
          strokeWidth="0.25"
          opacity="0.75"
        />
      ))}

      {questRoute.length > 1 && (
        <polyline
          points={questRoute.map((p) => `${p[0]},${p[1]}`).join(" ")}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="0.45"
          strokeDasharray="1.4 1.4"
          strokeLinecap="round"
          opacity="0.7"
        />
      )}
    </svg>
  );
}
