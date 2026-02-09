import React from "react";
import type { LlmSettings } from "../state/types";

export const SettingsPanel: React.FC<{
  settings: LlmSettings;
  onChange: (settings: LlmSettings) => void;
  onTest: () => void;
  onRefreshModels: () => void;
  testStatus: string;
  models: string[];
}> = ({ settings, onChange, onTest, onRefreshModels, testStatus, models }) => (
  <div className="panel settings">
    <h3>LLM Settings</h3>
    <p className="muted">
      Optional local providers. If disabled (or provider fails), the pipeline runs fully
      offline.
    </p>
    <label className="toggle">
      <input
        type="checkbox"
        checked={settings.enabled}
        onChange={(event) =>
          onChange({ ...settings, enabled: event.target.checked })
        }
      />
      Enable LLM pipeline
    </label>
    <label className="field">
      <span>Provider</span>
      <select
        value={settings.provider}
        onChange={(event) =>
          onChange({
            ...settings,
            provider:
              event.target.value === "ollama" ? "ollama" : ("stub" as const)
          })
        }
      >
        <option value="stub">Stub (offline)</option>
        <option value="ollama">Ollama (local)</option>
      </select>
    </label>
    {settings.provider === "ollama" ? (
      <>
        <label className="field">
          <span>Ollama base URL</span>
          <input
            value={settings.baseUrl}
            placeholder="http://localhost:11434"
            onChange={(event) =>
              onChange({ ...settings, baseUrl: event.target.value })
            }
          />
        </label>
        <label className="field">
          <span>Model</span>
          <input
            list="ollama-models"
            value={settings.model}
            placeholder="llama3.1:latest"
            onChange={(event) =>
              onChange({ ...settings, model: event.target.value })
            }
          />
          <datalist id="ollama-models">
            {models.map((model) => (
              <option key={model} value={model} />
            ))}
          </datalist>
        </label>
        <div className="row">
          <button type="button" className="ghost" onClick={onTest}>
            Test connection
          </button>
          <button type="button" className="ghost" onClick={onRefreshModels}>
            Refresh models
          </button>
        </div>
      </>
    ) : (
      <>
        <label className="field">
          <span>Model name</span>
          <input
            value={settings.model}
            onChange={(event) =>
              onChange({ ...settings, model: event.target.value })
            }
          />
        </label>
        <button type="button" className="ghost" onClick={onTest}>
          Test stub
        </button>
      </>
    )}
    <p className="muted">{testStatus}</p>
  </div>
);
