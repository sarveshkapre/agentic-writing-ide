# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P0: Commit root `AGENTS.md` autonomous contract + prevent drift with `docs/AGENTS.md` pointer.
- [ ] P1: Add optional local LLM provider adapter (Ollama first) with explicit offline fallback + connection health checks.
- [ ] P1: Add non-blocking toast notifications (with an a11y live region) for branch/import/export/merge/LLM outcomes.
- [ ] P2: Add E2E smoke coverage (Playwright) for import/export + stash navigation happy path.
- [ ] P2: Improve three-way merge alignment to reduce false-positive conflicts for line insertions/moves.
- [ ] P2: Add keyboard shortcut cheat sheet modal (Cmd/Ctrl + /) and surface `Shift+O` outline shortcut.
- [ ] P2: Add export templates/themes for HTML/PDF (simple preset library).
- [ ] P3: Add optional OpenAI-compatible local server adapter (LM Studio) for users who prefer that API shape.
- [ ] P3: Multi-document library (create/switch/rename/delete) with local persistence.

## Implemented
- [x] 2026-02-09: Added three-way merge preview with explicit conflict resolution before merge commit.
  Evidence: `src/lib/merge.ts`, `src/App.tsx`, `src/styles.css`.
- [x] 2026-02-09: Added merge regression coverage for utility behavior, clean merge flow, and conflict resolution flow.
  Evidence: `tests/merge.test.ts`, `tests/app.smoke.test.tsx`, `npm run check`.
- [x] 2026-02-09: Guarded branch creation against empty/duplicate names with inline UX feedback.
  Evidence: `src/App.tsx`, `tests/app.smoke.test.tsx`.
- [x] 2026-02-09: Improved import UX to clear file inputs and show imported document title in status.
  Evidence: `src/App.tsx`.
- [x] 2026-02-09: Added workflow lint to CI build gate before full check.
  Evidence: `.github/workflows/ci.yml`, `npm run lint:workflows`.
- [x] 2026-02-09: Created `PROJECT_MEMORY.md` with structured decision/evidence/trust entries.
  Evidence: `PROJECT_MEMORY.md`.
- [x] 2026-02-09: Created `INCIDENTS.md` with CI incident RCA and prevention rules.
  Evidence: `INCIDENTS.md`.
- [x] 2026-02-08: Fixed CI workflow parse failure (`.github/workflows/ci.yml`) by quoting `pull_request` in expression.
  Evidence: `.github/workflows/ci.yml`, `npm run lint:workflows`.
- [x] 2026-02-08: Fixed gitleaks Git range failures on push by fetching full git history in CI checkout.
  Evidence: `.github/workflows/ci.yml`, GitHub Actions run `21807361590` failure log, follow-up run after patch.
- [x] 2026-02-08: Upgraded CodeQL workflow actions from `@v3` to `@v4` to clear deprecation warning risk.
  Evidence: `.github/workflows/codeql.yml`, CodeQL annotation from run `21807377285`.
- [x] 2026-02-08: Added local workflow lint command with installer-backed `actionlint`.
  Evidence: `scripts/lint-workflows.sh`, `package.json`, `README.md`, `docs/PROJECT.md`.
- [x] 2026-02-08: Added revision-scoped draft stash and restore on revision/branch navigation.
  Evidence: `src/state/types.ts`, `src/state/store.tsx`, `src/App.tsx`.
- [x] 2026-02-08: Added `Stash & continue` to uncommitted-change navigation dialog.
  Evidence: `src/App.tsx`.
- [x] 2026-02-08: Hardened import flow with parse/shape validation and compatibility fallback for file reads.
  Evidence: `src/state/persistence.ts`, `src/App.tsx`.
- [x] 2026-02-08: Added regression tests for stash + invalid import behavior.
  Evidence: `tests/app.smoke.test.tsx`, `npm run check`.
- [x] 2026-02-08: Synced planning and release-memory docs with current shipped state.
  Evidence: `PLAN.md`, `docs/PLAN.md`, `CHANGELOG.md`, `UPDATE.md`.

## Insights
- Historical CI failures (`#21579381622`, `#21579004301`, `#21553547452`) were parse-time workflow failures with zero jobs; `actionlint` reproduced and pinpointed the invalid expression.
- Gitleaks GitHub Action expects commit range history on push events; shallow clone breaks scans with `ambiguous argument A^..B`.
- CodeQL emitted a migration warning for `v3`; proactive upgrades prevent CI breakage before December 2026.
- Revision-level stash can be implemented without new persistence storage keys by extending existing state and reducer transitions (`UPDATE_CONTENT`, `SELECT_REVISION`, `SWITCH_BRANCH`, `ADD_REVISION`).
- Import UX reliability needs explicit status messaging because silent parse failures look like no-op saves to users.
- Three-way merge preview reduces destructive merge risk, but line-index matching can still over-report conflicts when long inserts shift line positions.
- Running workflow lint in CI prevents "failed to parse workflow" regressions from reaching merge gates.
- Market scan (untrusted): Local LLM runtimes are an easy "real provider" step that stays local-first:
  - Ollama exposes a simple HTTP API (`/api/tags`, `/api/generate`): https://github.com/ollama/ollama/blob/main/docs/api.md
  - LM Studio runs a local OpenAI-compatible server (`/v1/models`, `/v1/chat/completions`): https://lmstudio.ai/docs/api/openai-api

## Notes
- This file is maintained by the autonomous clone loop.

### Auto-discovered Open Checklist Items (2026-02-09)
- None
