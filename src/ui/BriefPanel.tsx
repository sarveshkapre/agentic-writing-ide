import React, { useMemo, useState } from "react";
import type { ProjectBrief } from "../state/types";
import type { Template } from "../lib/templates";

const TONES = [
  "Clear, confident, and concise",
  "Analytical and structured",
  "Warm and approachable",
  "Persuasive and energetic",
  "Narrative and reflective",
  "Technical and precise"
];

export const BriefPanel: React.FC<{
  brief: ProjectBrief;
  templates: Template[];
  onUpdate: (brief: Partial<ProjectBrief>) => void;
  onApplyTemplate: (templateId: string) => void;
  onGenerateOutline: () => void;
}> = ({ brief, templates, onUpdate, onApplyTemplate, onGenerateOutline }) => {
  const [keyPointDraft, setKeyPointDraft] = useState("");

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === brief.templateId) ?? templates[0],
    [brief.templateId, templates]
  );

  const handleAddKeyPoint = () => {
    const trimmed = keyPointDraft.trim();
    if (!trimmed) return;
    onUpdate({ keyPoints: [...brief.keyPoints, trimmed] });
    setKeyPointDraft("");
  };

  const handleKeyPointKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddKeyPoint();
    }
  };

  const handleRemoveKeyPoint = (index: number) => {
    const next = brief.keyPoints.filter((_, itemIndex) => itemIndex !== index);
    onUpdate({ keyPoints: next });
  };

  return (
    <div className="panel brief">
      <div className="panel-header">
        <div>
          <h3>Project Brief</h3>
          <p className="muted">Clarify the audience and intent before the pipeline runs.</p>
        </div>
        <button
          type="button"
          className="ghost small"
          onClick={() => onGenerateOutline()}
        >
          Generate outline
        </button>
      </div>

      <div className="template-picker">
        <label className="field">
          <span>Template</span>
          <select
            value={selectedTemplate?.id}
            onChange={(event) => onUpdate({ templateId: event.target.value })}
          >
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </label>
        <div className="template-meta">
          <p className="muted">{selectedTemplate?.description}</p>
          <button
            type="button"
            className="ghost"
            onClick={() => selectedTemplate && onApplyTemplate(selectedTemplate.id)}
          >
            Apply template
          </button>
        </div>
      </div>

      <div className="brief-grid">
        <label className="field">
          <span>Audience</span>
          <input
            value={brief.audience}
            onChange={(event) => onUpdate({ audience: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Goal</span>
          <input
            value={brief.goal}
            onChange={(event) => onUpdate({ goal: event.target.value })}
          />
        </label>
        <label className="field">
          <span>Tone</span>
          <select
            value={brief.tone}
            onChange={(event) => onUpdate({ tone: event.target.value })}
          >
            {TONES.map((tone) => (
              <option key={tone} value={tone}>
                {tone}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Target length (words)</span>
          <input
            type="number"
            min={0}
            value={Number.isNaN(brief.length) ? "" : brief.length}
            onChange={(event) =>
              onUpdate({
                length: Number(event.target.value || 0)
              })
            }
          />
        </label>
      </div>

      <label className="field">
        <span>Constraints</span>
        <textarea
          value={brief.constraints}
          onChange={(event) => onUpdate({ constraints: event.target.value })}
          rows={3}
        />
      </label>

      <div className="keypoints">
        <div className="keypoints-header">
          <span className="muted">Key points</span>
          <span className="muted">{brief.keyPoints.length} items</span>
        </div>
        {brief.keyPoints.length === 0 ? (
          <p className="muted empty">Add 3-5 points you must cover.</p>
        ) : (
          <div className="chip-list">
            {brief.keyPoints.map((point, index) => (
              <div key={`${point}-${index}`} className="chip">
                <span>{point}</span>
                <button
                  type="button"
                  aria-label={`Remove ${point}`}
                  onClick={() => handleRemoveKeyPoint(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="chip-input">
          <input
            placeholder="Add a key point"
            value={keyPointDraft}
            onChange={(event) => setKeyPointDraft(event.target.value)}
            onKeyDown={handleKeyPointKeyDown}
          />
          <button type="button" className="ghost" onClick={handleAddKeyPoint}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
