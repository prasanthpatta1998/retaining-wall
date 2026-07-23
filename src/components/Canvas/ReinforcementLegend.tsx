import type { Rebar } from "../../types/retainingWall";
import "./ReinforcementLegend.css";

interface ReinforcementLegendProps {
  rebar: Rebar;
  hasKey: boolean;
}

export function ReinforcementLegend({ rebar, hasKey }: ReinforcementLegendProps) {
  return (
    <div className="quick-results-card">
      <div className="quick-results-title">Reinforcement Summary</div>
      
      <div className="quick-results-item">
        <div className="quick-results-label">Stem Vert. Rebar</div>
        <div className="quick-results-value">
          T{rebar.stemVDia} @ {rebar.stemVSpacing}mm
        </div>
      </div>

      <div className="quick-results-item">
        <div className="quick-results-label">Footing Top / Bot</div>
        <div className="quick-results-value">
          T{rebar.footTopDia} / T{rebar.footBotDia}
        </div>
      </div>

      {hasKey && (
        <div className="quick-results-item">
          <div className="quick-results-label">Key Vert. Rebar</div>
          <div className="quick-results-value">
            T{rebar.keyVDia} @ {rebar.keyVSpacing}mm
          </div>
        </div>
      )}
    </div>
  );
}