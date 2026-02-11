# Clone Feature Tracker

## Context Sources
- README and docs
- TODO/FIXME markers in code
- Test and build failures
- Gaps found during codebase exploration

## Candidate Features To Do
- [ ] P1: Improve three-way merge alignment to reduce false-positive conflicts for line insertions/moves.
- [ ] P1: Find + replace in editor (single doc first) with keyboard shortcuts and next/prev match navigation.
- [ ] P1: Security maintenance: clear remaining moderate `npm audit` advisory (Vite major upgrade + compatibility checks).
- [ ] P1: Add migration-safe per-document preferences (default export theme, target word count, markdown frontmatter mode).
- [ ] P2: Add long-document perf smoke path (~50k words) and guardrail threshold for render + diff latency.
- [ ] P2: Add search result keyboard navigation (arrow keys + enter) and "next/previous hit" for working copy.
- [ ] P2: Add lightweight branch merge summary panel (changed line count + conflicting sections preview).
- [ ] P2: Add document quick actions in selector row (rename/delete/sort by recency) to reduce navigation friction.
- [ ] P2: Add a command palette (`Cmd/Ctrl + K`) for high-frequency actions (stage run, export, branch, search).
- [ ] P2: Add regression test coverage for markdown export button flows (plain + frontmatter) at app level.
- [ ] P2: Add focus-management and tab-trap handling for all modals (search/shortcuts/confirm dialogs).
- [ ] P3: Add local comments/annotations (non-destructive) tied to revision ranges/line numbers.
- [ ] P3: Add user template CRUD (save current draft as template, edit/delete templates).
- [ ] P3: Add branch protection warning when merging stale previews after new commits.
- [ ] P3: Add optional JSON schema validation diagnostics on import with line/column pointers.
- [ ] P3: Add restore checkpoints for failed import/reset operations.

## Session Scoring (2026-02-11, Cycle 1)
Selected (1-5 scale; higher is better except risk):
- Markdown export (`.md`) with optional frontmatter: impact 4, effort 2, strategic fit 5, differentiation 1, risk 1, confidence 5.
- Stable `data-testid` attributes for key flows + E2E migration: impact 4, effort 2, strategic fit 5, differentiation 1, risk 1, confidence 5.
- Diff performance: memoize expensive diff computations: impact 3, effort 1, strategic fit 4, differentiation 1, risk 1, confidence 5.

Not selected this cycle:
- Improve merge alignment: impact 5, effort 4, strategic fit 5, differentiation 4, risk 3, confidence 2.
- Find + replace: impact 5, effort 3, strategic fit 5, differentiation 2, risk 2, confidence 3.
- Per-document preferences: impact 4, effort 3, strategic fit 4, differentiation 2, risk 2, confidence 3.
- Long-doc perf smoke thresholding: impact 4, effort 3, strategic fit 4, differentiation 1, risk 2, confidence 3.
- Vite major security upgrade: impact 5, effort 4, strategic fit 5, differentiation 1, risk 3, confidence 2.

## Session Scoring (2026-02-10, Cycle 1)
Selected (1-5 scale; higher is better except risk):
- Document-wide search modal (Cmd/Ctrl + F): impact 5, effort 3, strategic fit 5, differentiation 2, risk 2, confidence 3.
- Markdown export (.md) with optional frontmatter: impact 4, effort 2, strategic fit 5, differentiation 1, risk 1, confidence 4.
- Stable `data-testid` attributes for key flows: impact 3, effort 1, strategic fit 4, differentiation 1, risk 1, confidence 5.
- Diff perf: memoize expensive diff computations: impact 3, effort 1, strategic fit 4, differentiation 1, risk 1, confidence 5.

Not selected this cycle:
- Improve merge alignment: impact 4, effort 4, strategic fit 5, differentiation 4, risk 3, confidence 2.
- Find + replace: impact 4, effort 3, strategic fit 4, differentiation 1, risk 2, confidence 3.
- Comments/annotations: impact 4, effort 4, strategic fit 4, differentiation 3, risk 3, confidence 2.
- Per-document preferences: impact 3, effort 3, strategic fit 4, differentiation 2, risk 2, confidence 3.
- Long-doc perf smoke test: impact 3, effort 2, strategic fit 4, differentiation 1, risk 2, confidence 3.

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
- [x] 2026-02-11: Added Markdown export (`.md`) with optional frontmatter metadata (`title`, `label`, `createdAt`) plus export-mode selector and shortcut (`Cmd/Ctrl + Shift + M`).
  Evidence: `src/lib/exportDoc.ts`, `src/App.tsx`, `src/ui/ShortcutsModal.tsx`, `tests/exportDoc.test.ts`, `tests/app.smoke.test.tsx`, `npm run check`, `npm run e2e:smoke`.
- [x] 2026-02-11: Added stable `data-testid` coverage for critical edit/commit/export/import/branch/merge/history flows and migrated E2E smoke selectors to the stable attributes.
  Evidence: `src/App.tsx`, `src/ui/Editor.tsx`, `src/ui/HistoryPanel.tsx`, `scripts/e2e-smoke.mjs`, `npm run e2e:smoke`.
- [x] 2026-02-11: Memoized expensive diff computations to avoid repeated recomputation during non-diff UI re-renders.
  Evidence: `src/lib/diff.tsx`, `npm run check`.
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
- Market scan (untrusted, 2026-02-11): Bounded baseline for writing/editing UX in adjacent tools:
  - Typora documents dedicated find/replace ergonomics as a core workflow. Source: https://support.typora.io/Find-and-Replace/
  - VS Code sets a high baseline for in-project search and replace affordances (keyboard-first, scoped search). Source: https://code.visualstudio.com/docs/editing/codebasics#_search-across-files
  - iA Writer positions Markdown export/interoperability as a default expectation. Source: https://ia.net/writer
  - Google Docs highlights named version history as a durability baseline for long-form writing workflows. Source: https://support.google.com/docs/answer/190843
- Gap map (2026-02-11):
  - Missing: editor find/replace with keyboard-first navigation and replace-all.
  - Weak: merge alignment still line-index based and can over-report conflicts on shifted blocks.
  - Parity: markdown export now supports plain + frontmatter metadata.
  - Differentiator: local-first agent pipeline + branchable revision history with explicit merge preview.
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

- Market scan (untrusted, 2026-02-10): Baseline expectations we should hit next:
  - In-app search/find is table-stakes and often spans the whole workspace/vault. Sources: Obsidian search docs. https://help.obsidian.md/Plugins/Search
  - Find/replace ergonomics matter for long-form drafting. Source: Typora find/replace docs. https://support.typora.io/Find-and-Replace/
  - Markdown export interoperability is a common "escape hatch" even for opinionated editors. Source: iA Writer features (Markdown). https://ia.net/writer

## Notes
- This file is maintained by the autonomous clone loop.

### Auto-discovered Open Checklist Items (2026-02-11)
- None
