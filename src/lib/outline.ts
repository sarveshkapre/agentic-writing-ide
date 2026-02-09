export type OutlineItem = {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  line: number; // 0-based
  start: number; // character index into markdown at start of heading line
};

const isFenceToggle = (trimmed: string): boolean =>
  trimmed.startsWith("```") || trimmed.startsWith("~~~");

const cleanHeadingText = (raw: string): string =>
  raw.replace(/\s+#+\s*$/, "").trim();

export const extractOutline = (markdown: string): OutlineItem[] => {
  const items: OutlineItem[] = [];
  const lines = markdown.split("\n");
  let offset = 0;
  let inFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (isFenceToggle(trimmed)) {
      inFence = !inFence;
    }

    if (!inFence) {
      const match = /^(#{1,6})\s+(.*)$/.exec(line);
      if (match) {
        const level = match[1].length as OutlineItem["level"];
        const text = cleanHeadingText(match[2] ?? "");
        if (text) {
          items.push({
            level,
            text,
            line: i,
            start: offset
          });
        }
      }
    }

    // +1 for '\n' (except for last line where it doesn't exist in original)
    offset += line.length + 1;
  }

  return items;
};

export const findActiveOutlineItem = (
  items: OutlineItem[],
  cursorIndex: number
): OutlineItem | null => {
  if (items.length === 0) return null;
  const clamped = Math.max(0, cursorIndex);
  let active: OutlineItem | null = null;
  for (const item of items) {
    if (item.start <= clamped) active = item;
    else break;
  }
  return active;
};

