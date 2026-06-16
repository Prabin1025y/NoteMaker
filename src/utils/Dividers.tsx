
// ─── Shared helpers ───────────────────────────────────────────────────────────

interface DividerProps {
  color?: string;
  width?: number | string;
  className?: string;
}

// ─── 1. Floral Scroll (matches image row 1) ───────────────────────────────────
// Classic symmetrical floral ornament with twin scrolls and a top bud

export function FloralScrollDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 60" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 60, overflow: "visible" }}>
        <g stroke={color} fill="none" strokeWidth="1.2">
          {/* Left lines */}
          <line x1="0" y1="28" x2="170" y2="28" />
          <line x1="0" y1="32" x2="155" y2="32" />
          {/* Right lines */}
          <line x1="430" y1="28" x2="600" y2="28" />
          <line x1="445" y1="32" x2="600" y2="32" />
          {/* Top bud */}
          <path d="M300,10 C295,6 290,8 292,13 C294,18 300,16 300,10Z" fill={color} />
          <path d="M300,10 C305,6 310,8 308,13 C306,18 300,16 300,10Z" fill={color} />
          <line x1="300" y1="16" x2="300" y2="24" strokeWidth="1" />
          {/* Left large scroll */}
          <path d="M230,30 C220,18 205,14 195,20 C185,26 188,38 198,40 C208,42 215,34 210,27 C205,20 196,22 197,28" />
          {/* Left small scroll */}
          <path d="M250,28 C245,22 238,21 236,26 C234,31 238,35 243,32" />
          {/* Right large scroll */}
          <path d="M370,30 C380,18 395,14 405,20 C415,26 412,38 402,40 C392,42 385,34 390,27 C395,20 404,22 403,28" />
          {/* Right small scroll */}
          <path d="M350,28 C355,22 362,21 364,26 C366,31 362,35 357,32" />
          {/* Center stem */}
          <path d="M270,30 Q280,20 300,24 Q320,20 330,30" />
          {/* Leaf accents */}
          <path d="M260,32 C255,26 265,22 268,30" fill={color} opacity="0.4" />
          <path d="M340,32 C345,26 335,22 332,30" fill={color} opacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

// ─── 2. Leaf & Vine (matches image row 2) ─────────────────────────────────────

export function LeafVineDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 56" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 56, overflow: "visible" }}>
        <g stroke={color} fill="none" strokeWidth="1.1">
          <line x1="0" y1="28" x2="170" y2="28" />
          <line x1="430" y1="28" x2="600" y2="28" />
          {/* Left sweeping vine */}
          <path d="M170,28 C195,28 205,14 230,22 C250,28 255,28 270,28" strokeWidth="1.5" />
          {/* Right sweeping vine */}
          <path d="M430,28 C405,28 395,14 370,22 C350,28 345,28 330,28" strokeWidth="1.5" />
          {/* Left leaves */}
          <path d="M200,22 C198,12 210,10 212,20Z" fill={color} opacity="0.5" />
          <path d="M218,18 C215,8 228,7 229,17Z" fill={color} opacity="0.4" />
          <path d="M185,25 C180,16 192,14 194,24Z" fill={color} opacity="0.35" />
          {/* Right leaves */}
          <path d="M400,22 C402,12 390,10 388,20Z" fill={color} opacity="0.5" />
          <path d="M382,18 C385,8 372,7 371,17Z" fill={color} opacity="0.4" />
          <path d="M415,25 C420,16 408,14 406,24Z" fill={color} opacity="0.35" />
          {/* Center curl ornament */}
          <path d="M270,28 C275,20 285,16 300,18 C315,16 325,20 330,28" />
          <path d="M283,22 C286,16 293,14 300,15 C307,14 314,16 317,22" strokeWidth="0.8" opacity="0.6" />
          {/* Small dot center */}
          <circle cx="300" cy="28" r="2.5" fill={color} />
        </g>
      </svg>
    </div>
  );
}

// ─── 3. Diamond Chain (matches image row 3) ───────────────────────────────────

