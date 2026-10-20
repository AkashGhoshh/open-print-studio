import React from "react";
import { CreditCard, Check } from "lucide-react";
import type { IdCardTemplate } from "../../services/crop/template-types";

interface TemplateSelectorProps {
  templates: IdCardTemplate[];
  selectedTemplateId: string;
  onSelect: (template: IdCardTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplateId,
  onSelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
        Template:
      </span>
      {templates.map((tmpl) => {
        const isSelected = tmpl.id === selectedTemplateId;
        return (
          <button
            key={tmpl.id}
            onClick={() => onSelect(tmpl)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              backgroundColor: isSelected ? "var(--ops-primary)" : "var(--ops-bg-card)",
              color: isSelected ? "#FFFFFF" : "var(--ops-text-secondary)",
              border: `1px solid ${isSelected ? "var(--ops-primary)" : "var(--ops-border)"}`,
            }}
          >
            {isSelected ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <CreditCard className="w-3.5 h-3.5 opacity-60" />
            )}
            <span>{tmpl.name}</span>
            <span
              className="text-[10px] px-1 py-0.2 rounded"
              style={{
                backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "var(--ops-bg-surface)",
                color: isSelected ? "#FFFFFF" : "var(--ops-text-muted)",
              }}
            >
              {tmpl.back ? "Dual Side" : "Front Only"}
            </span>
          </button>
        );
      })}
    </div>
  );
};
