import React from "react";
import type { StageId } from "../state/types";
import type { StageConfig } from "../agents/pipeline";

export const PipelinePanel: React.FC<{
  stages: StageConfig[];
  currentStage: StageId;
  onRun: (stage: StageConfig) => void;
  runningStageId?: StageId | null;
}> = ({ stages, currentStage, onRun, runningStageId }) => (
  <div className="panel pipeline">
    <h3>Agent Pipeline</h3>
    <p className="muted">Run a stage to create a new revision.</p>
    <div className="pipeline-list">
      {stages.map((stage) => {
        const isRunning = runningStageId === stage.id;
        return (
          <button
            key={stage.id}
            type="button"
            className={`pipeline-item${stage.id === currentStage ? " active" : ""}${
              runningStageId ? " disabled" : ""
            }`}
            onClick={() => onRun(stage)}
            disabled={Boolean(runningStageId)}
          >
            <div>
              <strong>{stage.label}</strong>
              <p>{isRunning ? "Running..." : stage.description}</p>
            </div>
            <span className="tag">{isRunning ? "Running" : stage.id}</span>
          </button>
        );
      })}
    </div>
  </div>
);
