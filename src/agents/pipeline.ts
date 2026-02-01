import type { StageId } from "../state/types";

const normalizeWhitespace = (text: string) =>
  text.replace(/\s+$/gm, "").replace(/\n{3,}/g, "\n\n");

const ensureTitle = (text: string) => {
  if (/^#\s+/.test(text.trim())) return text;
  return `# Untitled Draft\n\n${text.trim() || "Start with a clear thesis..."}`;
};

const tightenPhrases = (text: string) =>
  text
    .replace(/\bvery\b/gi, "")
    .replace(/\bactually\b/gi, "")
    .replace(/\breally\b/gi, "")
    .replace(/\s{2,}/g, " ");

const addSectionHeaders = (text: string) => {
  if (/^##\s+/m.test(text)) return text;
  return `${text}\n\n## Key Takeaways\n- \n- \n- `;
};

export type StageConfig = {
  id: StageId;
  label: string;
  description: string;
  run: (input: string) => { output: string; rationale: string };
};

export const stages: StageConfig[] = [
  {
    id: "draft",
    label: "Draft",
    description: "Structure the raw idea into a starter draft.",
    run: (input) => {
      const output = normalizeWhitespace(ensureTitle(input));
      return {
        output,
        rationale: "Ensure a working title, remove extra whitespace, and keep momentum."
      };
    }
  },
  {
    id: "critique",
    label: "Critique",
    description: "Surface gaps, missing evidence, and unclear transitions.",
    run: (input) => {
      const output = normalizeWhitespace(input);
      return {
        output,
        rationale:
          "Flag clarity gaps, missing proof, and places that need stronger structure."
      };
    }
  },
  {
    id: "revise",
    label: "Revise",
    description: "Tighten language and strengthen the narrative arc.",
    run: (input) => {
      const output = normalizeWhitespace(tightenPhrases(input));
      return {
        output,
        rationale: "Remove filler words and tighten phrasing for flow."
      };
    }
  },
  {
    id: "polish",
    label: "Polish",
    description: "Add scannability and a crisp closing.",
    run: (input) => {
      const withSections = addSectionHeaders(input);
      const output = normalizeWhitespace(withSections);
      return {
        output,
        rationale: "Add scannable sections and ensure clean spacing."
      };
    }
  }
];

export const getStage = (id: StageId): StageConfig => {
  const stage = stages.find((item) => item.id === id);
  if (!stage) throw new Error(`Unknown stage: ${id}`);
  return stage;
};
