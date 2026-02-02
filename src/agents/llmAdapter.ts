import type { StageId } from "../state/types";

type LlmRequest = {
  stage: StageId;
  input: string;
  model: string;
  briefSummary?: string;
};

type LlmResult = {
  output: string;
  rationale: string;
};

export const runLlmStage = async ({
  stage,
  input,
  model,
  briefSummary
}: LlmRequest): Promise<LlmResult> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const briefLine = briefSummary ? `\n> Brief: ${briefSummary}` : "";
  const output = `${input}\n\n> LLM stub (${model}): Applied ${stage} guidance in a real integration.${briefLine}`;
  return {
    output,
    rationale: briefSummary
      ? `LLM stub response for ${stage} with brief context.`
      : `LLM stub response for ${stage}. Replace with real provider integration later.`
  };
};
