import React, { useMemo } from "react";
import { renderMarkdown } from "../lib/markdown";

export const MarkdownPreview: React.FC<{ markdown: string }> = ({
  markdown
}) => {
  const html = useMemo(() => {
    return renderMarkdown(markdown);
  }, [markdown]);

  return (
    <div
      className="preview"
      aria-label="Markdown preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
