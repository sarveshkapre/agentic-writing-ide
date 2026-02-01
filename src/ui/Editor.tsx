import React from "react";

export const Editor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => (
  <label className="editor" aria-label="Markdown editor">
    <span className="sr-only">Markdown editor</span>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      spellCheck
    />
  </label>
);
