import type { Template } from "../types/template";
import type { TemplateSelection } from "../hooks/useReportData";
import { TemplateCard } from "./TemplateCard";

interface TemplatePickerProps {
  templates: Template[];
  selection: TemplateSelection;
  onSelect: (selection: TemplateSelection) => void;
}

export function TemplatePicker({
  templates,
  selection,
  onSelect,
}: TemplatePickerProps) {
  return (
    <div
      className="template-picker"
      role="radiogroup"
      aria-label="Choose a report template"
    >
      <TemplateCard
        template={null}
        isSelected={selection.kind === "no-template"}
        onSelect={() => onSelect({ kind: "no-template" })}
      />
      {templates.map((t) => (
        <TemplateCard
          key={t.id}
          template={t}
          isSelected={
            selection.kind === "template" && selection.value.id === t.id
          }
          onSelect={() => onSelect({ kind: "template", value: t })}
        />
      ))}
    </div>
  );
}
