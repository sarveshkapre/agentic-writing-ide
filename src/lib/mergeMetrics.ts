const splitLines = (text: string): string[] => text.replace(/\r\n/g, "\n").split("\n");

export const countLineChanges = (before: string, after: string): number => {
  const beforeLines = splitLines(before);
  const afterLines = splitLines(after);
  const max = Math.max(beforeLines.length, afterLines.length);

  let changed = 0;
  for (let index = 0; index < max; index += 1) {
    if ((beforeLines[index] ?? "") !== (afterLines[index] ?? "")) {
      changed += 1;
    }
  }
  return changed;
};

export type MergeSummary = {
  targetLines: number;
  sourceLines: number;
  mergedLines: number;
  changedFromTarget: number;
  changedFromSource: number;
  conflicts: number;
};

export const summarizeMerge = (params: {
  target: string;
  source: string;
  merged: string;
  conflicts: number;
}): MergeSummary => {
  const targetLines = splitLines(params.target).length;
  const sourceLines = splitLines(params.source).length;
  const mergedLines = splitLines(params.merged).length;
  const changedFromTarget = countLineChanges(params.target, params.merged);
  const changedFromSource = countLineChanges(params.source, params.merged);

  return {
    targetLines,
    sourceLines,
    mergedLines,
    changedFromTarget,
    changedFromSource,
    conflicts: params.conflicts
  };
};
