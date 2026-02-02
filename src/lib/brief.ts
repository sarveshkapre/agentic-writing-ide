import type { ProjectBrief } from "../state/types";

export const defaultBrief = (): ProjectBrief => ({
  audience: "Product and marketing teams",
  goal: "Explain the update, why it matters, and the next step.",
  tone: "Clear, confident, and concise",
  length: 700,
  keyPoints: ["Problem or opportunity", "What changed", "Expected impact"],
  constraints: "Keep it scannable with headings and bullets.",
  templateId: "product-update"
});

export const normalizeBrief = (brief?: Partial<ProjectBrief>): ProjectBrief => {
  const defaults = defaultBrief();
  return {
    audience: brief?.audience ?? defaults.audience,
    goal: brief?.goal ?? defaults.goal,
    tone: brief?.tone ?? defaults.tone,
    length: typeof brief?.length === "number" ? brief.length : defaults.length,
    keyPoints: Array.isArray(brief?.keyPoints) ? brief.keyPoints : defaults.keyPoints,
    constraints: brief?.constraints ?? defaults.constraints,
    templateId: brief?.templateId ?? defaults.templateId
  };
};

export const summarizeBrief = (brief: ProjectBrief): string => {
  const parts = [
    brief.audience ? `Audience: ${brief.audience}` : "",
    brief.goal ? `Goal: ${brief.goal}` : "",
    brief.tone ? `Tone: ${brief.tone}` : "",
    brief.length ? `Target: ${brief.length} words` : ""
  ].filter(Boolean);
  return parts.join(" · ");
};

const outlineSection = (title: string, bullets: string[]) => {
  const lines = [`## ${title}`];
  bullets.forEach((item) => lines.push(`- ${item}`));
  return lines.join("\n");
};

export const buildOutlineFromBrief = (
  title: string,
  brief: ProjectBrief,
  includeTitle: boolean
): string => {
  const lines: string[] = [];
  const docTitle = title?.trim() || "Untitled Draft";

  if (includeTitle) {
    lines.push(`# ${docTitle}`, "");
  }

  const summaryBullets = [
    brief.goal || "Summarize the main point in 2-3 sentences.",
    brief.audience ? `Keep it tailored for ${brief.audience}.` : ""
  ].filter(Boolean);

  lines.push(outlineSection("Executive Summary", summaryBullets), "");

  const keyPoints =
    brief.keyPoints.length > 0
      ? brief.keyPoints
      : ["Primary message", "Supporting evidence", "Call to action"];

  lines.push(outlineSection("Key Points", keyPoints), "");

  lines.push(
    outlineSection("Supporting Detail", [
      "Data, proof points, or examples",
      "Risks and mitigations",
      "Timeline or milestones"
    ]),
    ""
  );

  lines.push(
    outlineSection("Next Steps", [
      "Decision or action required",
      "Owner and deadline",
      "How success will be measured"
    ]),
    ""
  );

  if (brief.constraints) {
    lines.push(outlineSection("Constraints", [brief.constraints]));
  }

  return lines.join("\n");
};

export const applyOutlineToContent = (content: string, outline: string): string => {
  const trimmed = content.trim();
  if (
    trimmed.length === 0 ||
    trimmed === "Start writing here..." ||
    trimmed.startsWith("# Untitled Draft")
  ) {
    return outline;
  }

  return `${content}\n\n---\n\n${outline}`;
};
