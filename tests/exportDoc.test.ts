import { describe, expect, it } from "vitest";
import { wrapHtml } from "../src/lib/exportDoc";

describe("wrapHtml", () => {
  it("escapes the title and applies the requested export theme", () => {
    const html = wrapHtml('<b title="x">Hello</b>', "<p>Body</p>", "night");

    expect(html).toContain("<title>&lt;b title=&quot;x&quot;&gt;Hello&lt;/b&gt;</title>");
    expect(html).toContain("color-scheme: dark");
    expect(html).toContain("--paper: #141719");
  });
});

