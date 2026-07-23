import { useMemo, useState, type ReactNode } from "react";
import "./RetainingWallDesigner.css";

// ==================== Types ====================
interface Geometry {
  a1: number;
  a2: number;
  h: number;
  dof: number;
  x1: number;
  x2: number;
  d: number;
  nd: number;
  shearKey: "Yes" | "No";
  skp: number;
  skl: number;
  skd: number;
}

interface Rebar {
  stemVDia: number;
  stemVSpacing: number;
  stemHDia: number;
  stemHSpacing: number;
  footTopDia: number;
  footTopSpacing: number;
  footBotDia: number;
  footBotSpacing: number;
  keyVDia: number;
  keyVSpacing: number;
  keyHDia: number;
  keyHSpacing: number;
}

interface Point {
  x: number;
  y: number;
}

// ==================== Small UI atoms ====================
interface FieldProps {
  label: string;
  value: number | string;
  onChange: (v: any) => void;
  unit?: string;
  type?: "number" | "text";
  options?: string[];
}

function Field({ label, value, onChange, unit, type = "number", options }: FieldProps) {
  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      {options ? (
        <select
          className="field-select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <div className="field-input-wrap">
          <input
            className="field-input"
            type={type}
            value={value}
            onChange={(e) =>
              onChange(type === "number" ? Number(e.target.value) : e.target.value)
            }
          />
          {unit && <span className="field-unit">{unit}</span>}
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="section">
      <div className="section-header">
        <h4 className="section-header-title">{title}</h4>
        <span style={{ fontSize: "10px", color: "#64748b" }}>▲</span>
      </div>
      <div className="section-content">{children}</div>
    </div>
  );
}

// ==================== SVG dimension helpers ====================
const NAVY = "#1e293b";

interface HDimProps {
  x1: number;
  x2: number;
  y: number;
  label: string;
  sub?: string;
  gap?: number;
}

function HDim({ x1, x2, y, label, sub, gap = 26 }: HDimProps) {
  const yy = y - gap;
  const min = Math.min(x1, x2);
  const max = Math.max(x1, x2);
  return (
    <g stroke={NAVY} strokeWidth={1} fill={NAVY}>
      <line x1={min} y1={y} x2={min} y2={yy} strokeDasharray="2,2" />
      <line x1={max} y1={y} x2={max} y2={yy} strokeDasharray="2,2" />
      <line x1={min} y1={yy} x2={max} y2={yy} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x={(min + max) / 2} y={yy - 6} textAnchor="middle" fontSize={11} fontWeight={600} stroke="none" fill={NAVY}>
        {label}
      </text>
      {sub && (
        <text x={(min + max) / 2} y={yy - 20} textAnchor="middle" fontSize={10} stroke="none" fill={NAVY}>
          {sub}
        </text>
      )}
    </g>
  );
}

interface VDimProps {
  y1: number;
  y2: number;
  x: number;
  label: string;
  gap?: number;
  anchor?: "start" | "end";
  textGap?: number;
}

function VDim({ y1, y2, x, label, gap = 26, anchor = "end", textGap = 8 }: VDimProps) {
  const xx = x - gap;
  const min = Math.min(y1, y2);
  const max = Math.max(y1, y2);
  const tx = anchor === "end" ? xx - textGap : xx + textGap;
  return (
    <g stroke={NAVY} strokeWidth={1} fill={NAVY}>
      <line x1={x} y1={min} x2={xx} y2={min} strokeDasharray="2,2" />
      <line x1={x} y1={max} x2={xx} y2={max} strokeDasharray="2,2" />
      <line x1={xx} y1={min} x2={xx} y2={max} markerStart="url(#arrow)" markerEnd="url(#arrow)" />
      <text x={tx} y={(min + max) / 2} textAnchor={anchor} fontSize={11} fontWeight={600} stroke="none" fill={NAVY}>
        {label}
      </text>
    </g>
  );
}

function dotsBetween(p1: Point, p2: Point, spacingPx: number, minDots = 2, maxDots = 60): Point[] {
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  let n = Math.round(len / Math.max(spacingPx, 4)) + 1;
  n = Math.max(minDots, Math.min(maxDots, n));
  const pts: Point[] = [];
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : i / (n - 1);
    pts.push({ x: p1.x + (p2.x - p1.x) * t, y: p1.y + (p2.y - p1.y) * t });
  }
  return pts;
}