export function DiamondChainDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 40" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 40 }}>
        <g stroke={color} fill="none" strokeWidth="1.2">
          <line x1="0" y1="20" x2="230" y2="20" />
          <line x1="370" y1="20" x2="600" y2="20" />
          {/* Outer diamonds */}
          <polygon points="260,20 278,10 296,20 278,30" />
          <polygon points="304,20 322,10 340,20 322,30" />
          {/* Inner diamonds (filled) */}
          <polygon points="268,20 278,13 288,20 278,27" fill={color} opacity="0.15" />
          <polygon points="312,20 322,13 332,20 322,27" fill={color} opacity="0.15" />
          {/* Connector */}
          <line x1="296" y1="20" x2="304" y2="20" />
          <circle cx="300" cy="20" r="2" fill={color} />
          {/* End dots */}
          <circle cx="232" cy="20" r="2.5" fill={color} />
          <circle cx="368" cy="20" r="2.5" fill={color} />
        </g>
      </svg>
    </div>
  );
}

// ─── 4. Swirl Wings (matches image row 4) ─────────────────────────────────────

export function SwirlWingsDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 56" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 56, overflow: "visible" }}>
        <g stroke={color} fill="none" strokeWidth="1.2">
          <line x1="0" y1="28" x2="165" y2="28" />
          <line x1="435" y1="28" x2="600" y2="28" />
          {/* Left wing - sweeping S-curve */}
          <path d="M165,28 C185,28 195,16 215,20 C235,24 240,32 260,30 C275,28 280,26 290,28" strokeWidth="1.5" />
          {/* Left wing accent */}
          <path d="M175,28 C192,28 200,20 216,23 C232,26 238,32 256,30" strokeWidth="0.7" opacity="0.5" />
          {/* Right wing */}
          <path d="M435,28 C415,28 405,16 385,20 C365,24 360,32 340,30 C325,28 320,26 310,28" strokeWidth="1.5" />
          <path d="M425,28 C408,28 400,20 384,23 C368,26 362,32 344,30" strokeWidth="0.7" opacity="0.5" />
          {/* Top pip */}
          <path d="M300,18 C296,12 300,8 300,8 C300,8 304,12 300,18Z" fill={color} />
          {/* Center rosette */}
          <circle cx="300" cy="28" r="5" />
          <circle cx="300" cy="28" r="2.5" fill={color} />
        </g>
      </svg>
    </div>
  );
}

// ─── 5. Curl Ornament (matches image row 5) ───────────────────────────────────

export function CurlOrnamentDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 52" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 52, overflow: "visible" }}>
        <g stroke={color} fill="none" strokeWidth="1.2">
          <line x1="0" y1="26" x2="175" y2="26" />
          <line x1="425" y1="26" x2="600" y2="26" />
          {/* Left curl cluster */}
          <path d="M175,26 C190,26 195,18 205,18 C218,18 220,28 212,32 C204,36 196,30 200,24 C204,18 212,20 210,26" />
          <path d="M195,26 C205,26 208,20 215,20 C222,20 224,27 219,30" />
          {/* Right curl cluster */}
          <path d="M425,26 C410,26 405,18 395,18 C382,18 380,28 388,32 C396,36 404,30 400,24 C396,18 388,20 390,26" />
          <path d="M405,26 C395,26 392,20 385,20 C378,20 376,27 381,30" />
          {/* Center element */}
          <path d="M270,26 C280,14 290,12 300,14 C310,12 320,14 330,26" />
          <path d="M280,26 C287,18 293,16 300,17 C307,16 313,18 320,26" strokeWidth="0.8" opacity="0.5" />
          <circle cx="300" cy="26" r="3" fill={color} />
          <circle cx="300" cy="26" r="6" />
        </g>
      </svg>
    </div>
  );
}

// ─── 6. Lattice Diamond (matches image row 6) ─────────────────────────────────

export function LatticeDiamondDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 44" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 44 }}>
        <g stroke={color} fill="none" strokeWidth="1.1">
          <line x1="0" y1="22" x2="220" y2="22" />
          <line x1="380" y1="22" x2="600" y2="22" />
          {/* Large outer diamond */}
          <polygon points="300,5 340,22 300,39 260,22" />
          {/* Medium mid diamond */}
          <polygon points="300,10 330,22 300,34 270,22" />
          {/* Flanking small diamonds */}
          <polygon points="260,22 272,16 284,22 272,28" />
          <polygon points="340,22 328,16 316,22 328,28" />
          {/* Inner cross */}
          <line x1="300" y1="14" x2="300" y2="30" strokeWidth="0.8" />
          <line x1="275" y1="22" x2="325" y2="22" strokeWidth="0.8" />
          <circle cx="300" cy="22" r="3" fill={color} />
          {/* End diamonds */}
          <polygon points="222,22 230,17 238,22 230,27" fill={color} opacity="0.3" />
          <polygon points="378,22 370,17 362,22 370,27" fill={color} opacity="0.3" />
        </g>
      </svg>
    </div>
  );
}

