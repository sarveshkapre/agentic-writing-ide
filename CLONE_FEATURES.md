# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P1: Outline navigator (headings list) with click-to-jump and optional "follow cursor" mode for long drafts.
- [ ] P1: Add E2E smoke coverage (Playwright) for import/export + stash navigation happy path.
- [ ] P2: Improve three-way merge alignment to reduce false-positive conflicts for line insertions/moves.
- [ ] P2: Document-wide search (working copy + revisions) with jump-to-result and diff context.
- [ ] P3: Local comments/annotations (non-destructive) tied to revision ranges/line numbers.
- [ ] P3: Add stable `data-testid` attributes for key flows (edit/commit/export/import/branch/merge) to support E2E and future automation.
- [ ] P3: Add Markdown export (`.md`) with frontmatter option (title/label/createdAt) for interoperability.
- [ ] P3: Add per-document preferences (default export theme, default target word count) with migration-safe persistence.
- [ ] P3: Performance: memoize expensive diff computations and add a long-document perf smoke test (~50k words).
- [ ] P0: Security: keep npm audit clear (dependency bumps + CI guardrails). Current moderate advisory would require Vite major upgrade; track and reassess.

## Session Scoring (2026-02-09, Cycle 1)
Selected (1-5 scale; higher is better except risk):
- Ollama local LLM provider: impact 5, effort 3, strategic fit 5, differentiation 4, risk 2, confidence 4.
- Toast notifications: impact 4, effort 2, strategic fit 5, differentiation 2, risk 1, confidence 5.
- Canonical `AGENTS.md` contract tracked: impact 3, effort 1, strategic fit 5, differentiation 1, risk 1, confidence 5.

Not selected this cycle:
- Playwright E2E smoke: impact 3, effort 4, strategic fit 4, differentiation 1, risk 2, confidence 3.
- Merge alignment improvements: impact 3, effort 4, strategic fit 4, differentiation 3, risk 3, confidence 2.

## Session Scoring (2026-02-09, Cycle 2)
Selected (1-5 scale; higher is better except risk):
- OpenAI-compatible local endpoint adapter (LM Studio): impact 5, effort 3, strategic fit 5, differentiation 3, risk 2, confidence 4.
- Shortcuts cheat sheet modal: impact 4, effort 2, strategic fit 5, differentiation 2, risk 1, confidence 5.

Not selected this cycle:
- Playwright E2E smoke: impact 4, effort 4, strategic fit 5, differentiation 1, risk 2, confidence 3.
- Merge alignment improvements: impact 4, effort 4, strategic fit 5, differentiation 4, risk 3, confidence 2.
- Focus/typewriter mode: impact 3, effort 3, strategic fit 4, differentiation 3, risk 1, confidence 3.
- Revision labels: impact 3, effort 3, strategic fit 4, differentiation 2, risk 2, confidence 3.
- Export themes: impact 3, effort 3, strategic fit 4, differentiation 2, risk 1, confidence 4.
- Multi-document library: impact 5, effort 5, strategic fit 5, differentiation 3, risk 3, confidence 2.

## Session Scoring (2026-02-09, Cycle 3)
Selected (1-5 scale; higher is better except risk):
- Focus + typewriter modes: impact 4, effort 3, strategic fit 5, differentiation 2, risk 1, confidence 4.
- Revision labels (named versions): impact 4, effort 3, strategic fit 5, differentiation 2, risk 2, confidence 4.
- Export themes (HTML/PDF): impact 3, effort 2, strategic fit 4, differentiation 2, risk 1, confidence 4.

Not selected this cycle:
- Playwright E2E smoke: impact 4, effort 4, strategic fit 5, differentiation 1, risk 2, confidence 3.
- Merge alignment improvements: impact 4, effort 4, strategic fit 5, differentiation 4, risk 3, confidence 2.

## Session Scoring (2026-02-09, Cycle 4)
Selected (1-5 scale; higher is better except risk):
- Multi-document library: impact 5, effort 4, strategic fit 5, differentiation 3, risk 3, confidence 3.
- Cut release `0.2.0`: impact 3, effort 1, strategic fit 4, differentiation 1, risk 1, confidence 5.

Not selected this cycle:
- Playwright E2E smoke: impact 4, effort 4, strategic fit 5, differentiation 1, risk 2, confidence 3.
- Merge alignment improvements: impact 4, effort 4, strategic fit 5, differentiation 4, risk 3, confidence 2.
- Outline navigator: impact 4, effort 3, strategic fit 5, differentiation 2, risk 2, confidence 3.
- Document-wide search: impact 4, effort 4, strategic fit 4, differentiation 2, risk 2, confidence 2.
- Local comments/annotations: impact 4, effort 4, strategic fit 4, differentiation 3, risk 3, confidence 2.

## Session Scoring (2026-02-09, Cycle 5)
Selected (1-5 scale; higher is better except risk):
- Outline navigator: impact 5, effort 3, strategic fit 5, differentiation 2, risk 2, confidence 4.
- Playwright E2E smoke: impact 4, effort 4, strategic fit 5, differentiation 1, risk 2, confidence 3.
- Dependency security bumps: impact 5, effort 2, strategic fit 5, differentiation 1, risk 2, confidence 4.

