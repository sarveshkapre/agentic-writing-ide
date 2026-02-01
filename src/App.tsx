import React, { useEffect, useMemo, useState } from "react";
import { runLlmStage } from "./agents/llmAdapter";
import { stages } from "./agents/pipeline";
import { DiffView } from "./lib/diff";
import { createId } from "./lib/id";
import { renderMarkdown } from "./lib/markdown";
import { exportState, importState, saveState } from "./state/persistence";
import { useStore } from "./state/store";
import type { Revision, StageId } from "./state/types";
import { Editor } from "./ui/Editor";
import { HistoryPanel } from "./ui/HistoryPanel";
import { MarkdownPreview } from "./ui/MarkdownPreview";
import { PipelinePanel } from "./ui/PipelinePanel";
import { SettingsPanel } from "./ui/SettingsPanel";
import "./styles.css";

const nowIso = () => new Date().toISOString();

const stageLabel = (stage: StageId) =>
  stages.find((item) => item.id === stage)?.label ?? stage;

const downloadFile = (name: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

const wrapHtml = (title: string, body: string) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    body { font-family: "Space Grotesk", sans-serif; margin: 2rem; line-height: 1.6; }
    h1, h2, h3 { font-family: "Fraunces", serif; }
    blockquote { padding: 0.5rem 1rem; background: #f3efe6; border-left: 4px solid #0c6b68; }
  </style>
</head>
<body>
${body}
</body>
</html>`;

export const App: React.FC = () => {
  const { state, dispatch } = useStore();
  const [saveStatus, setSaveStatus] = useState("Idle");
  const [branchName, setBranchName] = useState("");
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [diffMode, setDiffMode] = useState<"inline" | "side">("inline");
  const [llmStatus, setLlmStatus] = useState("Not tested");

  const doc = state.document;
  const selectedRevision = doc.revisions[state.selectedRevisionId];
  const currentBranch = doc.branches[doc.currentBranchId];
  const compareRevision = state.compareRevisionId
    ? doc.revisions[state.compareRevisionId]
    : null;

  useEffect(() => {
    const timeout = setTimeout(() => {
      saveState(state);
      setSaveStatus(`Saved ${new Date().toLocaleTimeString()}`);
    }, 200);
    return () => clearTimeout(timeout);
  }, [state]);

  const branchOptions = useMemo(
    () => Object.values(doc.branches),
    [doc.branches]
  );

  const mergeOptions = useMemo(
    () => branchOptions.filter((branch) => branch.id !== currentBranch.id),
    [branchOptions, currentBranch.id]
  );

  const handleRunStage = async (stageId: StageId) => {
    const stage = stages.find((item) => item.id === stageId);
    if (!stage) return;

    if (state.settings.llm.enabled) {
      const result = await runLlmStage({
        stage: stageId,
        input: selectedRevision.content,
        model: state.settings.llm.model
      });
      const revision: Revision = {
        id: createId(),
        parentId: selectedRevision.id,
        createdAt: nowIso(),
        author: "agent",
        content: result.output,
        rationale: result.rationale,
        stage: stageId
      };
      dispatch({ type: "ADD_REVISION", revision });
      return;
    }

    const { output, rationale } = stage.run(selectedRevision.content);
    const revision: Revision = {
      id: createId(),
      parentId: selectedRevision.id,
      createdAt: nowIso(),
      author: "agent",
      content: output,
      rationale: rationale,
      stage: stageId
    };
    dispatch({ type: "ADD_REVISION", revision });
  };

  const handleCommitDraft = () => {
    const revision: Revision = {
      id: createId(),
      parentId: selectedRevision.id,
      createdAt: nowIso(),
      author: "user",
      content: selectedRevision.content,
      rationale: "Manual edit commit",
      stage: selectedRevision.stage
    };
    dispatch({ type: "ADD_REVISION", revision });
  };

  const handleCreateBranch = () => {
    const trimmed = branchName.trim();
    if (!trimmed) return;
    dispatch({
      type: "CREATE_BRANCH",
      name: trimmed,
      fromRevisionId: selectedRevision.id
    });
    setBranchName("");
  };

  const handleSwitchBranch = (branchId: string) => {
    dispatch({ type: "SWITCH_BRANCH", branchId });
  };

  const handleMergeBranch = () => {
    const source = mergeOptions.find((branch) => branch.id === mergeSourceId);
    if (!source) return;
    const sourceHead = doc.revisions[source.headRevisionId];
    const revision: Revision = {
      id: createId(),
      parentId: currentBranch.headRevisionId,
      createdAt: nowIso(),
      author: "user",
      content: sourceHead.content,
      rationale: `Merged from branch ${source.name}`,
      stage: sourceHead.stage
    };
    dispatch({ type: "ADD_REVISION", revision });
  };

  const handleExport = () => {
    const data = exportState(state);
    downloadFile("agentic-writing-ide.json", data, "application/json");
  };

  const handleExportHtml = () => {
    const html = renderMarkdown(selectedRevision.content);
    const docHtml = wrapHtml(doc.title, html);
    downloadFile("agentic-draft.html", docHtml, "text/html");
  };

  const handleExportPdf = () => {
    const html = renderMarkdown(selectedRevision.content);
    const docHtml = wrapHtml(doc.title, html);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(docHtml);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleImport = (file: File | null) => {
    if (!file) return;
    file.text().then((text) => {
      const imported = importState(text);
      dispatch({ type: "RESET", state: imported });
    });
  };

  const handleTestStub = async () => {
    setLlmStatus("Testing...");
    const result = await runLlmStage({
      stage: "draft",
      input: selectedRevision.content,
      model: state.settings.llm.model
    });
    setLlmStatus(`Stub ready: ${result.rationale}`);
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isCommand = event.metaKey || event.ctrlKey;
      if (!isCommand) return;

      if (event.key === "s") {
        event.preventDefault();
        handleCommitDraft();
      }
      if (event.key === "1") {
        event.preventDefault();
        void handleRunStage("draft");
      }
      if (event.key === "2") {
        event.preventDefault();
        void handleRunStage("critique");
      }
      if (event.key === "3") {
        event.preventDefault();
        void handleRunStage("revise");
      }
      if (event.key === "4") {
        event.preventDefault();
        void handleRunStage("polish");
      }
      if (event.shiftKey && event.key.toLowerCase() === "e") {
        event.preventDefault();
        handleExport();
      }
      if (event.shiftKey && event.key.toLowerCase() === "h") {
        event.preventDefault();
        handleExportHtml();
      }
      if (event.shiftKey && event.key.toLowerCase() === "p") {
        event.preventDefault();
        handleExportPdf();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    handleCommitDraft,
    handleExport,
    handleExportHtml,
    handleExportPdf,
    handleRunStage
  ]);

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Agentic Writing IDE</p>
          <h1>Draft, critique, revise, and polish.</h1>
        </div>
        <div className="topbar-actions">
          <span className="status">{saveStatus}</span>
          <button className="ghost" type="button" onClick={handleExport}>
            Export JSON
          </button>
          <button className="ghost" type="button" onClick={handleExportHtml}>
            Export HTML
          </button>
          <button className="ghost" type="button" onClick={handleExportPdf}>
            Export PDF
          </button>
          <label className="ghost file">
            Import JSON
            <input
              type="file"
              accept="application/json"
              onChange={(event) => handleImport(event.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      </header>

      <main className="layout">
        <section className="workspace">
          <div className="workspace-header">
            <div>
              <label className="field">
                <span>Document title</span>
                <input
                  value={doc.title}
                  onChange={(event) =>
                    dispatch({ type: "UPDATE_TITLE", title: event.target.value })
                  }
                />
              </label>
              <p className="muted">
                Stage: {stageLabel(selectedRevision.stage)} · Author:{" "}
                {selectedRevision.author}
              </p>
            </div>
            <div className="branch-controls">
              <label className="field">
                <span>Branch</span>
                <select
                  value={doc.currentBranchId}
                  onChange={(event) => handleSwitchBranch(event.target.value)}
                >
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="branch-new">
                <input
                  placeholder="New branch name"
                  value={branchName}
                  onChange={(event) => setBranchName(event.target.value)}
                />
                <button type="button" onClick={handleCreateBranch}>
                  Create
                </button>
              </div>
              <div className="branch-merge">
                <select
                  value={mergeSourceId}
                  onChange={(event) => setMergeSourceId(event.target.value)}
                >
                  <option value="">Merge from branch</option>
                  {mergeOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <button type="button" onClick={handleMergeBranch}>
                  Merge
                </button>
              </div>
            </div>
          </div>

          <div className="editor-grid">
            <div className="panel">
              <h3>Draft</h3>
              <Editor
                value={selectedRevision.content}
                onChange={(value) =>
                  dispatch({ type: "UPDATE_CONTENT", content: value })
                }
              />
              <button
                className="primary"
                type="button"
                onClick={handleCommitDraft}
              >
                Commit manual edit
              </button>
            </div>
            <div className="panel">
              <h3>Preview</h3>
              <MarkdownPreview markdown={selectedRevision.content} />
            </div>
          </div>

          {compareRevision ? (
            <div className="panel">
              <div className="diff-header">
                <div>
                  <h3>Diff</h3>
                  <p className="muted">
                    Comparing {compareRevision.stage} → {selectedRevision.stage}
                  </p>
                </div>
                <div className="diff-controls">
                  <button
                    type="button"
                    className={diffMode === "inline" ? "ghost active" : "ghost"}
                    onClick={() => setDiffMode("inline")}
                  >
                    Inline
                  </button>
                  <button
                    type="button"
                    className={diffMode === "side" ? "ghost active" : "ghost"}
                    onClick={() => setDiffMode("side")}
                  >
                    Side-by-side
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    onClick={() => dispatch({ type: "COMPARE_REVISION", revisionId: null })}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <DiffView
                before={compareRevision.content}
                after={selectedRevision.content}
                mode={diffMode}
              />
            </div>
          ) : null}
        </section>

        <aside className="sidebar">
          <PipelinePanel
            stages={stages}
            currentStage={selectedRevision.stage}
            onRun={(stage) => void handleRunStage(stage.id)}
          />
          <HistoryPanel
            branch={currentBranch}
            revisions={doc.revisions}
            selectedId={selectedRevision.id}
            compareId={state.compareRevisionId}
            stages={stages.map((stage) => stage.id)}
            onSelect={(id) => dispatch({ type: "SELECT_REVISION", revisionId: id })}
            onCompare={(id) => dispatch({ type: "COMPARE_REVISION", revisionId: id })}
          />
          <SettingsPanel
            settings={state.settings.llm}
            onChange={(settings) =>
              dispatch({ type: "UPDATE_LLM_SETTINGS", settings })
            }
            onTest={handleTestStub}
            testStatus={llmStatus}
          />
          <div className="panel shortcuts">
            <h3>Shortcuts</h3>
            <p className="muted">Cmd/Ctrl + 1-4: run stages</p>
            <p className="muted">Cmd/Ctrl + S: commit edit</p>
            <p className="muted">Cmd/Ctrl + Shift + E: export JSON</p>
            <p className="muted">Cmd/Ctrl + Shift + H: export HTML</p>
            <p className="muted">Cmd/Ctrl + Shift + P: export PDF</p>
          </div>
        </aside>
      </main>
    </div>
  );
};
