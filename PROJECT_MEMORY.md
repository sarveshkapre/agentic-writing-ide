# Project Memory

## Entry 2026-02-09 — Three-way merge preview before commit
- Decision: Replace branch merge "copy source head" behavior with a three-way merge preview that reports conflicts and allows explicit resolution (`manual`, `prefer-target`, `prefer-source`) before writing a revision.
- Why: Silent overwrite merges were a production risk for writing workflows because users could lose edits without visibility.
- Evidence:
  - `src/lib/merge.ts`
  - `src/App.tsx`
  - `src/styles.css`
  - `tests/merge.test.ts`
  - `tests/app.smoke.test.tsx`
  - `npm run check` (pass)
- Commit: `b00ae75c59a463ac1584b12c78031c60393e8429`
- Confidence: high
- Trust label: verified-local
- Follow-up:
  - Add richer chunk-level diff3 alignment to reduce false-positive conflicts on heavily edited documents.

## Entry 2026-02-09 — Branch and import UX safety
- Decision: Add branch-name validation (empty/duplicate rejection) and make import idempotent by clearing file input after each attempt.
- Why: Duplicate branches and non-repeatable file chooser behavior degraded reliability and discoverability for iterative workflows.
- Evidence:
  - `src/App.tsx`
  - `tests/app.smoke.test.tsx`
  - `npm run check` (pass)
- Commit: `b00ae75c59a463ac1584b12c78031c60393e8429`
- Confidence: high
- Trust label: verified-local
- Follow-up:
  - Add richer toast categorization and a "View details" affordance for longer errors.

## Entry 2026-02-09 — CI workflow lint in main gate
- Decision: Execute `npm run lint:workflows` in the `ci` build job before the full quality gate.
- Why: This catches YAML/expression regressions early and prevents "workflow failed to parse" incidents from reaching main unnoticed.
- Evidence:
  - `.github/workflows/ci.yml`
  - `scripts/lint-workflows.sh`
  - `npm run lint:workflows` (pass)
- Commit: `b00ae75c59a463ac1584b12c78031c60393e8429`
- Confidence: high
- Trust label: verified-local
- Follow-up:
  - Consider a dedicated `workflow-lint` job for faster failure isolation.

## Entry 2026-02-09 — Optional local Ollama LLM provider
- Decision: Add an optional local LLM provider adapter (Ollama) with connection testing and model refresh, keeping the pipeline offline by default and falling back to deterministic stages on provider errors.
- Why: "Real provider" value without accounts/telemetry/servers; aligns with local-first PMF and avoids browser CORS/key leakage problems of direct cloud calls.
- Evidence:
  - `src/agents/llmAdapter.ts`
  - `src/ui/SettingsPanel.tsx`
  - `tests/llmAdapter.test.ts`
  - `npm run check` (pass)
- Commit: `6177e80f7c6b2257a7f9bde6c2c0ec320a5c0a90`
- Confidence: medium-high
- Trust label: verified-local
- Follow-up:
  - Consider an OpenAI-compatible local endpoint adapter (LM Studio) behind the same settings.

## Entry 2026-02-09 — Non-blocking toast notifications
- Decision: Add an in-app toast stack (aria-live) and route key action outcomes (import/export/merge/branch/LLM errors) through it instead of the auto-save status line.
- Why: Auto-save status was overwriting important action feedback; toasts make outcomes visible without blocking the writing flow.
- Evidence:
  - `src/ui/ToastStack.tsx`
  - `src/App.tsx`
  - `src/styles.css`
  - `npm run check` (pass)
- Commit: `f8627c3f7339c3df4cb81b2ee0c298e63bdff5ab`
- Confidence: high
- Trust label: verified-local

## Verification Evidence (2026-02-09)
- `npm run check` (pass)
- `npm run dev -- --host 127.0.0.1 --port 4173` (pass; server started)
- `curl -sf http://127.0.0.1:4173/ | head` (pass; returned HTML)
