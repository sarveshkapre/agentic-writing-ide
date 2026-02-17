import React, { useEffect, useMemo, useRef, useState } from "react";

export type CommandPaletteAction = {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  onSelect: () => void;
};

export const CommandPalette: React.FC<{
  actions: CommandPaletteAction[];
  onClose: () => void;
}> = ({ actions, onClose }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredActions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((action) => {
      const haystack = `${action.label} ${action.description} ${action.shortcut ?? ""}`;
      return haystack.toLowerCase().includes(q);
    });
  }, [actions, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (filteredActions.length === 0) return;
        setActiveIndex((index) => (index + 1) % filteredActions.length);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (filteredActions.length === 0) return;
        setActiveIndex((index) =>
          index <= 0 ? filteredActions.length - 1 : index - 1
        );
      }
      if (event.key === "Enter") {
        const action = filteredActions[activeIndex];
        if (!action) return;
        event.preventDefault();
        action.onSelect();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, filteredActions, onClose]);

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal command-palette-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-palette-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="command-palette-title">Command Palette</h3>
        <p className="muted">Keyboard-first actions for writing workflows.</p>
        <label className="field">
          <span className="sr-only">Search commands</span>
          <input
            ref={inputRef}
            aria-label="Search commands"
            placeholder="Search commands..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="command-palette-list" role="listbox" aria-label="Commands">
          {filteredActions.length === 0 ? (
            <p className="muted empty">No commands match this query.</p>
          ) : (
            filteredActions.map((action, index) => (
              <button
                key={action.id}
                type="button"
                className={`command-palette-item${index === activeIndex ? " active" : ""}`}
                role="option"
                aria-selected={index === activeIndex}
                onClick={() => {
                  action.onSelect();
                  onClose();
                }}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div>
                  <strong>{action.label}</strong>
                  <p className="muted">{action.description}</p>
                </div>
                {action.shortcut ? <code>{action.shortcut}</code> : null}
              </button>
            ))
          )}
        </div>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
