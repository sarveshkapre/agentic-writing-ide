import React, { useEffect, useRef } from "react";

export type ConfirmDialogAction = {
  id: string;
  label: string;
  variant?: "primary" | "ghost";
  onSelect: () => void;
};

export const ConfirmDialog: React.FC<{
  title: string;
  description: string;
  actions: ConfirmDialogAction[];
  onClose: () => void;
}> = ({ title, description, actions, onClose }) => {
  const primaryRef = useRef<HTMLButtonElement | null>(null);

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
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h3 id="confirm-title">{title}</h3>
        <p className="muted" id="confirm-description">
          {description}
        </p>
        <div className="modal-actions">
          {actions.map((action, index) => (
            <button
              key={action.id}
              ref={index === 0 ? primaryRef : undefined}
              type="button"
              className={action.variant === "ghost" ? "ghost" : undefined}
              onClick={action.onSelect}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

