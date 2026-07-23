import type { Point } from "../types/retainingWall";

export const NAVY = "#1e293b";

interface HDimProps {
  x1: number;
  x2: number;
  y: number;
  label: string;
  sub?: string;
  gap?: number;
}

export function HDim({ x1, x2, y, label, sub, gap = 26 }: HDimProps) {
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

export function VDim({ y1, y2, x, label, gap = 26, anchor = "end", textGap = 8 }: VDimProps) {
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

export function dotsBetween(p1: Point, p2: Point, spacingPx: number, minDots = 2, maxDots = 60): Point[] {
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