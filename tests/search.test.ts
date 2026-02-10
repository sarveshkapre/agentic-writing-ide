import { describe, expect, test } from "vitest";
import { buildSnippet, searchText } from "../src/lib/search";

describe("searchText", () => {
  test("finds case-insensitive non-overlapping matches", () => {
    expect(searchText("Hello hello HELLO", "hello")).toEqual({
      count: 3,
      firstIndex: 0
    });
  });

  test("returns empty for blank query", () => {
    expect(searchText("abc", "   ")).toEqual({ count: 0, firstIndex: -1 });
  });
});

describe("buildSnippet", () => {
  test("builds a clipped snippet around the match", () => {
    const text = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const snippet = buildSnippet(text, 10, 3);
    expect(snippet.match).toBe(text.slice(10, 13));
    expect(snippet.prefix.length).toBeGreaterThan(0);
    expect(snippet.suffix.length).toBeGreaterThan(0);
  });
});

