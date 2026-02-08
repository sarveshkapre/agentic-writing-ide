# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P1: Add branch merge conflict resolution preview before merge commit (current merge is no-conflict copy).
- [ ] P1: Add optional real LLM provider adapter with explicit offline fallback and key health checks.
- [ ] P2: Add E2E smoke coverage (Playwright) for import/export + stash navigation happy path.

## Implemented
- [x] 2026-02-08: Fixed CI workflow parse failure (`.github/workflows/ci.yml`) by quoting `pull_request` in expression.
  Evidence: `.github/workflows/ci.yml`, `npm run lint:workflows`.
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
- Revision-level stash can be implemented without new persistence storage keys by extending existing state and reducer transitions (`UPDATE_CONTENT`, `SELECT_REVISION`, `SWITCH_BRANCH`, `ADD_REVISION`).
- Import UX reliability needs explicit status messaging because silent parse failures look like no-op saves to users.

## Notes
- This file is maintained by the autonomous clone loop.

### Auto-discovered Open Checklist Items (2026-02-08)
- None
