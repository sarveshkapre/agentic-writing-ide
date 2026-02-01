import React from "react";
import type { StageId } from "../state/types";
import type { StageConfig } from "../agents/pipeline";

export const PipelinePanel: React.FC<{
  stages: StageConfig[];
  currentStage: StageId;
  onRun: (stage: StageConfig) => void;
}> = ({ stages, currentStage, onRun }) => (
  <div className="panel pipeline">
    <h3>Agent Pipeline</h3>
    <p className="muted">Run a stage to create a new revision.</p>
    <div className="pipeline-list">
      {stages.map((stage) => (
        <button
          key={stage.id}
          type="button"
          className={`pipeline-item${stage.id === currentStage ? " active" : ""}`}
          onClick={() => onRun(stage)}
        >
          <div>
            <strong>{stage.label}</strong>
            <p>{stage.description}</p>
          </div>
          <span className="tag">{stage.id}</span>
        </button>
      ))}
    </div>
  </div>
);
