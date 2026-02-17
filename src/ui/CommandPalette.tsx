import React, { useEffect, useRef } from "react";

export const CommandPalette: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
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
            placeholder="Search commands (coming in next update)..."
            readOnly
            value=""
          />
        </label>
        <p className="muted empty">Command list loading is staged in the next commit.</p>
        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
