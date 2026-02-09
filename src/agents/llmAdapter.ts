import type { LlmSettings, StageId } from "../state/types";

type LlmRequest = {
  stage: StageId;
  input: string;
  settings: LlmSettings;
  briefSummary?: string;
};

type LlmResult = {
  output: string;
  rationale: string;
};

export type LlmHealth = {
  ok: boolean;
  message: string;
  models?: string[];
};

const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number,
  label: string
): Promise<Response> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`${label} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

const normalizeBaseUrl = (baseUrl: string): string => baseUrl.replace(/\/+$/, "");

const safeJsonFromText = (raw: string): unknown => {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const slice = trimmed.slice(start, end + 1);
      return JSON.parse(slice);
    }
    throw new Error("Provider response was not valid JSON.");
  }
};

const stageInstruction = (stage: StageId): string => {
  switch (stage) {
    case "draft":
      return "Expand the idea into a coherent first draft with structure and headings.";
    case "critique":
      return "Give a critique as actionable bullet points; do not rewrite the draft.";
    case "revise":
      return "Revise the draft to address the critique, improving structure and clarity.";
    case "polish":
      return "Polish for style, grammar, and scannability while preserving meaning.";
  }
};

const buildJsonPrompt = ({
  stage,
  input,
  briefSummary
}: {
  stage: StageId;
  input: string;
  briefSummary?: string;
}): string => {
  const brief = briefSummary ? `\nBrief (optional): ${briefSummary}\n` : "";
  const instruction = stageInstruction(stage);
  const critiqueRule =
    stage === "critique"
      ? 'For "critique", return output exactly equal to the input.'
      : "For other stages, output should be the revised markdown.";

  return [
    "You are an assistant embedded in a local-first writing IDE.",
    "Return ONLY valid JSON (no code fences, no markdown, no commentary).",
    'Schema: {"output": string, "rationale": string}',
    `Stage: ${stage}`,
    `Instruction: ${instruction}`,
    critiqueRule,
    brief,
    "Input markdown:",
    input
  ]
    .filter(Boolean)
    .join("\n");
};

export const fetchProviderModels = async (
  settings: LlmSettings
): Promise<string[]> => {
  if (settings.provider !== "ollama") return [];
  const baseUrl = normalizeBaseUrl(settings.baseUrl || "http://localhost:11434");
  const res = await fetchWithTimeout(
    `${baseUrl}/api/tags`,
    undefined,
    5000,
    "Ollama /api/tags"
  );
  if (!res.ok) throw new Error(`Ollama /api/tags failed: HTTP ${res.status}`);
  const data = (await res.json()) as { models?: Array<{ name?: string }> };
  const names = (data.models ?? [])
    .map((model) => (typeof model?.name === "string" ? model.name : ""))
    .filter(Boolean);
  return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
};

export const testLlmProvider = async (
  settings: LlmSettings
): Promise<LlmHealth> => {
  if (settings.provider === "stub") {
    return {
      ok: true,
      message: "Stub provider ready (no network calls)."
    };
  }

  if (settings.provider === "ollama") {
    const baseUrl = normalizeBaseUrl(settings.baseUrl || "http://localhost:11434");
    const res = await fetchWithTimeout(
      `${baseUrl}/api/tags`,
      undefined,
      5000,
      "Ollama /api/tags"
    );
    if (!res.ok) {
      return {
        ok: false,
        message: `Ollama unreachable: HTTP ${res.status}`
      };
    }
    const models = await fetchProviderModels(settings);
    return {
      ok: true,
      message: models.length
        ? `Ollama reachable. Found ${models.length} models.`
        : "Ollama reachable. No models found (pull one first).",
      models
    };
  }

  return { ok: false, message: "Unknown provider." };
};

export const runLlmStage = async ({
  stage,
  input,
  settings,
  briefSummary
}: LlmRequest): Promise<LlmResult> => {
  if (settings.provider === "stub") {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const briefLine = briefSummary ? `\n> Brief: ${briefSummary}` : "";
    const output = `${input}\n\n> LLM stub (${settings.model}): Applied ${stage} guidance in a real integration.${briefLine}`;
    return {
      output,
      rationale: briefSummary
        ? `LLM stub response for ${stage} with brief context.`
        : `LLM stub response for ${stage}. Replace with real provider integration later.`
    };
  }

  if (settings.provider === "ollama") {
    const baseUrl = normalizeBaseUrl(settings.baseUrl || "http://localhost:11434");
    if (!settings.model.trim()) {
      throw new Error("Select an Ollama model (for example: llama3.1:latest).");
    }

    const prompt = buildJsonPrompt({ stage, input, briefSummary });
    const res = await fetchWithTimeout(
      `${baseUrl}/api/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: settings.model,
          prompt,
          stream: false
        })
      },
      60000,
      "Ollama generate"
    );

    if (!res.ok) {
      throw new Error(`Ollama generate failed: HTTP ${res.status}`);
    }

    const data = (await res.json()) as { response?: string };
    const raw = typeof data.response === "string" ? data.response : "";
    const parsed = safeJsonFromText(raw);

    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "output" in parsed &&
      "rationale" in parsed
    ) {
      const out = (parsed as { output: unknown }).output;
      const rat = (parsed as { rationale: unknown }).rationale;
      const output = typeof out === "string" ? out : input;
      const rationale = typeof rat === "string" ? rat : "Generated by Ollama.";
      return { output, rationale };
    }

    // Fallback: treat the entire provider response as rationale.
    return {
      output: stage === "critique" ? input : raw || input,
      rationale: raw ? raw : "Generated by Ollama."
    };
  }

  throw new Error(`Unsupported provider: ${settings.provider}`);
};
