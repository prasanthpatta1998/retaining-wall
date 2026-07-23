import type { ReactNode } from "react";
import "./Section.css";

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
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