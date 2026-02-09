import React from "react";
import type { LlmSettings } from "../state/types";

const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const DEFAULT_OPENAI_COMPAT_URL = "http://localhost:1234/v1";

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
        onChange={(event) => {
          const nextProvider =
            event.target.value === "ollama"
              ? "ollama"
              : event.target.value === "openai-compatible"
                ? "openai-compatible"
                : ("stub" as const);

          const nextBaseUrl =
            nextProvider === "ollama"
              ? settings.baseUrl === DEFAULT_OPENAI_COMPAT_URL ||
                settings.baseUrl.trim() === ""
                ? DEFAULT_OLLAMA_URL
                : settings.baseUrl
              : nextProvider === "openai-compatible"
                ? settings.baseUrl === DEFAULT_OLLAMA_URL ||
                  settings.baseUrl.trim() === ""
                  ? DEFAULT_OPENAI_COMPAT_URL
                  : settings.baseUrl
                : settings.baseUrl;

          onChange({
            ...settings,
            provider: nextProvider,
            baseUrl: nextBaseUrl
          });
        }}
      >
        <option value="stub">Stub (offline)</option>
        <option value="ollama">Ollama (local)</option>
        <option value="openai-compatible">OpenAI-compatible (local)</option>
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
    ) : settings.provider === "openai-compatible" ? (
      <>
        <label className="field">
          <span>Base URL</span>
          <input
            value={settings.baseUrl}
            placeholder={DEFAULT_OPENAI_COMPAT_URL}
            onChange={(event) =>
              onChange({ ...settings, baseUrl: event.target.value })
            }
          />
        </label>
        <label className="field">
          <span>API key (optional)</span>
          <input
            value={settings.apiKey}
            type="password"
            autoComplete="off"
            placeholder="(leave blank for LM Studio)"
            onChange={(event) =>
              onChange({ ...settings, apiKey: event.target.value })
            }
          />
        </label>
        <label className="field">
          <span>Model</span>
          <input
            list="openai-models"
            value={settings.model}
            placeholder="(select or type a model id)"
            onChange={(event) =>
              onChange({ ...settings, model: event.target.value })
            }
          />
          <datalist id="openai-models">
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
