import { describe, expect, test } from "vitest";
import { extractOutline, findActiveOutlineItem } from "../src/lib/outline";

describe("outline", () => {
  test("extractOutline parses headings and strips trailing hashes", () => {
    const md = `# Title

Paragraph
## Section ##
Text
#### Deep Heading
`;
    const items = extractOutline(md);
    expect(items.map((item) => [item.level, item.text])).toEqual([
      [1, "Title"],
      [2, "Section"],
      [4, "Deep Heading"]
    ]);
    expect(items[1]?.start).toBe(md.indexOf("## Section"));
    expect(items[1]?.line).toBe(3);
  });

  test("extractOutline ignores headings inside fenced code blocks", () => {
    const md = `# Title
\`\`\`ts
## Not a heading
\`\`\`
## Real
`;
    const items = extractOutline(md);
    expect(items.map((item) => item.text)).toEqual(["Title", "Real"]);
  });

  test("findActiveOutlineItem returns the last heading at or before the cursor", () => {
    const md = `# A
Text
## B
More
### C
End
`;
    const items = extractOutline(md);
    const cursor = md.indexOf("### C") + 2;
    expect(findActiveOutlineItem(items, cursor)?.text).toBe("C");
    expect(findActiveOutlineItem(items, 0)?.text).toBe("A");
  });
});

