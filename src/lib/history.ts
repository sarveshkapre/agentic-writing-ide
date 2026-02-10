import type { Revision } from "../state/types";

export const buildHistory = (
  revisions: Record<string, Revision>,
  headId: string
): Revision[] => {
  const ordered: Revision[] = [];
  let current: Revision | undefined = revisions[headId];
  while (current) {
    ordered.push(current);
    current = current.parentId ? revisions[current.parentId] : undefined;
  }
  return ordered;
};

