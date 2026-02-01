import React from "react";
import type { LlmSettings } from "../state/types";

export const SettingsPanel: React.FC<{
  settings: LlmSettings;
  onChange: (settings: LlmSettings) => void;
  onTest: () => void;
  testStatus: string;
}> = ({ settings, onChange, onTest, testStatus }) => (
  <div className="panel settings">
    <h3>LLM Settings (Stub)</h3>
    <p className="muted">
      Local-first stub. Replace with real provider integration later.
    </p>
    <label className="toggle">
      <input
        type="checkbox"
        checked={settings.enabled}
        onChange={(event) =>
          onChange({ ...settings, enabled: event.target.checked })
        }
      />
      Enable LLM pipeline (stub)
    </label>
    <label className="field">
      <span>Model name</span>
      <input
        value={settings.model}
        onChange={(event) =>
          onChange({ ...settings, model: event.target.value })
        }
      />
    </label>
    <label className="field">
      <span>API key (stored locally)</span>
      <input
        type="password"
        value={settings.apiKey}
        onChange={(event) =>
          onChange({ ...settings, apiKey: event.target.value })
        }
      />
    </label>
    <button type="button" className="ghost" onClick={onTest}>
      Test stub
    </button>
    <p className="muted">{testStatus}</p>
  </div>
);
