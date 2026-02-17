import { countLineChanges, summarizeMerge } from "../src/lib/mergeMetrics";

describe("mergeMetrics", () => {
  it("counts changed lines by position", () => {
    const before = ["alpha", "beta", "gamma"].join("\n");
    const after = ["alpha", "beta2", "gamma", "delta"].join("\n");
    expect(countLineChanges(before, after)).toBe(2);
  });

  it("summarizes merge sizes and deltas", () => {
    const target = ["one", "two", "three"].join("\n");
    const source = ["one", "TWO", "three", "four"].join("\n");
    const merged = ["one", "TWO", "three", "four"].join("\n");

    expect(
      summarizeMerge({
        target,
        source,
        merged,
        conflicts: 1
      })
    ).toEqual({
      targetLines: 3,
      sourceLines: 4,
      mergedLines: 4,
      changedFromTarget: 2,
      changedFromSource: 0,
      conflicts: 1
    });
  });
});
