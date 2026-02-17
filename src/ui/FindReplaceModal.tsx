import React, { useEffect, useRef } from "react";
import type { FindReplaceOptions } from "../lib/findReplace";

export const FindReplaceModal: React.FC<{
  query: string;
  replacement: string;
  options: FindReplaceOptions;
  totalMatches: number;
  activeMatchNumber: number;
  onChangeQuery: (value: string) => void;
  onChangeReplacement: (value: string) => void;
  onChangeOptions: (options: FindReplaceOptions) => void;
  onNext: () => void;
  onPrevious: () => void;
  onReplace: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}> = ({
  query,
  replacement,
  options,
  totalMatches,
  activeMatchNumber,
  onChangeQuery,
  onChangeReplacement,
  onChangeOptions,
  onNext,
  onPrevious,
  onReplace,
  onReplaceAll,
  onClose
}) => {
  const queryRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    queryRef.current?.focus();
    queryRef.current?.select();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (event.shiftKey) {
          onPrevious();
        } else {
          onNext();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, onNext, onPrevious]);

  const countLabel =
    totalMatches > 0 ? `${activeMatchNumber} / ${totalMatches}` : "No matches";

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <div
        className="modal find-replace-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="find-replace-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="panel-header">
          <div>
            <h3 id="find-replace-title">Find & Replace</h3>
            <p className="muted">Enter to find next, Shift+Enter for previous.</p>
          </div>
          <span className="tag">{countLabel}</span>
        </div>

        <div className="find-replace-grid">
          <label className="field">
            <span>Find</span>
            <input
              ref={queryRef}
              value={query}
              onChange={(event) => onChangeQuery(event.target.value)}
              placeholder="Search text"
            />
          </label>

          <label className="field">
            <span>Replace with</span>
            <input
              value={replacement}
              onChange={(event) => onChangeReplacement(event.target.value)}
              placeholder="Replacement text"
            />
          </label>
        </div>

        <div className="row">
          <label className="toggle compact">
            <input
              type="checkbox"
              checked={options.matchCase}
              onChange={(event) =>
                onChangeOptions({ ...options, matchCase: event.target.checked })
              }
            />
            Match case
          </label>
          <label className="toggle compact">
            <input
              type="checkbox"
              checked={options.wholeWord}
              onChange={(event) =>
                onChangeOptions({ ...options, wholeWord: event.target.checked })
              }
            />
            Whole word
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="ghost" onClick={onPrevious}>
            Previous
          </button>
          <button type="button" className="ghost" onClick={onNext}>
            Next
          </button>
          <button type="button" className="ghost" onClick={onReplace}>
            Replace
          </button>
          <button type="button" className="primary" onClick={onReplaceAll}>
            Replace all
          </button>
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
