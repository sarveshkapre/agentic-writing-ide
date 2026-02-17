import { hashText } from "../src/lib/hash";

describe("hashText", () => {
  it("is stable for same input", () => {
    expect(hashText("alpha beta")).toBe(hashText("alpha beta"));
  });

  it("changes when content changes", () => {
    expect(hashText("alpha")).not.toBe(hashText("alpha "));
  });
});
