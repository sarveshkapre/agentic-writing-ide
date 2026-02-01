import React, { useId } from "react";

export const Editor: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const id = useId();

  return (
    <div className="editor">
      <label className="sr-only" htmlFor={id}>
        Markdown editor
      </label>
      <textarea
        id={id}
        aria-label="Markdown editor"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck
      />
    </div>
  );
};
