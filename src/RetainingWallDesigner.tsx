import { useState } from "react";
import type { Geometry, Rebar } from "./types/retainingWall";
import { Field } from "./components/UI/Field";
import { Section } from "./components/UI/Section";
import { RetainingWallCanvas } from "./components/Canvas/RetainingWallCanvas";
import "./RetainingWallDesigner.css";

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

  return (
    <div className="rw-app">
      {/* Top Header */}
      <header className="rw-header">
        <div className="rw-header-left">
          <span className="rw-app-title">Retaining Wall Design</span>
        </div>
        <div className="rw-header-right">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTArGzhAn3l3PtNH4bz8Lqbo4YkC1FHrm5szTMeHydiY5d3YFcYcdgdt9E&s=10"
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
        <RetainingWallCanvas geo={geo} rebar={rebar} />
      </div>
    </div>
  );
}