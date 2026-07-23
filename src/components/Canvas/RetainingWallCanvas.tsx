import { useMemo } from "react";
import type { Geometry, Rebar, Point } from "../../types/retainingWall";
import { HDim, VDim, dotsBetween, NAVY } from "../../utils/svgHelpers";
// import { ReinforcementLegend } from "./ReinforcementLegend";
import "./RetainingWallCanvas.css";

interface CanvasProps {
  geo: Geometry;
  rebar: Rebar;
}

export function RetainingWallCanvas({ geo, rebar }: CanvasProps) {
  const hasKey = geo.shearKey === "Yes";

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

  const stemVDotSpacingPx = rebar.stemVSpacing * draw.scale;
  const stemVDots = dotsBetween(
    { x: stemBL.x + 14, y: stemBL.y - 6 },
    { x: stemTL.x + 14, y: stemTL.y + 10 },
    stemVDotSpacingPx,
  );
  const stemHLevels = dotsBetween(
    { x: 0, y: stemBL.y },
    { x: 0, y: stemTL.y + 10 },
    rebar.stemHSpacing * draw.scale,
  );

  const footTopDots = dotsBetween(
    { x: X(0) + 10, y: Y(draw.footTopY) + 10 },
    { x: X(draw.baseWidth) - 10, y: Y(draw.footTopY) + 10 },
    rebar.footTopSpacing * draw.scale,
  );
  const footBotDots = dotsBetween(
    { x: X(0) + 10, y: Y(draw.footBotY) - 10 },
    { x: X(draw.baseWidth) - 10, y: Y(draw.footBotY) - 10 },
    rebar.footBotSpacing * draw.scale,
  );

  const keyLeft = X(draw.skp);
  const keyRight = X(draw.skp + draw.skl);
  const keyTop = Y(draw.footBotY);
  const keyBot = Y(draw.keyBotY);
  const keyVDots = hasKey
    ? dotsBetween(
        { x: keyLeft + 10, y: keyTop + 4 },
        { x: keyLeft + 10, y: keyBot - 6 },
        rebar.keyVSpacing * draw.scale,
      ).concat(
        dotsBetween(
          { x: keyRight - 10, y: keyTop + 4 },
          { x: keyRight - 10, y: keyBot - 6 },
          rebar.keyVSpacing * draw.scale,
        ),
      )
    : [];

  return (
    <main className="rw-canvas-card">
      {/* <ReinforcementLegend rebar={rebar} hasKey={hasKey} /> */}

      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="rw-svg"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX={5}
            refY={5}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" fill={NAVY} />
          </marker>
          <pattern
            id="soil"
            width={12}
            height={12}
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <rect width={12} height={12} fill="#fdf7f0" />
            <line
              x1={0}
              y1={0}
              x2={0}
              y2={12}
              stroke="#e5d5c5"
              strokeWidth={1.2}
            />
          </pattern>
          <pattern
            id="concrete"
            width={8}
            height={8}
            patternUnits="userSpaceOnUse"
          >
            <rect width={8} height={8} fill="#f1f5f9" />
            <circle cx={2} cy={2} r={0.6} fill="#94a3b8" />
            <circle cx={6} cy={6} r={0.6} fill="#94a3b8" />
          </pattern>
        </defs>

        {/* Backfill */}
        <polygon
          points={`
                ${stemTR.x},${Y(0)} 
                ${X(draw.baseWidth) + 60},${Y(0)} 
                ${X(draw.baseWidth) + 60},${Y(draw.footBotY)} 
                ${stemBR.x},${Y(draw.footBotY)} 
                ${stemBR.x},${Y(draw.footTopY)}
            `}
          fill="url(#soil)"
        />
        <polygon
          points={`
                ${X(0) - 60},${Y(draw.nglY)} 
                ${stemBL.x + (stemTL.x - stemBL.x) * ((draw.nglY - draw.footTopY) / (0 - draw.footTopY))},${Y(draw.nglY)} 
                ${stemBL.x},${Y(draw.footTopY)} 
                ${stemBL.x},${Y(draw.footBotY)} 
                ${X(0) - 60},${Y(draw.footBotY)}
            `}
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

        {/* Shear Key */}
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

        {/* NGL Line */}
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
        <text
          x={X(0) - 62}
          y={Y(draw.nglY) - 6}
          textAnchor="end"
          fontSize={11}
          fontWeight={700}
          fill="#1e293b"
        >
          NGL
        </text>

        {/* Reinforcement Drawings */}
        {stemVDots.map((p, i) => (
          <circle key={`sv-${i}`} cx={p.x} cy={p.y} r={3} fill="#dc2626" />
        ))}
        {stemVDots.length > 1 && (
          <polyline
            points={stemVDots.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#dc2626"
            strokeWidth={1.2}
          />
        )}
        {stemHLevels.map((p, i) => {
          const t = (p.y - stemBL.y) / (stemTL.y - stemBL.y || -1);
          return (
            <line
              key={`sh-${i}`}
              x1={stemBL.x + (stemTL.x - stemBL.x) * t}
              y1={p.y}
              x2={stemBR.x + (stemTR.x - stemBR.x) * t}
              y2={p.y}
              stroke="#dc2626"
              strokeWidth={1}
              strokeDasharray="3,3"
            />
          );
        })}

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
        {keyVDots.map((p, i) => (
          <circle key={`kv-${i}`} cx={p.x} cy={p.y} r={2.8} fill="#dc2626" />
        ))}

        {/* Dimensions */}
        <HDim
          x1={stemTL.x}
          x2={stemTR.x}
          y={Y(0) - 4}
          label={`a₁ = ${draw.a1}`}
          gap={14}
        />
        <HDim
          x1={stemBL.x}
          x2={stemBR.x}
          y={stemBL.y + 46}
          label={`a₂ = ${draw.a2}`}
          gap={-8}
        />
        <HDim
          x1={X(0)}
          x2={stemBL.x}
          y={stemBL.y + 10}
          label={`x₁ = ${draw.x1}`}
          gap={-30}
        />
        <HDim
          x1={stemBR.x}
          x2={X(draw.baseWidth)}
          y={stemBR.y + 10}
          label={`x₂ = ${draw.x2}`}
          gap={-30}
        />
        <HDim
          x1={X(0)}
          x2={X(draw.baseWidth)}
          y={Y(draw.keyBotY) + 55}
          label={`Base Width = x₁ + a₂ + x₂ = ${draw.x1} + ${draw.a2} + ${draw.x2} = ${draw.baseWidth}`}
          gap={-16}
        />

        <VDim
          y1={Y(0)}
          y2={Y(draw.footTopY)}
          x={X(0)}
          label={`Height of Back fill (h) = ${draw.h}`}
          gap={80}
        />
        <VDim
          y1={Y(draw.nglY)}
          y2={Y(draw.footBotY)}
          x={X(0)}
          label={`dof = ${draw.dof}`}
          gap={40}
        />
        <VDim
          y1={Y(draw.footTopY)}
          y2={Y(draw.footBotY)}
          x={X(0)}
          label={`d = ${draw.d}`}
          gap={10}
          anchor="start"
          textGap={-14}
        />
        <VDim
          y1={Y(0)}
          y2={Y(draw.keyBotY)}
          x={X(draw.baseWidth) + 90}
          label={`Overall Height = h + dof = ${draw.h + draw.dof}`}
          gap={0}
        />

        {hasKey && (
          <>
            <HDim
              x1={X(0)}
              x2={keyLeft}
              y={keyBot + 30}
              label={`skp = ${draw.skp}`}
              gap={-16}
            />
            <HDim
              x1={keyLeft}
              x2={keyRight}
              y={keyBot + 30}
              label={`skl = ${draw.skl}`}
              gap={-16}
            />
            <VDim
              y1={keyTop}
              y2={keyBot}
              x={keyRight + 60}
              label={`skd = ${draw.skd}`}
              gap={0}
              anchor="start"
              textGap={8}
            />
          </>
        )}

        {/* Labels */}
        <text
          x={stemTR.x + 20}
          y={stemTR.y + 40}
          fontSize={11}
          fill="#dc2626"
          fontWeight={600}
        >
          {rebar.stemVDia}⌀ @ {rebar.stemVSpacing} c/c (Vertical)
        </text>
        <line
          x1={stemTR.x + 18}
          y1={stemTR.y + 36}
          x2={stemTL.x + 16}
          y2={stemTL.y + 30}
          stroke="#64748b"
          strokeWidth={1}
        />

        <text
          x={stemTR.x + 20}
          y={stemTR.y + 70}
          fontSize={11}
          fill="#dc2626"
          fontWeight={600}
        >
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

        <text
          x={X(draw.baseWidth) + 20}
          y={Y(draw.footTopY) + 6}
          fontSize={11}
          fill="#dc2626"
          fontWeight={600}
        >
          {rebar.footTopDia}⌀ @ {rebar.footTopSpacing} c/c (Top)
        </text>
        <text
          x={X(draw.baseWidth) + 20}
          y={Y(draw.footBotY) + 6}
          fontSize={11}
          fill="#dc2626"
          fontWeight={600}
        >
          {rebar.footBotDia}⌀ @ {rebar.footBotSpacing} c/c (Bottom)
        </text>

        {hasKey && (
          <text
            x={keyRight + 65}
            y={(keyTop + keyBot) / 2 + 30}
            fontSize={11}
            fill="#dc2626"
            fontWeight={600}
          >
            {rebar.keyVDia}⌀ @ {rebar.keyVSpacing} c/c (Key Vert.)
          </text>
        )}

        <text
          x={stemTR.x + 40}
          y={Y(0) - 12}
          fontSize={11}
          fontWeight={700}
          fill="#475569"
        >
          FILLED SOIL
        </text>
      </svg>
    </main>
  );
}
