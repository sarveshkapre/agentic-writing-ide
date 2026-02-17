import React, { useEffect, useMemo, useRef } from "react";

type Shortcut = {
  keys: string;
  description: string;
};

export const ShortcutsModal: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const primaryRef = useRef<HTMLButtonElement | null>(null);

  const shortcuts = useMemo<Shortcut[]>(
    () => [
      { keys: "Cmd/Ctrl + 1-4", description: "Run pipeline stages" },
      { keys: "Cmd/Ctrl + S", description: "Commit edit" },
      { keys: "Cmd/Ctrl + K", description: "Open command palette" },
      { keys: "Cmd/Ctrl + H", description: "Find and replace" },
      { keys: "Cmd/Ctrl + F", description: "Search" },
      { keys: "Cmd/Ctrl + Shift + E", description: "Export JSON" },
      { keys: "Cmd/Ctrl + Shift + H", description: "Export HTML" },
      { keys: "Cmd/Ctrl + Shift + M", description: "Export Markdown" },
      { keys: "Cmd/Ctrl + Shift + P", description: "Print / PDF" },
      { keys: "Cmd/Ctrl + Shift + O", description: "Generate outline" },
      { keys: "Cmd/Ctrl + Shift + F", description: "Toggle focus mode" },
      { keys: "Cmd/Ctrl + Shift + T", description: "Toggle typewriter mode" },
      { keys: "Cmd/Ctrl + /", description: "Show shortcuts" }
    ],
    []
  );

  useEffect(() => {
    primaryRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal shortcuts-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="shortcuts-title">Keyboard Shortcuts</h3>
        <p className="muted">Keep your hands on the keyboard.</p>
        <div className="shortcuts-grid" role="list">
          {shortcuts.map((shortcut) => (
            <div key={shortcut.keys} className="shortcuts-row" role="listitem">
              <code className="shortcut-keys">{shortcut.keys}</code>
              <span className="shortcut-desc">{shortcut.description}</span>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button ref={primaryRef} type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
