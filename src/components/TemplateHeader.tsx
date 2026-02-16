import type { Template } from "../types/template";

interface TemplateHeaderProps {
  template: Template;
}

export function TemplateHeader({ template }: TemplateHeaderProps) {
  const { header, style } = template;
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="template-header"
      style={
        {
          "--template-primary":
            style?.primaryColor ?? "var(--forge-theme-primary)",
          "--template-accent":
            style?.accentColor ?? "var(--forge-theme-primary)",
        } as React.CSSProperties
      }
    >
      <div className="template-header-top">
        {header.logoUrl && (
          <img
            className="template-logo"
            src={header.logoUrl}
            alt=""
            aria-hidden="true"
          />
        )}
        <div className="template-header-text">
          {header.agencyName && (
            <div className="template-agency">{header.agencyName}</div>
          )}
          {header.subtitle && (
            <div className="template-subtitle">{header.subtitle}</div>
          )}
        </div>
      </div>
      {header.showDate && <div className="template-date">{today}</div>}
      <div className="template-accent-bar" aria-hidden="true" />
    </div>
  );
}