// ==================== Main component ====================
export default function RetainingWallDesigner() {
  const [geo, setGeo] = useState<Geometry>({
    a1: 200,
    a2: 600,
    h: 3000,
    dof: 1500,
    x1: 900,
    x2: 1500,
    d: 600,
    nd: 300,
    shearKey: "Yes",
    skp: 2000,
    skl: 300,
    skd: 300,
  });

  const [rebar, setRebar] = useState<Rebar>({
    stemVDia: 12,
    stemVSpacing: 200,
    stemHDia: 10,
    stemHSpacing: 200,
    footTopDia: 12,
    footTopSpacing: 200,
    footBotDia: 12,
    footBotSpacing: 200,
    keyVDia: 10,
    keyVSpacing: 200,
    keyHDia: 10,
    keyHSpacing: 200,
  });

  const setG = <K extends keyof Geometry>(key: K) => (v: Geometry[K]) =>
    setGeo((s) => ({ ...s, [key]: v }));
  const setR = <K extends keyof Rebar>(key: K) => (v: Rebar[K]) =>
    setRebar((s) => ({ ...s, [key]: v }));
  const hasKey = geo.shearKey === "Yes";

  // ---------- geometry & scale ----------
  const draw = useMemo(() => {
    const { a1, a2, h, dof, x1, x2, d } = geo;
    const baseWidth = x1 + a2 + x2;
    const footTopY = h;
    const footBotY = h + d;
    const nglY = Math.max(0, h - Math.max(dof - d, 0));
    const keyBotY = hasKey ? footBotY + geo.skd : footBotY;
    const overallMM = keyBotY;

    const PW = 720;
    const PH_MAX = 760;
    const scale = Math.min(PW / baseWidth, PH_MAX / overallMM);

    const marginLeft = 150;
    const marginTop = 50;
    const marginRight = 260;
    const marginBottom = 110;

    const X = (mm: number) => marginLeft + mm * scale;
    const Y = (mm: number) => marginTop + mm * scale;

    const stemBL: Point = { x: X(x1), y: Y(footTopY) };
    const stemBR: Point = { x: X(x1 + a2), y: Y(footTopY) };
    const stemTR: Point = { x: X(x1 + a2), y: Y(0) };
    const stemTL: Point = { x: X(x1 + a2 - a1), y: Y(0) };

    const svgW = marginLeft + baseWidth * scale + marginRight;
    const svgH = marginTop + overallMM * scale + marginBottom;

    return {
      baseWidth,
      footTopY,
      footBotY,
      nglY,
      keyBotY,
      overallMM,
      scale,
      X,
      Y,
      stemBL,
      stemBR,
      stemTR,
      stemTL,
      svgW,
      svgH,
      x1,
      x2,
      a1,
      a2,
      d,
      dof,
      h,
      skp: geo.skp,
      skl: geo.skl,
      skd: geo.skd,
    };
  }, [geo, hasKey]);

  const { X, Y, stemBL, stemBR, stemTR, stemTL, svgW, svgH } = draw;

  // ---------- reinforcement ----------
  const stemVDotSpacingPx = rebar.stemVSpacing * draw.scale;
  const stemVDots = dotsBetween(
    { x: stemBL.x + 14, y: stemBL.y - 6 },
    { x: stemTL.x + 14, y: stemTL.y + 10 },
    stemVDotSpacingPx
  );
  const stemHLevels = dotsBetween(
    { x: 0, y: stemBL.y },
    { x: 0, y: stemTL.y + 10 },
    rebar.stemHSpacing * draw.scale
  );

  const footTopDots = dotsBetween(
    { x: X(0) + 10, y: Y(draw.footTopY) + 10 },
    { x: X(draw.baseWidth) - 10, y: Y(draw.footTopY) + 10 },
    rebar.footTopSpacing * draw.scale
  );
  const footBotDots = dotsBetween(
    { x: X(0) + 10, y: Y(draw.footBotY) - 10 },
    { x: X(draw.baseWidth) - 10, y: Y(draw.footBotY) - 10 },
    rebar.footBotSpacing * draw.scale
  );

  const keyLeft = X(draw.skp);
  const keyRight = X(draw.skp + draw.skl);
  const keyTop = Y(draw.footBotY);
  const keyBot = Y(draw.keyBotY);
  const keyVDots = hasKey
    ? dotsBetween({ x: keyLeft + 10, y: keyTop + 4 }, { x: keyLeft + 10, y: keyBot - 6 }, rebar.keyVSpacing * draw.scale).concat(
        dotsBetween({ x: keyRight - 10, y: keyTop + 4 }, { x: keyRight - 10, y: keyBot - 6 }, rebar.keyVSpacing * draw.scale)
      )
    : [];

  return (
    <div className="rw-app">
      {/* Top Header */}
      <header className="rw-header">
        <div className="rw-header-left">
          <span className="rw-app-title">Retaining Wall Design</span>
        </div>
        <div className="rw-header-right">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="User Avatar"
            className="rw-avatar"
          />
        </div>
      </header>

      {/* Main Container */}
      <div className="rw-layout">
        {/* Left Sidebar Form */}
        <aside className="rw-sidebar">
          <div className="rw-sidebar-body">
            <h3 className="sidebar-main-heading">Wall Geometry</h3>
            <Section title="Stem and Footing Dimensions">
              <Field label="Thickness of stem at Top (a₁)" value={geo.a1} onChange={setG("a1")} unit="mm" />
              <Field label="Thickness of stem at Bottom (a₂)" value={geo.a2} onChange={setG("a2")} unit="mm" />
              <Field label="Height of backfill (h)" value={geo.h} onChange={setG("h")} unit="mm" />
              <Field label="Width of the Footing (x₁)" value={geo.x1} onChange={setG("x1")} unit="mm" />
              <Field label="Depth of Footing (nd)" value={geo.d} onChange={setG("d")} unit="mm" />
              <Field
                label="Neglected Depth Key"
                value={geo.shearKey}
                onChange={(v: string) => setG("shearKey")(v as "Yes" | "No")}
                options={["Yes", "No"]}
              />
            </Section>

            {hasKey && (
              <Section title="Shear Key">
                <Field label="Width of Shear Key (skl)" value={geo.skl} onChange={setG("skl")} unit="mm" />
                <Field label="Depth of Shear Key (skd)" value={geo.skd} onChange={setG("skd")} unit="mm" />
              </Section>
            )}

            <h3 className="sidebar-main-heading">Reinforcement</h3>

            <Section title="Stem">
              <Field label="Vertical Reinforcement - Dia (mm)" value={rebar.stemVDia} onChange={setR("stemVDia")} />
              <Field label="Vertical Reinforcement - Spacing (c/c)" value={rebar.stemVSpacing} onChange={setR("stemVSpacing")} unit="mm" />
              <Field label="Horizontal Reinforcement - Dia (mm)" value={rebar.stemHDia} onChange={setR("stemHDia")} />
              <Field label="Horizontal Reinforcement - Spacing (c/c)" value={rebar.stemHSpacing} onChange={setR("stemHSpacing")} unit="mm" />
            </Section>

            <Section title="Footing">
              <Field label="Top Reinforcement - Dia (mm)" value={rebar.footTopDia} onChange={setR("footTopDia")} />
              <Field label="Top Reinforcement - Spacing (c/c)" value={rebar.footTopSpacing} onChange={setR("footTopSpacing")} unit="mm" />
              <Field label="Bottom Reinforcement - Dia (mm)" value={rebar.footBotDia} onChange={setR("footBotDia")} />
              <Field label="Bottom Reinforcement - Spacing (c/c)" value={rebar.footBotSpacing} onChange={setR("footBotSpacing")} unit="mm" />
            </Section>

            {hasKey && (
              <Section title="Shear Key">
                <Field label="Vertical Reinforcement - Dia (mm)" value={rebar.keyVDia} onChange={setR("keyVDia")} />
                <Field label="Vertical Reinforcement - Spacing (c/c)" value={rebar.keyVSpacing} onChange={setR("keyVSpacing")} unit="mm" />
                <Field label="Horizontal Reinforcement - Dia (mm)" value={rebar.keyHDia} onChange={setR("keyHDia")} />
                <Field label="Horizontal Reinforcement - Spacing (c/c)" value={rebar.keyHSpacing} onChange={setR("keyHSpacing")} unit="mm" />
              </Section>
            )}
          </div>
        </aside>

        {/* Dynamic Canvas Container */}
        <main className="rw-canvas-card">

          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="rw-svg">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX={5} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill={NAVY} />
              </marker>
              <pattern id="soil" width={12} height={12} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <rect width={12} height={12} fill="#fdf7f0" />
                <line x1={0} y1={0} x2={0} y2={12} stroke="#e5d5c5" strokeWidth={1.2} />
              </pattern>
              <pattern id="concrete" width={8} height={8} patternUnits="userSpaceOnUse">
                <rect width={8} height={8} fill="#f1f5f9" />
                <circle cx={2} cy={2} r={0.6} fill="#94a3b8" />
                <circle cx={6} cy={6} r={0.6} fill="#94a3b8" />
              </pattern>
            </defs>

            {/* Backfill (right side, above footing) */}
            <rect
              x={stemTR.x}
              y={Y(0)}
              width={X(draw.baseWidth) + 60 - stemTR.x}
              height={Y(draw.footTopY) - Y(0)}
              fill="url(#soil)"
            />
            {/* Natural ground left of toe, below NGL */}
            <rect
              x={X(0) - 60}
              y={Y(draw.nglY)}
              width={stemBL.x - (X(0) - 60)}
              height={Y(draw.footTopY) - Y(draw.nglY)}
              fill="url(#soil)"
            />

            {/* Footing */}
            <rect
              x={X(0)}
              y={Y(draw.footTopY)}
              width={X(draw.baseWidth) - X(0)}
              height={Y(draw.footBotY) - Y(draw.footTopY)}
              fill="url(#concrete)"
              stroke={NAVY}
              strokeWidth={1.5}
            />

            {/* Stem */}
            <polygon
              points={`${stemBL.x},${stemBL.y} ${stemTL.x},${stemTL.y} ${stemTR.x},${stemTR.y} ${stemBR.x},${stemBR.y}`}
              fill="url(#concrete)"
              stroke={NAVY}
              strokeWidth={1.5}
            />

            {/* Shear key */}
            {hasKey && (
              <rect
                x={keyLeft}
                y={keyTop}
                width={keyRight - keyLeft}
                height={keyBot - keyTop}
                fill="url(#concrete)"
                stroke={NAVY}
                strokeWidth={1.5}
              />
            )}

            {/* NGL line */}
            <line
              x1={X(0) - 60}
              y1={Y(draw.nglY)}
              x2={X(draw.baseWidth) + 60}
              y2={Y(draw.nglY)}
              stroke="#1e293b"
              strokeDasharray="4,4"
              strokeWidth={1.2}
            />
            <polygon
              points={`${X(0) - 55},${Y(draw.nglY)} ${X(0) - 45},${Y(draw.nglY)} ${X(0) - 50},${Y(draw.nglY) + 8}`}
              fill="#1e293b"
            />
            <text x={X(0) - 62} y={Y(draw.nglY) - 6} textAnchor="end" fontSize={11} fontWeight={700} fill="#1e293b">
              NGL
            </text>

            {/* ---- Reinforcement: Stem ---- */}
            {stemVDots.map((p, i) => (
              <circle key={`sv-${i}`} cx={p.x} cy={p.y} r={3} fill="#dc2626" />
            ))}
            {stemVDots.length > 1 && (
              <polyline points={stemVDots.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#dc2626" strokeWidth={1.2} />
            )}
            {stemHLevels.map((p, i) => {
              const t = (p.y - stemBL.y) / (stemTL.y - stemBL.y || -1);
              const leftX = stemBL.x + (stemTL.x - stemBL.x) * t;
              const rightX = stemBR.x + (stemTR.x - stemBR.x) * t;
              return (
                <line key={`sh-${i}`} x1={leftX} y1={p.y} x2={rightX} y2={p.y} stroke="#dc2626" strokeWidth={1} strokeDasharray="3,3" />
              );
            })}

            {/* ---- Reinforcement: Footing ---- */}
            {footTopDots.map((p, i) => (
              <circle key={`ft-${i}`} cx={p.x} cy={p.y} r={3} fill="#dc2626" />
            ))}
            <line
              x1={footTopDots[0]?.x}
              y1={footTopDots[0]?.y}
              x2={footTopDots[footTopDots.length - 1]?.x}
              y2={footTopDots[0]?.y}
              stroke="#dc2626"
              strokeWidth={1.2}
            />
            {footBotDots.map((p, i) => (
              <circle key={`fb-${i}`} cx={p.x} cy={p.y} r={3} fill="#dc2626" />
            ))}
            <line
              x1={footBotDots[0]?.x}
              y1={footBotDots[0]?.y}
              x2={footBotDots[footBotDots.length - 1]?.x}
              y2={footBotDots[0]?.y}
              stroke="#dc2626"
              strokeWidth={1.2}
            />

            {/* ---- Reinforcement: Shear key ---- */}
            {keyVDots.map((p, i) => (
              <circle key={`kv-${i}`} cx={p.x} cy={p.y} r={2.8} fill="#dc2626" />
            ))}

            {/* ================= DIMENSIONS ================= */}
            <HDim x1={stemTL.x} x2={stemTR.x} y={Y(0) - 4} label={`a₁ = ${draw.a1}`} gap={14} />
            <HDim x1={stemBL.x} x2={stemBR.x} y={stemBL.y + 46} label={`a₂ = ${draw.a2}`} gap={-8} />
            <HDim x1={X(0)} x2={stemBL.x} y={stemBL.y + 10} label={`x₁ = ${draw.x1}`} gap={-30} />
            <HDim x1={stemBR.x} x2={X(draw.baseWidth)} y={stemBR.y + 10} label={`x₂ = ${draw.x2}`} gap={-30} />
            <HDim
              x1={X(0)}
              x2={X(draw.baseWidth)}
              y={Y(draw.keyBotY) + 55}
              label={`Base Width = x₁ + a₂ + x₂ = ${draw.x1} + ${draw.a2} + ${draw.x2} = ${draw.baseWidth}`}
              gap={-16}
            />

            <VDim y1={Y(0)} y2={Y(draw.footTopY)} x={X(0)} label={`Height of Back fill (h) = ${draw.h}`} gap={80} />
            <VDim y1={Y(draw.nglY)} y2={Y(draw.footBotY)} x={X(0)} label={`dof = ${draw.dof}`} gap={40} />
            <VDim y1={Y(draw.footTopY)} y2={Y(draw.footBotY)} x={X(0)} label={`d = ${draw.d}`} gap={10} anchor="start" textGap={-14} />
            <VDim
              y1={Y(0)}
              y2={Y(draw.keyBotY)}
              x={X(draw.baseWidth) + 90}
              label={`Overall Height = h + dof = ${draw.h + draw.dof}`}
              gap={0}
            />

            {hasKey && (
              <>
                <HDim x1={X(0)} x2={keyLeft} y={keyBot + 30} label={`skp = ${draw.skp}`} gap={-16} />
                <HDim x1={keyLeft} x2={keyRight} y={keyBot + 30} label={`skl = ${draw.skl}`} gap={-16} />
                <VDim y1={keyTop} y2={keyBot} x={keyRight + 60} label={`skd = ${draw.skd}`} gap={0} anchor="start" textGap={8} />
              </>
            )}

            {/* ---- Callout labels ---- */}
            <text x={stemTR.x + 20} y={stemTR.y + 40} fontSize={11} fill="#dc2626" fontWeight={600}>
              {rebar.stemVDia}⌀ @ {rebar.stemVSpacing} c/c (Vertical)
            </text>
            <line x1={stemTR.x + 18} y1={stemTR.y + 36} x2={stemTL.x + 16} y2={stemTL.y + 30} stroke="#64748b" strokeWidth={1} />

            <text x={stemTR.x + 20} y={stemTR.y + 70} fontSize={11} fill="#dc2626" fontWeight={600}>
              {rebar.stemHDia}⌀ @ {rebar.stemHSpacing} c/c (Horizontal)
            </text>
            <line
              x1={stemTR.x + 18}
              y1={stemTR.y + 66}
              x2={(stemTL.x + stemTR.x) / 2}
              y2={stemTL.y + 55}
              stroke="#64748b"
              strokeWidth={1}
            />

            <text x={X(draw.baseWidth) + 20} y={Y(draw.footTopY) + 6} fontSize={11} fill="#dc2626" fontWeight={600}>
              {rebar.footTopDia}⌀ @ {rebar.footTopSpacing} c/c (Top)
            </text>
            <text x={X(draw.baseWidth) + 20} y={Y(draw.footBotY) + 6} fontSize={11} fill="#dc2626" fontWeight={600}>
              {rebar.footBotDia}⌀ @ {rebar.footBotSpacing} c/c (Bottom)
            </text>

            {hasKey && (
              <text x={keyRight + 65} y={(keyTop + keyBot) / 2 + 30} fontSize={11} fill="#dc2626" fontWeight={600}>
                {rebar.keyVDia}⌀ @ {rebar.keyVSpacing} c/c (Key Vert.)
              </text>
            )}

            <text x={stemTR.x + 40} y={Y(0) - 12} fontSize={11} fontWeight={700} fill="#475569">
              FILLED SOIL
            </text>

            {/* Legend inside canvas */}
            {/* <g>
              <rect
                x={X(draw.baseWidth) - 200}
                y={Y(draw.keyBotY) + 60}
                width={180}
                height={60}
                rx={4}
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <text x={X(draw.baseWidth) - 190} y={Y(draw.keyBotY) + 75} fontSize={10} fontWeight={700} fill="#0f172a">
                Legend:
              </text>
              <circle cx={X(draw.baseWidth) - 185} cy={Y(draw.keyBotY) + 90} r={3} fill="#dc2626" />
              <text x={X(draw.baseWidth) - 175} y={Y(draw.keyBotY) + 93} fontSize={10} fill="#334155">
                Main Reinforcement
              </text>
              <line
                x1={X(draw.baseWidth) - 190}
                y1={Y(draw.keyBotY) + 107}
                x2={X(draw.baseWidth) - 175}
                y2={Y(draw.keyBotY) + 107}
                stroke="#dc2626"
                strokeWidth={1.5}
                strokeDasharray="3,2"
              />
              <text x={X(draw.baseWidth) - 170} y={Y(draw.keyBotY) + 110} fontSize={10} fill="#334155">
                Distribution Reinforcement
              </text>
            </g> */}
          </svg>
        </main>
      </div>
    </div>
  );
}