Not selected this cycle:
- Improve merge alignment: impact 4, effort 4, strategic fit 5, differentiation 4, risk 3, confidence 2.
- Document-wide search: impact 4, effort 4, strategic fit 4, differentiation 2, risk 2, confidence 2.
- Comments/annotations: impact 4, effort 4, strategic fit 4, differentiation 3, risk 3, confidence 2.

## Implemented
- [x] 2026-02-09: Added outline navigator (headings list) with click-to-jump and optional "follow cursor" highlighting for long drafts.
  Evidence: `src/lib/outline.ts`, `src/ui/OutlinePanel.tsx`, `src/ui/Editor.tsx`, `src/App.tsx`, `tests/outline.test.ts`, `npm run check`.
- [x] 2026-02-09: Added Playwright E2E smoke coverage for import/export + stash navigation, and wired it into CI.
  Evidence: `scripts/e2e-smoke.mjs`, `.github/workflows/ci.yml`, `package.json`, `npm run e2e:smoke`.
- [x] 2026-02-09: Security maintenance: bumped `dompurify` + dev tooling deps to address npm audit high/critical advisories; left remaining moderate advisory tracked due to Vite major upgrade requirement.
  Evidence: `package.json`, `package-lock.json`, `npm audit`.
- [x] 2026-02-09: Added multi-document library (create/switch/rename/delete) with safe migration from v1 single-document storage to v2 library storage.
  Evidence: `src/state/store.tsx`, `src/state/persistence.ts`, `src/state/types.ts`, `src/App.tsx`, `tests/app.smoke.test.tsx`, `npm run check`.
- [x] 2026-02-09: Cut release `0.2.0` (version bump + changelog section) to keep shipped behavior auditable.
  Evidence: `package.json`, `CHANGELOG.md`, `npm run check`.
- [x] 2026-02-09: Added distraction-free focus mode + typewriter mode (toggles + keyboard shortcuts) and persisted UI preferences.
  Evidence: `src/App.tsx`, `src/ui/Editor.tsx`, `src/state/store.tsx`, `src/styles.css`, `tests/app.smoke.test.tsx`, `npm run check`.
- [x] 2026-02-09: Added revision labels (named versions) plus History filter/search support for labeled milestones.
  Evidence: `src/App.tsx`, `src/ui/HistoryPanel.tsx`, `src/state/store.tsx`, `tests/app.smoke.test.tsx`, `npm run check`.
- [x] 2026-02-09: Added selectable export themes for HTML/PDF export and escaped export titles.
  Evidence: `src/lib/exportDoc.ts`, `src/App.tsx`, `tests/exportDoc.test.ts`, `npm run check`.
- [x] 2026-02-09: Added OpenAI-compatible local endpoint adapter (LM Studio) to the LLM pipeline settings, including model refresh and connection tests.
  Evidence: `src/agents/llmAdapter.ts`, `src/ui/SettingsPanel.tsx`, `tests/llmAdapter.test.ts`, `npm test`.
- [x] 2026-02-09: Added keyboard shortcut cheat sheet modal (Cmd/Ctrl + /) and a sidebar entry-point.
  Evidence: `src/ui/ShortcutsModal.tsx`, `src/App.tsx`, `tests/app.smoke.test.tsx`, `npm test`.
- [x] 2026-02-09: Added canonical autonomous engineering contract at repo root (`AGENTS.md`) and prevented drift by pointing `docs/AGENTS.md` to the canonical contract.
  Evidence: `AGENTS.md`, `docs/AGENTS.md`.
- [x] 2026-02-09: Added optional local Ollama LLM provider (with model refresh + connection test) and safe offline fallback when provider fails.
  Evidence: `src/agents/llmAdapter.ts`, `src/ui/SettingsPanel.tsx`, `tests/llmAdapter.test.ts`, `npm run check`.
- [x] 2026-02-09: Added non-blocking toast notifications (a11y `aria-live`) for branch/import/export/merge/LLM outcomes.
  Evidence: `src/ui/ToastStack.tsx`, `src/App.tsx`, `src/styles.css`, `npm run check`.
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
- Market scan (untrusted, 2026-02-09): Baseline writing-app UX expectations we should hit:
  - Distraction-free modes (focus/typewriter) and readable typography are table stakes. Sources: Typora focus mode/typewriter mode. https://typora.io/
  - Export quality matters (PDF/HTML) with theme-able output. Sources: Typora export formats and theme support. https://support.typora.io/Export/
  - Navigability scales better with an outline-like affordance. Sources: Typora Outline panel. https://support.typora.io/Outline/ and Google Docs Outline. https://support.google.com/docs/answer/99397
  - Durable revision history and “named versions” make long-form iteration safer. Source: Google Docs version history + named versions. https://support.google.com/docs/answer/190843
- Market scan (untrusted, 2026-02-09): Additional expectations for long-form writing IDEs:
  - Focus mode and typewriter scrolling are explicit features in dedicated writing apps (iA Writer). https://ia.net/writer
  - Export styling is often user-selectable via styles/themes (Ulysses export styles). https://ulysses.app/blog/2022/12/the-ultimate-guide-to-ulysses-export
  - Milestone snapshots/labels are common in long-form authoring tools (Scrivener snapshots). https://scrivener.tenderapp.com/help/kb/features-and-usage/snapshots

## Notes
- This file is maintained by the autonomous clone loop.

### Auto-discovered Open Checklist Items (2026-02-09)
- None
