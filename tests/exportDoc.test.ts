import { describe, expect, it } from "vitest";
import { wrapHtml, wrapMarkdown } from "../src/lib/exportDoc";

describe("wrapHtml", () => {
  it("escapes the title and applies the requested export theme", () => {
    const html = wrapHtml('<b title="x">Hello</b>', "<p>Body</p>", "night");

    expect(html).toContain("<title>&lt;b title=&quot;x&quot;&gt;Hello&lt;/b&gt;</title>");
    expect(html).toContain("color-scheme: dark");
    expect(html).toContain("--paper: #141719");
  });
});

describe("wrapMarkdown", () => {
  it("returns plain markdown when no frontmatter is provided", () => {
    expect(wrapMarkdown("# Draft\n\nBody")).toBe("# Draft\n\nBody");
  });

  it("prepends frontmatter when metadata is provided", () => {
    const markdown = wrapMarkdown("# Draft\n", {
      frontmatter: {
        title: 'My "Draft"',
        label: "ready\nto-share",
        createdAt: "2026-02-11T01:02:03.000Z"
      }
    });

    expect(markdown).toContain('title: "My \\"Draft\\""');
    expect(markdown).toContain('label: "ready\\nto-share"');
    expect(markdown).toContain('createdAt: "2026-02-11T01:02:03.000Z"');
    expect(markdown).toContain("---\n");
    expect(markdown.endsWith("# Draft\n")).toBe(true);
  });
});
