import { findCommonAncestorRevisionId, mergeThreeWay } from "../src/lib/merge";
import type { Revision } from "../src/state/types";

describe("mergeThreeWay", () => {
  it("applies non-conflicting source changes", () => {
    const merged = mergeThreeWay({
      base: "alpha\nbeta",
      target: "alpha\nbeta",
      source: "alpha\nbeta\nsource-note",
      targetLabel: "main",
      sourceLabel: "feature"
    });

    expect(merged.conflicts).toHaveLength(0);
    expect(merged.content).toBe("alpha\nbeta\nsource-note");
  });

  it("emits deterministic conflict markers in manual mode", () => {
    const merged = mergeThreeWay({
      base: "alpha\nbeta",
      target: "alpha\nmain-change",
      source: "alpha\nfeature-change",
      targetLabel: "main",
      sourceLabel: "feature",
      resolution: "manual"
    });

    expect(merged.conflicts).toHaveLength(1);
    expect(merged.content).toContain("<<<<<<< main");
    expect(merged.content).toContain("main-change");
    expect(merged.content).toContain("=======");
    expect(merged.content).toContain("feature-change");
    expect(merged.content).toContain(">>>>>>> feature");
  });

  it("supports prefer-source resolution", () => {
    const merged = mergeThreeWay({
      base: "alpha\nbeta",
      target: "alpha\nmain-change",
      source: "alpha\nfeature-change",
      targetLabel: "main",
      sourceLabel: "feature",
      resolution: "prefer-source"
    });

    expect(merged.conflicts).toHaveLength(1);
    expect(merged.content).toBe("alpha\nfeature-change");
  });
});

describe("findCommonAncestorRevisionId", () => {
  it("returns the nearest shared ancestor in linear history", () => {
    const revisions: Record<string, Revision> = {
      root: {
        id: "root",
        parentId: null,
        createdAt: "2026-02-09T00:00:00.000Z",
        author: "user",
        content: "base",
        rationale: "root",
        stage: "draft"
      },
      a1: {
        id: "a1",
        parentId: "root",
        createdAt: "2026-02-09T00:01:00.000Z",
        author: "user",
        content: "a1",
        rationale: "a1",
        stage: "draft"
      },
      a2: {
        id: "a2",
        parentId: "a1",
        createdAt: "2026-02-09T00:02:00.000Z",
        author: "user",
        content: "a2",
        rationale: "a2",
        stage: "draft"
      },
      b1: {
        id: "b1",
        parentId: "root",
        createdAt: "2026-02-09T00:03:00.000Z",
        author: "user",
        content: "b1",
        rationale: "b1",
        stage: "draft"
      }
    };

    expect(findCommonAncestorRevisionId(revisions, "a2", "b1")).toBe("root");
    expect(findCommonAncestorRevisionId(revisions, "a2", "a1")).toBe("a1");
    expect(findCommonAncestorRevisionId(revisions, "a2", "unknown")).toBeNull();
  });
});
