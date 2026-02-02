import React from "react";
import { formatNumber } from "../lib/metrics";

export const MetricsPanel: React.FC<{
  wordCount: number;
  readingTime: string;
  targetWords: number;
  progress: number;
  stageLabel: string;
  lastUpdated: string;
  isDirty: boolean;
}> = ({
  wordCount,
  readingTime,
  targetWords,
  progress,
  stageLabel,
  lastUpdated,
  isDirty
}) => {
  const targetLabel =
    targetWords > 0 ? `${formatNumber(targetWords)} words` : "Set a target";
  const progressLabel =
    targetWords > 0
      ? `${formatNumber(wordCount)} / ${formatNumber(targetWords)} words`
      : "Add a target length for progress.";

  return (
    <div className="panel metrics">
      <div className="panel-header">
        <div>
          <h3>Writing Metrics</h3>
          <p className="muted">Track progress and keep drafts on target.</p>
        </div>
        {isDirty ? <span className="tag dirty">Uncommitted</span> : null}
      </div>
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Word count</span>
          <strong className="metric-value">{formatNumber(wordCount)}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Reading time</span>
          <strong className="metric-value">{readingTime}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">Target length</span>
          <strong className="metric-value">{targetLabel}</strong>
          <div className="progress-track" aria-hidden="true">
            <span className="progress-bar" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="muted">{progressLabel}</p>
        </div>
      </div>
      <p className="muted">
        Stage: {stageLabel} · Last revision: {lastUpdated}
      </p>
    </div>
  );
};