// ─── 7. Flowing Scroll Center (matches image row 7) ───────────────────────────

export function FlowingScrollDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 52" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 52, overflow: "visible" }}>
        <g stroke={color} fill="none" strokeWidth="1.2">
          <line x1="0" y1="26" x2="180" y2="26" />
          <line x1="420" y1="26" x2="600" y2="26" />
          {/* Left flowing double curve */}
          <path d="M180,26 C200,26 205,14 225,18 C245,22 255,30 280,26" strokeWidth="1.5" />
          <path d="M185,26 C203,26 208,17 226,20 C244,23 253,30 277,26" strokeWidth="0.7" opacity="0.5" />
          {/* Right flowing double curve */}
          <path d="M420,26 C400,26 395,14 375,18 C355,22 345,30 320,26" strokeWidth="1.5" />
          <path d="M415,26 C397,26 392,17 374,20 C356,23 347,30 323,26" strokeWidth="0.7" opacity="0.5" />
          {/* Center flourish */}
          <path d="M290,20 C293,12 300,9 300,9 C300,9 307,12 310,20" />
          <path d="M295,24 C297,18 300,15 300,15 C300,15 303,18 305,24" strokeWidth="0.8" />
          <circle cx="300" cy="26" r="4" />
          <circle cx="300" cy="26" r="2" fill={color} />
        </g>
      </svg>
    </div>
  );
}

// ─── 8. Tulip & Drop (matches image row 8) ────────────────────────────────────

export function TulipDropDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 64" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 64, overflow: "visible" }}>
        <g stroke={color} fill="none" strokeWidth="1.2">
          <line x1="0" y1="36" x2="195" y2="36" />
          <line x1="405" y1="36" x2="600" y2="36" />
          {/* Left gentle curve */}
          <path d="M195,36 C220,36 230,28 255,32 C270,34 278,36 290,36" />
          {/* Right gentle curve */}
          <path d="M405,36 C380,36 370,28 345,32 C330,34 322,36 310,36" />
          {/* Top spike */}
          <path d="M300,14 C297,18 296,24 300,28 C304,24 303,18 300,14Z" fill={color} />
          {/* Tulip / chalice shape */}
          <path d="M285,36 C283,28 288,22 300,20 C312,22 317,28 315,36" />
          <path d="M290,36 C289,30 293,25 300,23 C307,25 311,30 310,36" strokeWidth="0.8" opacity="0.5" />
          {/* Drooping petals */}
          <path d="M285,36 C280,40 275,46 268,48 C265,49 262,46 265,44 C268,42 274,44 272,48" />
          <path d="M315,36 C320,40 325,46 332,48 C335,49 338,46 335,44 C332,42 326,44 328,48" />
          {/* Base dot */}
          <circle cx="300" cy="36" r="3" fill={color} />
        </g>
      </svg>
    </div>
  );
}

// ─── 9. Simple Triple Line (bonus — minimal Art Deco) ─────────────────────────

export function TripleLineDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 24" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 24 }}>
        <g stroke={color} fill="none">
          <line x1="0" y1="8" x2="600" y2="8" strokeWidth="2" />
          <line x1="0" y1="12" x2="600" y2="12" strokeWidth="0.6" />
          <line x1="0" y1="16" x2="600" y2="16" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

// ─── 10. Star Point (bonus) ───────────────────────────────────────────────────

export function StarPointDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 32" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 32 }}>
        <g stroke={color} fill="none" strokeWidth="1">
          <line x1="0" y1="16" x2="270" y2="16" />
          <line x1="330" y1="16" x2="600" y2="16" />
          {/* 4-point star */}
          <path d="M300,4 L303,13 L312,16 L303,19 L300,28 L297,19 L288,16 L297,13Z" fill={color} opacity="0.9" />
          {/* Flanking diamonds */}
          <polygon points="274,16 280,12 286,16 280,20" fill={color} opacity="0.4" />
          <polygon points="326,16 320,12 314,16 320,20" fill={color} opacity="0.4" />
        </g>
      </svg>
    </div>
  );
}

// ─── 11. Laurel Wreath (bonus) ────────────────────────────────────────────────

