export type SearchMatch = {
  count: number;
  firstIndex: number;
};

export const searchText = (text: string, query: string): SearchMatch => {
  const q = query.trim();
  if (!q) return { count: 0, firstIndex: -1 };

  const haystack = text.toLowerCase();
  const needle = q.toLowerCase();

  let count = 0;
  let firstIndex = -1;
  let start = 0;

  while (start <= haystack.length) {
    const idx = haystack.indexOf(needle, start);
    if (idx === -1) break;
    if (firstIndex === -1) firstIndex = idx;
    count += 1;
    start = idx + needle.length;
  }

  return { count, firstIndex };
};

const sanitizeSnippetPart = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

export type Snippet = {
  prefix: string;
  match: string;
  suffix: string;
  clippedStart: boolean;
  clippedEnd: boolean;
};

export const buildSnippet = (text: string, index: number, length: number): Snippet => {
  const safeIndex = Math.max(0, Math.min(index, text.length));
  const safeLen = Math.max(0, Math.min(length, text.length - safeIndex));
  const context = 52;

  const start = Math.max(0, safeIndex - context);
  const end = Math.min(text.length, safeIndex + safeLen + context);

  const clippedStart = start > 0;
  const clippedEnd = end < text.length;

  const segment = text.slice(start, end);
  const localIndex = safeIndex - start;

  const prefixRaw = segment.slice(0, localIndex);
  const matchRaw = segment.slice(localIndex, localIndex + safeLen);
  const suffixRaw = segment.slice(localIndex + safeLen);

  return {
    prefix: sanitizeSnippetPart(prefixRaw),
    match: sanitizeSnippetPart(matchRaw),
    suffix: sanitizeSnippetPart(suffixRaw),
    clippedStart,
    clippedEnd
  };
};

