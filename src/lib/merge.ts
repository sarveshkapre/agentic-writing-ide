import type { Revision } from "../state/types";

export type MergeResolution = "manual" | "prefer-target" | "prefer-source";

export type MergeConflict = {
  line: number;
  base: string;
  target: string;
  source: string;
};

export type MergeInput = {
  base: string;
  target: string;
  source: string;
  targetLabel: string;
  sourceLabel: string;
  resolution?: MergeResolution;
};

export type MergeResult = {
  content: string;
  conflicts: MergeConflict[];
};

const normalizeLineEndings = (text: string): string => text.replace(/\r\n/g, "\n");

const splitLines = (text: string): string[] => normalizeLineEndings(text).split("\n");

const hasTerminalNewline = (text: string): boolean =>
  normalizeLineEndings(text).endsWith("\n");

const formatConflict = (
  conflict: MergeConflict,
  targetLabel: string,
  sourceLabel: string
): string[] => [
  `<<<<<<< ${targetLabel}`,
  conflict.target,
  "=======",
  conflict.source,
  `>>>>>>> ${sourceLabel}`
];

const joinLines = (lines: string[], withTerminalNewline: boolean): string => {
  const joined = lines.join("\n");
  if (withTerminalNewline && joined.length > 0) {
    return `${joined}\n`;
  }
  return joined;
};

export const mergeThreeWay = ({
  base,
  target,
  source,
  targetLabel,
  sourceLabel,
  resolution = "manual"
}: MergeInput): MergeResult => {
  const baseLines = splitLines(base);
  const targetLines = splitLines(target);
  const sourceLines = splitLines(source);

  const lineCount = Math.max(baseLines.length, targetLines.length, sourceLines.length);
  const mergedLines: string[] = [];
  const conflicts: MergeConflict[] = [];

  for (let index = 0; index < lineCount; index += 1) {
    const baseLine = baseLines[index] ?? "";
    const targetLine = targetLines[index] ?? "";
    const sourceLine = sourceLines[index] ?? "";

    const targetChanged = targetLine !== baseLine;
    const sourceChanged = sourceLine !== baseLine;

    if (!targetChanged && !sourceChanged) {
      mergedLines.push(baseLine);
      continue;
    }

    if (targetChanged && !sourceChanged) {
      mergedLines.push(targetLine);
      continue;
    }

    if (!targetChanged && sourceChanged) {
      mergedLines.push(sourceLine);
      continue;
    }

    if (targetLine === sourceLine) {
      mergedLines.push(targetLine);
      continue;
    }

    const conflict: MergeConflict = {
      line: index + 1,
      base: baseLine,
      target: targetLine,
      source: sourceLine
    };
    conflicts.push(conflict);

    if (resolution === "prefer-target") {
      mergedLines.push(targetLine);
      continue;
    }

    if (resolution === "prefer-source") {
      mergedLines.push(sourceLine);
      continue;
    }

    mergedLines.push(...formatConflict(conflict, targetLabel, sourceLabel));
  }

  const preserveTerminalNewline =
    hasTerminalNewline(target) || hasTerminalNewline(source) || hasTerminalNewline(base);

  return {
    content: joinLines(mergedLines, preserveTerminalNewline),
    conflicts
  };
};

export const findCommonAncestorRevisionId = (
  revisions: Record<string, Revision>,
  firstRevisionId: string,
  secondRevisionId: string
): string | null => {
  const seen = new Set<string>();
  let currentId: string | null = firstRevisionId;

  while (currentId) {
    seen.add(currentId);
    currentId = revisions[currentId]?.parentId ?? null;
  }

  currentId = secondRevisionId;
  while (currentId) {
    if (seen.has(currentId)) {
      return currentId;
    }
    currentId = revisions[currentId]?.parentId ?? null;
  }

  return null;
};
