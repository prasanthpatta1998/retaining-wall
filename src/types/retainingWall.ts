export interface Geometry {
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

export interface Rebar {
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

export interface Point {
  x: number;
  y: number;
}