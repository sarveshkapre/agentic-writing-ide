import React, { useCallback, useEffect, useId, useRef } from "react";

export const Editor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  typewriter?: boolean;
}> = ({ value, onChange, typewriter = false }) => {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const centerCursor = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const style = window.getComputedStyle(el);
    const rawLineHeight = style.lineHeight;
    const rawFontSize = style.fontSize;
    const lineHeightParsed = Number.parseFloat(rawLineHeight);
    const fontSizeParsed = Number.parseFloat(rawFontSize);
    const lineHeight = Number.isFinite(lineHeightParsed)
      ? lineHeightParsed
      : Number.isFinite(fontSizeParsed)
        ? fontSizeParsed * 1.5
        : 20;

    const caret = typeof el.selectionStart === "number" ? el.selectionStart : 0;
    const before = el.value.slice(0, caret);
    const lineIndex = before.split("\n").length - 1;

    const targetTop =
      lineIndex * lineHeight - el.clientHeight / 2 + lineHeight * 1.5;
    const next = Math.max(0, targetTop);

    // Avoid tiny scroll jitter on every keystroke.
    if (Math.abs(el.scrollTop - next) > lineHeight / 3) {
      el.scrollTop = next;
    }
  }, []);

  const scheduleCenter = useCallback(() => {
    if (!typewriter) return;
    const raf =
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame
        : (cb: FrameRequestCallback) => window.setTimeout(cb, 0);
    raf(() => centerCursor());
  }, [centerCursor, typewriter]);

  useEffect(() => {
    // When toggling typewriter mode on, center immediately.
    if (typewriter) scheduleCenter();
  }, [scheduleCenter, typewriter]);

  return (
    <div className="editor">
      <label className="sr-only" htmlFor={id}>
        Markdown editor
      </label>
      <textarea
        id={id}
        aria-label="Markdown editor"
        ref={ref}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          scheduleCenter();
        }}
        onKeyUp={scheduleCenter}
        onClick={scheduleCenter}
        spellCheck
      />
    </div>
  );
};
