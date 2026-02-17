import type { Template } from "../types/template";

interface TemplateCardProps {
  template: Template | null;
  isSelected: boolean;
  onSelect: () => void;
}

export function TemplateCard({
  template,
  isSelected,
  onSelect,
}: TemplateCardProps) {
  const isNoTemplate = template === null;
  const primaryColor = template?.style?.primaryColor ?? "#6b7280";
  const accentColor = template?.style?.accentColor ?? primaryColor;

  return (
    <button
      role="radio"
      aria-checked={isSelected}
      aria-label={isNoTemplate ? "No Template" : template.name}
      className={`template-card${isSelected ? " template-card--selected" : ""}${isNoTemplate ? " template-card--no-template" : ""}`}
      onClick={onSelect}
      style={
        {
          "--card-primary": primaryColor,
          "--card-accent": accentColor,
        } as React.CSSProperties
      }
    >
      {isSelected && (
        <div className="template-card-check" aria-hidden="true">
          <forge-icon
            name="check_circle"
            style={{ "--forge-icon-size": "18px" } as React.CSSProperties}
          />
        </div>
      )}

      {isNoTemplate ? (
        <div className="template-card-preview template-card-preview--none">
          <forge-icon
            name="table_rows"
            style={
              {
                "--forge-icon-size": "24px",
                color: "#9ca3af",
              } as React.CSSProperties
            }
          />
        </div>
      ) : (
        <div className="template-card-preview">
          <div className="template-card-agency">
            {template.header.agencyName || template.name}
          </div>
          {template.header.subtitle && (
            <div className="template-card-subtitle">
              {template.header.subtitle}
            </div>
          )}
          <div className="template-card-accent-bar" aria-hidden="true" />
        </div>
      )}

      <div className="template-card-footer">
        <span className="template-card-name">
          {isNoTemplate ? "No Template" : template.name}
        </span>
        {!isNoTemplate && (
          <div className="template-card-swatches" aria-hidden="true">
            <div
              className="template-card-swatch"
              style={{ background: primaryColor }}
            />
            <div
              className="template-card-swatch"
              style={{ background: accentColor }}
            />
          </div>
        )}
      </div>
    </button>
  );
}