export function LaurelWreathDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 48" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 48, overflow: "visible" }}>
        <g stroke={color} fill="none" strokeWidth="1.1">
          <line x1="0" y1="24" x2="195" y2="24" />
          <line x1="405" y1="24" x2="600" y2="24" />
          {/* Left laurel branch */}
          <path d="M195,24 C210,24 215,24 230,24" strokeWidth="1.5" />
          <path d="M200,24 C202,18 208,14 212,18" fill={color} opacity="0.4" />
          <path d="M210,24 C212,16 219,12 222,17" fill={color} opacity="0.4" />
          <path d="M220,24 C222,18 228,15 230,20" fill={color} opacity="0.35" />
          <path d="M200,24 C202,30 208,34 212,30" fill={color} opacity="0.3" />
          <path d="M210,24 C212,32 219,36 222,31" fill={color} opacity="0.3" />
          {/* Right laurel branch */}
          <path d="M405,24 C390,24 385,24 370,24" strokeWidth="1.5" />
          <path d="M400,24 C398,18 392,14 388,18" fill={color} opacity="0.4" />
          <path d="M390,24 C388,16 381,12 378,17" fill={color} opacity="0.4" />
          <path d="M380,24 C378,18 372,15 370,20" fill={color} opacity="0.35" />
          <path d="M400,24 C398,30 392,34 388,30" fill={color} opacity="0.3" />
          <path d="M390,24 C388,32 381,36 378,31" fill={color} opacity="0.3" />
          {/* Center arc text stand */}
          <path d="M250,24 C260,12 280,8 300,8 C320,8 340,12 350,24" />
          <path d="M260,24 C268,15 283,11 300,11 C317,11 332,15 340,24" strokeWidth="0.7" opacity="0.5" />
          <circle cx="300" cy="8" r="3" fill={color} />
          <circle cx="300" cy="24" r="4" />
          <circle cx="300" cy="24" r="2" fill={color} />
        </g>
      </svg>
    </div>
  );
}

// ─── 12. Art Deco Fan (bonus) ─────────────────────────────────────────────────

export function ArtDecoFanDivider({
  color = "currentColor",
  width = "100%",
  className = "",
}: DividerProps) {
  return (
    <div
      className={`flex items-center w-full ${className}`}
      style={{ width }}
      role="separator"
      aria-hidden="true"
    >
      <svg viewBox="0 0 600 48" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: 48, overflow: "visible" }}>
        <g stroke={color} fill="none" strokeWidth="1">
          <line x1="0" y1="30" x2="220" y2="30" />
          <line x1="380" y1="30" x2="600" y2="30" />
          {/* Fan rays from center point */}
          {[-60, -45, -30, -15, 0, 15, 30, 45, 60].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const len = 22;
            return (
              <line
                key={i}
                x1={300}
                y1={30}
                x2={300 + Math.sin(rad) * len}
                y2={30 - Math.cos(rad) * len}
                strokeWidth={i === 4 ? 1.5 : 0.8}
                opacity={i === 4 ? 1 : 0.6}
              />
            );
          })}
          {/* Fan arc */}
          <path d="M272,30 A28,28 0 0 1 328,30" strokeWidth="1.2" />
          <path d="M278,30 A22,22 0 0 1 322,30" strokeWidth="0.6" opacity="0.5" />
          {/* Base */}
          <circle cx="300" cy="30" r="3" fill={color} />
          {/* Flanking ornament */}
          <polygon points="225,30 232,25 239,30 232,35" />
          <polygon points="375,30 368,25 361,30 368,35" />
          <line x1="240" y1="30" x2="272" y2="30" />
          <line x1="328" y1="30" x2="360" y2="30" />
        </g>
      </svg>
    </div>
  );
}

// ─── Named exports summary ────────────────────────────────────────────────────

export const ALL_DIVIDERS = [
  { name: "Floral Scroll",     component: FloralScrollDivider },
  { name: "Leaf & Vine",       component: LeafVineDivider },
  { name: "Diamond Chain",     component: DiamondChainDivider },
  { name: "Swirl Wings",       component: SwirlWingsDivider },
  { name: "Curl Ornament",     component: CurlOrnamentDivider },
  { name: "Lattice Diamond",   component: LatticeDiamondDivider },
  { name: "Flowing Scroll",    component: FlowingScrollDivider },
  { name: "Tulip & Drop",      component: TulipDropDivider },
  { name: "Triple Line",       component: TripleLineDivider },
  { name: "Star Point",        component: StarPointDivider },
  { name: "Laurel Wreath",     component: LaurelWreathDivider },
  { name: "Art Deco Fan",      component: ArtDecoFanDivider },
] as const;