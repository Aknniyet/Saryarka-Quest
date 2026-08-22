// Generates a small original illustrated "landscape" scene used in place of photography.
// Kept abstract & consistent with the brand's illustrated-map aesthetic rather than stock photos.

const PALETTES = {
  nature: { sky: "#EAF1DE", far: "#A9C48C", near: "#5B8A44", accent: "#F6E4B4" },
  lake: { sky: "#E4F2F4", far: "#8FC1CC", near: "#2E7488", accent: "#FBF8F1" },
  history: { sky: "#FAF0DE", far: "#D9B77E", near: "#B07A3B", accent: "#7A5C9E" },
  archaeology: { sky: "#F1EBF7", far: "#C6AEDD", near: "#7A5C9E", accent: "#D6A339" },
};

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export default function Illustration({ seed = "default", category = "nature", icon, className = "" }) {
  const pal = PALETTES[category] || PALETTES.nature;
  const h = hashSeed(seed);
  const peak1 = 40 + (h % 20);
  const peak2 = 55 + ((h >> 3) % 25);
  const sunX = 20 + (h % 60);
  const showWater = category === "lake" || (h % 3 === 0 && category !== "archaeology");

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: pal.sky }}>
      <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <circle cx={sunX * 3} cy="38" r="16" fill={pal.accent} opacity="0.9" />
        <path d={`M0,${120} Q75,${120 - peak2 * 0.6} 150,${110} T300,${118} V200 H0 Z`} fill={pal.far} opacity="0.85" />
        {showWater && (
          <path d={`M0,150 Q40,145 80,150 T160,150 T240,148 T300,150 V200 H0 Z`} fill={category === "lake" ? "#3E90A6" : pal.far} opacity="0.5" />
        )}
        <path d={`M0,${170 - peak1 * 0.4} Q60,${140 - peak1 * 0.5} 130,${165} T300,${160} V200 H0 Z`} fill={pal.near} />
        {category === "archaeology" && (
          <g opacity="0.9">
            <ellipse cx="150" cy="168" rx="46" ry="10" fill={pal.accent} opacity="0.35" />
            <rect x="128" y="140" width="10" height="30" rx="2" fill={pal.near} />
            <rect x="148" y="132" width="10" height="38" rx="2" fill={pal.near} />
            <rect x="168" y="144" width="10" height="26" rx="2" fill={pal.near} />
          </g>
        )}
        {category !== "archaeology" && (
          <g opacity="0.55">
            <path d="M40,170 q4,-18 0,-30" stroke={pal.near} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M40,150 q10,-6 14,-14" stroke={pal.near} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M40,155 q-10,-4 -15,-12" stroke={pal.near} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M255,175 q4,-16 0,-27" stroke={pal.near} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M255,157 q9,-5 13,-12" stroke={pal.near} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>
      {icon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="drop-shadow-sm text-5xl">{icon}</span>
        </div>
      )}
    </div>
  );
}
