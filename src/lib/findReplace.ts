export type FindReplaceOptions = {
  matchCase: boolean;
  wholeWord: boolean;
};

export type TextMatch = {
  index: number;
  length: number;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildPattern = (query: string, options: FindReplaceOptions): RegExp | null => {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const source = escapeRegExp(trimmed);
  const wrapped = options.wholeWord ? `\\b${source}\\b` : source;
  const flags = options.matchCase ? "g" : "gi";
  return new RegExp(wrapped, flags);
};

export const findMatches = (
  text: string,
  query: string,
  options: FindReplaceOptions
): TextMatch[] => {
  const pattern = buildPattern(query, options);
  if (!pattern) return [];

  const matches: TextMatch[] = [];
  let match: RegExpExecArray | null = pattern.exec(text);

  while (match) {
    matches.push({
      index: match.index,
      length: match[0].length
    });
    if (match[0].length === 0) {
      pattern.lastIndex += 1;
    }
    match = pattern.exec(text);
  }

  return matches;
};

export const replaceAllMatches = (
  text: string,
  query: string,
  replacement: string,
  options: FindReplaceOptions
): { text: string; replaced: number } => {
  const pattern = buildPattern(query, options);
  if (!pattern) return { text, replaced: 0 };

  const matches = findMatches(text, query, options);
  if (matches.length === 0) return { text, replaced: 0 };

  return {
    text: text.replace(pattern, replacement),
    replaced: matches.length
  };
};

export const findNextMatch = (
  text: string,
  query: string,
  options: FindReplaceOptions,
  fromIndex: number
): TextMatch | null => {
  const matches = findMatches(text, query, options);
  if (matches.length === 0) return null;

  const normalizedFrom = Math.max(0, Math.min(fromIndex, text.length));
  const next = matches.find((match) => match.index >= normalizedFrom);
  return next ?? matches[0];
};

export const findPreviousMatch = (
  text: string,
  query: string,
  options: FindReplaceOptions,
  fromIndex: number
): TextMatch | null => {
  const matches = findMatches(text, query, options);
  if (matches.length === 0) return null;

  const normalizedFrom = Math.max(0, Math.min(fromIndex, text.length));
  const reversed = [...matches].reverse();
  const prev = reversed.find((match) => match.index < normalizedFrom);
  return prev ?? matches[matches.length - 1];
};

export const replaceSingleMatch = (
  text: string,
  match: TextMatch,
  replacement: string
): { text: string; nextCursor: number } => {
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + match.length);
  const updated = `${before}${replacement}${after}`;
  return {
    text: updated,
    nextCursor: match.index + replacement.length
  };
};
