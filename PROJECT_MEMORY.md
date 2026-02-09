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
- Commit: pending (session 2026-02-09 cycle 2)
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
- Commit: pending (session 2026-02-09 cycle 2)
- Confidence: high
- Trust label: verified-local
- Follow-up:
  - Add lightweight toast notifications for branch/create/import validation outcomes.

## Entry 2026-02-09 — CI workflow lint in main gate
- Decision: Execute `npm run lint:workflows` in the `ci` build job before the full quality gate.
- Why: This catches YAML/expression regressions early and prevents "workflow failed to parse" incidents from reaching main unnoticed.
- Evidence:
  - `.github/workflows/ci.yml`
  - `scripts/lint-workflows.sh`
  - `npm run lint:workflows` (pass)
- Commit: pending (session 2026-02-09 cycle 2)
- Confidence: high
- Trust label: verified-local
- Follow-up:
  - Consider a dedicated `workflow-lint` job for faster failure isolation.
