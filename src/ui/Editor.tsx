import React, { useCallback, useEffect, useId, useRef } from "react";

export type EditorApi = {
  jumpTo: (index: number) => void;
  selectRange: (start: number, end: number) => void;
  focus: () => void;
  getCursor: () => number;
  getSelection: () => { start: number; end: number };
};

export const Editor: React.FC<{
  value: string;
  onChange: (value: string) => void;
  typewriter?: boolean;
  onCursorChange?: (index: number) => void;
  apiRef?: React.MutableRefObject<EditorApi | null>;
}> = ({ value, onChange, typewriter = false, onCursorChange, apiRef }) => {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const readLineHeight = useCallback((el: HTMLTextAreaElement): number => {
    const style = window.getComputedStyle(el);
    const rawLineHeight = style.lineHeight;
    const rawFontSize = style.fontSize;
    const lineHeightParsed = Number.parseFloat(rawLineHeight);
    const fontSizeParsed = Number.parseFloat(rawFontSize);
    return Number.isFinite(lineHeightParsed)
      ? lineHeightParsed
      : Number.isFinite(fontSizeParsed)
        ? fontSizeParsed * 1.5
        : 20;
  }, []);

  const centerCursor = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const lineHeight = readLineHeight(el);

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
  }, [readLineHeight]);

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

  const reportCursor = useCallback(() => {
    if (!onCursorChange) return;
    const el = ref.current;
    if (!el) return;
    const caret = typeof el.selectionStart === "number" ? el.selectionStart : 0;
    onCursorChange(caret);
  }, [onCursorChange]);

  const jumpTo = useCallback(
    (index: number) => {
      const el = ref.current;
      if (!el) return;
      const next = Math.max(0, Math.min(index, el.value.length));
      el.focus();
      el.selectionStart = next;
      el.selectionEnd = next;
      const lineHeight = readLineHeight(el);
      const before = el.value.slice(0, next);
      const lineIndex = before.split("\n").length - 1;
      const targetTop = Math.max(0, lineIndex * lineHeight - el.clientHeight / 3);
      el.scrollTop = targetTop;
      reportCursor();
      scheduleCenter();
    },
    [readLineHeight, reportCursor, scheduleCenter]
  );

  const selectRange = useCallback(
    (start: number, end: number) => {
      const el = ref.current;
      if (!el) return;

      const nextStart = Math.max(0, Math.min(start, el.value.length));
      const nextEnd = Math.max(nextStart, Math.min(end, el.value.length));

      el.focus();
      el.selectionStart = nextStart;
      el.selectionEnd = nextEnd;

      const lineHeight = readLineHeight(el);
      const before = el.value.slice(0, nextStart);
      const lineIndex = before.split("\n").length - 1;
      const targetTop = Math.max(0, lineIndex * lineHeight - el.clientHeight / 3);
      el.scrollTop = targetTop;

      reportCursor();
      scheduleCenter();
    },
    [readLineHeight, reportCursor, scheduleCenter]
  );

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      jumpTo,
      selectRange,
      focus: () => ref.current?.focus(),
      getCursor: () =>
        typeof ref.current?.selectionStart === "number"
          ? (ref.current?.selectionStart as number)
          : 0,
      getSelection: () => ({
        start:
          typeof ref.current?.selectionStart === "number"
            ? (ref.current?.selectionStart as number)
            : 0,
        end:
          typeof ref.current?.selectionEnd === "number"
            ? (ref.current?.selectionEnd as number)
            : 0
      })
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, jumpTo, selectRange]);

  return (
    <div className="editor">
      <label className="sr-only" htmlFor={id}>
        Markdown editor
      </label>
      <textarea
        data-testid="editor-input"
        id={id}
        aria-label="Markdown editor"
        ref={ref}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          scheduleCenter();
          if (onCursorChange) {
            const caret =
              typeof event.currentTarget.selectionStart === "number"
                ? event.currentTarget.selectionStart
                : 0;
            onCursorChange(caret);
          }
        }}
        onKeyUp={() => {
          scheduleCenter();
          reportCursor();
        }}
        onClick={() => {
          scheduleCenter();
          reportCursor();
        }}
        spellCheck
      />
    </div>
  );
};
