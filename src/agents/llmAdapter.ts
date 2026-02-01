import type { StageId } from "../state/types";

type LlmRequest = {
  stage: StageId;
  input: string;
  model: string;
};

type LlmResult = {
  output: string;
  rationale: string;
};

export const runLlmStage = async ({ stage, input, model }: LlmRequest): Promise<LlmResult> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const output = `${input}\n\n> LLM stub (${model}): Applied ${stage} guidance in a real integration.`;
  return {
    output,
    rationale: `LLM stub response for ${stage}. Replace with real provider integration later.`
  };
};
