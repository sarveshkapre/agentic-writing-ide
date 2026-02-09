import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchProviderModels, runLlmStage, testLlmProvider } from "../src/agents/llmAdapter";
import type { LlmSettings } from "../src/state/types";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("llmAdapter", () => {
  it("reports stub provider as ready", async () => {
    const settings: LlmSettings = {
      enabled: true,
      provider: "stub",
      model: "local-stub",
      baseUrl: "http://localhost:11434",
      apiKey: ""
    };

    const health = await testLlmProvider(settings);
    expect(health.ok).toBe(true);
    expect(health.message.toLowerCase()).toContain("stub");
  });

  it("fetchProviderModels returns empty list for non-ollama providers", async () => {
    const settings: LlmSettings = {
      enabled: true,
      provider: "stub",
      model: "local-stub",
      baseUrl: "http://localhost:11434",
      apiKey: ""
    };

    const models = await fetchProviderModels(settings);
    expect(models).toEqual([]);
  });

  it("runs stub stage deterministically", async () => {
    const settings: LlmSettings = {
      enabled: true,
      provider: "stub",
      model: "local-stub",
      baseUrl: "http://localhost:11434",
      apiKey: ""
    };

    const result = await runLlmStage({
      stage: "draft",
      input: "Hello",
      settings
    });
    expect(result.output).toContain("Hello");
    expect(result.rationale.toLowerCase()).toContain("stub");
  });

  it("parses ollama JSON response for output + rationale", async () => {
    const settings: LlmSettings = {
      enabled: true,
      provider: "ollama",
      model: "llama3.1:latest",
      baseUrl: "http://localhost:11434",
      apiKey: ""
    };

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: RequestInfo | URL) => {
        const href = url.toString();
        if (href.endsWith("/api/tags")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({ models: [{ name: "llama3.1:latest" }] })
          } as Response;
        }
        if (href.endsWith("/api/generate")) {
          return {
            ok: true,
            status: 200,
            json: async () => ({
              response: JSON.stringify({
                output: "# Revised\n\nText",
                rationale: "Did the thing."
              })
            })
          } as Response;
        }
        throw new Error(`Unexpected fetch: ${href}`);
      })
    );

    const result = await runLlmStage({
      stage: "revise",
      input: "# Draft\n\nText",
      settings,
      briefSummary: "Keep it short."
    });

    expect(result.output).toContain("# Revised");
    expect(result.rationale).toContain("Did the thing.");
  });

  it("requires an explicit model for ollama", async () => {
    const settings: LlmSettings = {
      enabled: true,
      provider: "ollama",
      model: "",
      baseUrl: "http://localhost:11434",
      apiKey: ""
    };

    await expect(
      runLlmStage({
        stage: "draft",
        input: "Hello",
        settings
      })
    ).rejects.toThrow(/model/i);
  });
});

