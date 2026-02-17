import {
  findMatches,
  findNextMatch,
  findPreviousMatch,
  replaceAllMatches,
  replaceSingleMatch
} from "../src/lib/findReplace";

const defaults = {
  matchCase: false,
  wholeWord: false
};

describe("findReplace", () => {
  it("finds all case-insensitive matches", () => {
    const matches = findMatches("Alpha beta ALPHA", "alpha", defaults);
    expect(matches).toEqual([
      { index: 0, length: 5 },
      { index: 11, length: 5 }
    ]);
  });

  it("supports whole-word search", () => {
    const matches = findMatches("test testing test", "test", {
      matchCase: false,
      wholeWord: true
    });
    expect(matches).toEqual([
      { index: 0, length: 4 },
      { index: 13, length: 4 }
    ]);
  });

  it("finds next and previous matches with wrapping", () => {
    const text = "one two one";
    expect(findNextMatch(text, "one", defaults, 4)).toEqual({
      index: 8,
      length: 3
    });
    expect(findNextMatch(text, "one", defaults, 9)).toEqual({
      index: 0,
      length: 3
    });

    expect(findPreviousMatch(text, "one", defaults, 8)).toEqual({
      index: 0,
      length: 3
    });
    expect(findPreviousMatch(text, "one", defaults, 0)).toEqual({
      index: 8,
      length: 3
    });
  });

  it("replaces one and all matches", () => {
    const single = replaceSingleMatch("foo bar foo", { index: 8, length: 3 }, "baz");
    expect(single).toEqual({
      text: "foo bar baz",
      nextCursor: 11
    });

    const all = replaceAllMatches("foo bar foo", "foo", "baz", defaults);
    expect(all).toEqual({
      text: "baz bar baz",
      replaced: 2
    });
  });
});
