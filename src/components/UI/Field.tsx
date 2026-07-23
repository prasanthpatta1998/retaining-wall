
import "./Field.css";

interface FieldProps {
  label: string;
  value: number | string;
  onChange: (v: any) => void;
  unit?: string;
  type?: "number" | "text";
  options?: string[];
}

export function Field({ label, value, onChange, unit, type = "number", options }: FieldProps) {
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