# Project Memory

## Entry 2026-02-17 — GitHub Actions migration to self-hosted runners
- Decision: Migrate all CI workflows/jobs to `runs-on: self-hosted`, add runner-safe prerequisites in workflows, and document repository-level runner setup/validation.
- Why: Repository billing constraints block GitHub-hosted minutes; self-hosted execution keeps CI operational without touching billing settings.
- Evidence:
  - `.github/workflows/ci.yml`
  - `.github/workflows/codeql.yml`
  - `docs/SELF_HOSTED_RUNNER.md`
  - `README.md`
  - `CHANGELOG.md`
- Commit: `pending (current session)`
- Confidence: high
- Trust label: verified-local

## Verification Evidence (2026-02-17, self-hosted migration)
- `npm install` (pass)
- `npm run lint:workflows` (pass)
- `npm run check` (pass)
- `npx playwright install chromium` (pass)
- `npm run e2e:smoke` (pass)
- `mkdir -p .tmp/bin && GOBIN="$(pwd)/.tmp/bin" go install github.com/zricethezav/gitleaks/v8@v8.28.0 && "$(pwd)/.tmp/bin/gitleaks" git --redact --no-banner --verbose` (pass; no leaks found)
- `rg -n "runs-on:" .github/workflows/*.yml` (pass; all jobs set to `self-hosted`)

## Entry 2026-02-17 — Command palette, find/replace, per-document preferences, and merge safety
- Decision: Ship a 10-commit improvement series focused on keyboard-first workflows, editor text operations, document-scoped defaults, and safer merge execution.
- Why: These are high-frequency writing workflows and directly close longstanding backlog gaps (find/replace, command palette, merge confidence, modal accessibility).
- Evidence:
  - `src/ui/CommandPalette.tsx`
  - `src/lib/findReplace.ts`
  - `src/ui/FindReplaceModal.tsx`
  - `src/state/types.ts`
  - `src/state/store.tsx`
  - `src/lib/mergeMetrics.ts`
  - `src/lib/hash.ts`
  - `src/lib/useModalFocusTrap.ts`
  - `tests/findReplace.test.ts`
  - `tests/mergeMetrics.test.ts`
  - `tests/hash.test.ts`
  - `tests/app.smoke.test.tsx`
- Commit: `pending (current series finalized in this session)`
- Confidence: high
- Trust label: verified-local

## Entry 2026-02-17 — Current-state market scan refresh
- Decision: Prioritize command palette and find/replace as baseline PMF features, with accessibility-grade modal behavior and stronger merge confidence for long-form editing.
- Why: Mature writing and editor products keep keyboard command access and robust find/replace as table-stakes, while merge/revision confidence remains a trust differentiator.
- Evidence:
  - VS Code command palette docs: https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette
  - Typora find/replace docs: https://support.typora.io/Find-and-Replace/
  - Google Docs find and replace docs: https://support.google.com/docs/answer/62754
  - Notion keyboard slash command docs: https://www.notion.com/help/guides/using-basic-blocks
- Commit: `(research-informed prioritization in this session)`
- Confidence: medium
- Trust label: untrusted

## Verification Evidence (2026-02-17)
- `npm run check` (fail; eslint warning `react-hooks/exhaustive-deps` in `src/App.tsx` for missing `doc.branches` dependency)
- `npm run check` (pass)
- `npm run lint:workflows` (pass)
- `npm run e2e:smoke` (pass)
- `npm run test -- tests/app.smoke.test.tsx` (pass)
- `npm run test -- tests/findReplace.test.ts` (pass)
- `npm run test -- tests/mergeMetrics.test.ts` (pass)
- `npm run test -- tests/hash.test.ts` (pass)
- `npm run typecheck` (pass)

## Entry 2026-02-11 — Markdown export + automation selector hardening
- Decision: Add Markdown export (`.md`) with optional frontmatter metadata (`title`, `label`, `createdAt`), add stable `data-testid` attributes for critical flows, and migrate E2E smoke to those selectors.
- Why: Markdown export improves interoperability for local-first workflows; stable selectors reduce E2E brittleness and make future automation safer.
- Evidence:
  - `src/lib/exportDoc.ts`
  - `src/App.tsx`
  - `src/ui/Editor.tsx`
  - `src/ui/HistoryPanel.tsx`
  - `scripts/e2e-smoke.mjs`
  - `tests/exportDoc.test.ts`
  - `tests/app.smoke.test.tsx`
  - `npm run check` (pass)
  - `npm run e2e:smoke` (pass)
- Commit: `626053409abab518b3640ce9af6097ba54ecbc46`
- Confidence: high
- Trust label: trusted
- Follow-up:
  - Add app-level regression coverage for markdown export downloads (plain + frontmatter payload validation).

## Entry 2026-02-11 — Diff computation memoization
- Decision: Memoize diff computation in `DiffView` so expensive semantic diffing runs only when compared inputs change.
- Why: The app re-renders frequently during editing/navigation; avoiding repeated diff recalculation improves responsiveness on longer drafts.
- Evidence:
  - `src/lib/diff.tsx`
  - `npm run check` (pass)
- Commit: `626053409abab518b3640ce9af6097ba54ecbc46`
- Confidence: high
- Trust label: trusted

## Entry 2026-02-11 — Bounded market scan and gap map refresh
- Decision: Keep merge-alignment and find/replace as top backlog priorities after shipping markdown export + test stability improvements.
- Why: Adjacent writing tools consistently treat find/replace and durable revision ergonomics as baseline expectations; these remain the highest-impact product gaps.
- Evidence:
  - Typora find/replace docs: https://support.typora.io/Find-and-Replace/
  - VS Code search across files docs: https://code.visualstudio.com/docs/editing/codebasics#_search-across-files
  - iA Writer product page: https://ia.net/writer
  - Google Docs version history docs: https://support.google.com/docs/answer/190843
- Commit: `(documentation-only in tracker updates)`
- Confidence: medium
- Trust label: untrusted

## Entry 2026-02-11 — Backlog and operations tracker refresh
- Decision: Refresh `CLONE_FEATURES.md`, `AGENTS.md` mutable timestamp, and session verification/incident logs to reflect shipped work and remaining priorities.
- Why: Autonomous maintenance depends on accurate backlog state, auditable verification evidence, and explicit incident prevention rules.
- Evidence:
  - `CLONE_FEATURES.md`
  - `AGENTS.md`
  - `PROJECT_MEMORY.md`
  - `INCIDENTS.md`
- Commit: `22be1b33adea25a06dd3cc90e297979bd3413bd8`
- Confidence: high
- Trust label: trusted

## Entry 2026-02-09 — Multi-document library (local-first)
- Decision: Replace single-document state with a document library (create/switch/rename/delete) and migrate persistence from v1 single-document storage to v2 library storage.
- Why: A writing IDE needs multiple documents (chapters, variants, briefs) to be broadly useful; migration preserves existing users' work while unlocking the library UX.
- Evidence:
  - `src/state/types.ts`
  - `src/state/store.tsx`
  - `src/state/persistence.ts`
  - `src/App.tsx`
  - `tests/app.smoke.test.tsx`
  - `npm run check` (pass)
- Commit: `3dda922aa508ac4f49eb9aa6de15c76d0b4ee8aa`
- Confidence: medium-high
- Trust label: verified-local
- Follow-up:
  - Add a lightweight rename/delete affordance in the document selector itself (and sort documents by last-updated once we track it).

## Entry 2026-02-09 — Cut release 0.2.0
- Decision: Cut `0.2.0` by moving the long-running Unreleased changelog entries into a versioned section and bumping `package.json` version.
- Why: Keeps shipped behavior auditable and reduces drift between code and docs as the feature set grows.
- Evidence:
  - `CHANGELOG.md`
  - `package.json`
  - `npm run check` (pass)
- Commit: `48db002e8f83c98cedd1f0d9df1a145c61c3270e`
- Confidence: high
- Trust label: verified-local

## Entry 2026-02-09 — Export themes for HTML/PDF + safe title escaping
- Decision: Add a small preset export theme library (Paper/Classic/Night) for HTML/PDF export and escape the HTML `<title>` to avoid export-time injection.
- Why: Export quality and styling is a baseline expectation in writing tools; escaping export metadata is a low-effort hardening step.
- Evidence:
  - `src/lib/exportDoc.ts`
  - `tests/exportDoc.test.ts`
  - `npm run check` (pass)
- Commit: `51715c8c56b6b372fcc266a406c1011a88ca2522`
- Confidence: high
- Trust label: verified-local
- Follow-up:
  - Consider a per-document export theme setting (in addition to global preference) if multi-document lands.

## Entry 2026-02-09 — Focus/typewriter modes + revision labels (named versions)
- Decision: Add distraction-free focus mode (hide sidebar/preview), typewriter mode (cursor centering), and revision labels with History filtering for labeled-only milestones.
- Why: Focus/typewriter improves drafting ergonomics; named versions/labels make long-form iteration safer and easier to navigate.
- Evidence:
  - `src/App.tsx`
  - `src/ui/Editor.tsx`
  - `src/ui/HistoryPanel.tsx`
  - `src/state/store.tsx`
  - `src/styles.css`
  - `tests/app.smoke.test.tsx`
  - `npm run check` (pass)
- Commit: `3a9bb1c4bfd9e4d70db50d506362477a82506b55`
- Confidence: medium-high
- Trust label: verified-local
- Follow-up:
  - If typewriter mode feels jumpy on very large documents, consider throttling cursor-centering to animation frames only when the caret line changes.

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
- `curl -sf http://localhost:11434/api/tags` (fail; Ollama not running locally)
- `gh run watch 21812871398 --exit-status` (pass; CI)
- `gh run watch 21812871401 --exit-status` (pass; CodeQL)

## Entry 2026-02-09 — OpenAI-compatible local provider (LM Studio)
- Decision: Add an OpenAI-compatible local endpoint adapter (`/v1/models`, `/v1/chat/completions`) alongside Ollama, with model refresh + connection test + safe offline fallback behavior.
- Why: Many local LLM runtimes expose an OpenAI-shaped HTTP API; supporting it increases adoption without adding accounts/telemetry/remote keys in the browser.
- Evidence:
  - `src/agents/llmAdapter.ts`
  - `src/ui/SettingsPanel.tsx`
  - `src/state/store.tsx`
  - `tests/llmAdapter.test.ts`
  - `npm test` (pass)
  - `npm run lint` (pass)
  - `npm run typecheck` (pass)
  - `npm run build` (pass)
- Commit: `42d74e2bdb92d5e437a1e7c0e9a9a8f1f78a71b5`
- Confidence: medium-high
- Trust label: verified-local

## Entry 2026-02-09 — Shortcut Cheat Sheet Modal
- Decision: Add a keyboard shortcut cheat sheet modal (Cmd/Ctrl + `/`) with an in-UI entry point.
- Why: Power users expect discoverable shortcuts; a modal makes the keyboard workflow self-teaching without cluttering the main UI.
- Evidence:
  - `src/ui/ShortcutsModal.tsx`
  - `src/App.tsx`
  - `tests/app.smoke.test.tsx`
  - `npm test` (pass)
- Commit: `4d6a4274bfcd597ef8cf05caf0742b11ab8a64fa`
- Confidence: high
- Trust label: verified-local

## Verification Evidence (2026-02-09, Cycle 2)
- `npm test --silent` (pass; 23 tests)
- `npm run lint` (pass)
- `npm run typecheck` (pass)
- `npm run build` (pass)
- `npm run check` (pass; note: local Node v25 prints a `--localstorage-file` warning during tests)
- `npm run dev -- --host 127.0.0.1 --port 4173` (pass; server started)
- `curl -sf http://127.0.0.1:4173/ | head` (pass; returned HTML)
- `gh issue list --state open --search "author:sarveshkapre" -L 20` (pass; no open owner-authored issues)
- `gh run watch 21818290097 --exit-status` (pass; CI)
- `gh run watch 21818290172 --exit-status` (pass; CodeQL)
- `gh run watch 21818352638 --exit-status` (pass; CI for `01d1c85`)
- `gh run watch 21818352632 --exit-status` (pass; CodeQL for `01d1c85`)

## Verification Evidence (2026-02-09, Cycle 3)
- `npm run check` (pass)
- `npm run lint:workflows` (pass)
- `npm test --silent` (pass)
- `npm run dev -- --host 127.0.0.1 --port 4173` (pass; server started)
- `curl -sf http://127.0.0.1:4173/ | head` (pass; returned HTML)
- `gh run watch 21826127286 --exit-status` (pass; CI)
- `gh run watch 21826127303 --exit-status` (pass; CodeQL)
- `gh run watch 21826213686 --exit-status` (pass; CI for docs update)
- `gh run watch 21826213681 --exit-status` (pass; CodeQL for docs update)
- `gh run watch 21826280930 --exit-status` (pass; CI)
- `gh run watch 21826280931 --exit-status` (pass; CodeQL)

## Verification Evidence (2026-02-09, Cycle 4)
- `npm run check` (pass)
- `bash -lc 'npm run dev -- --host 127.0.0.1 --port 4173 >/tmp/agentic-dev.log 2>&1 & pid=$!; sleep 2; curl -sf http://127.0.0.1:4173/ | head -n 5; kill $pid; wait $pid || true'` (pass; server started + returned HTML)
- `gh run watch 21835228382 --exit-status` (pass; CI for `3dda922`)
- `gh run watch 21835228401 --exit-status` (pass; CodeQL for `3dda922`)
- `gh run watch 21835300003 --exit-status` (pass; CI for `48db002`)
- `gh run watch 21835300061 --exit-status` (pass; CodeQL for `48db002`)
- `gh run watch 21835373525 --exit-status` (pass; CI for `53a363a`)
- `gh run watch 21835373495 --exit-status` (pass; CodeQL for `53a363a`)

## Entry 2026-02-09 — Outline navigator for long drafts
- Decision: Add an Outline panel (Markdown headings list) with click-to-jump and optional follow-cursor highlighting.
- Why: Long-form writing UX breaks down without fast navigation; an outline pane is a baseline affordance in mature writing tools and reduces reliance on manual scrolling.
- Evidence:
  - `src/lib/outline.ts`
  - `src/ui/OutlinePanel.tsx`
  - `src/ui/Editor.tsx`
  - `src/App.tsx`
  - `tests/outline.test.ts`
  - `npm run check` (pass)
- Commit: `a1a82f4f9f1d07b6c5114e70b3414c617b861395`
- Confidence: high
- Trust label: verified-local
- Follow-up:
  - Consider persisting outline preferences (follow-cursor, collapse state) in `settings.ui` once UX stabilizes.

## Entry 2026-02-09 — E2E smoke + security maintenance
- Decision: Add a Playwright-driven E2E smoke script (export + stash navigation) and run it in CI; bump dependencies to clear npm audit high/critical advisories.
- Why: E2E smoke catches UI regressions in critical flows (stash/export) that unit tests miss; keeping audit clean for high/critical issues reduces supply-chain and XSS risk for a writing app that renders user content.
- Evidence:
  - `scripts/e2e-smoke.mjs`
  - `.github/workflows/ci.yml`
  - `package.json`, `package-lock.json`
  - `npm run e2e:smoke` (pass)
  - `npm audit --audit-level=moderate` (fail; remaining moderate advisory requires Vite major upgrade)
- Commit: `be34cabd25ccafc7e4d9f8fc9808f1f7a2ef5e0c`
- Confidence: medium-high
- Trust label: verified-local
- Follow-up:
  - Track the remaining moderate `esbuild` dev-server advisory; reassess when Vite major upgrade is low-risk for this repo.

## Verification Evidence (2026-02-09, Cycle 5)
- `gh issue list --repo sarveshkapre/agentic-writing-ide --state open --limit 20` (pass; empty)
- `npm run lint:workflows` (pass)
- `npm run check` (pass)
- `npx playwright install chromium` (pass)
- `npm run build && npm run e2e:smoke` (fail; timed out waiting for preview server due to host binding)
- `npm run e2e:smoke` (pass; after binding preview server to `127.0.0.1`)
- `npm audit --audit-level=moderate` (fail; remaining moderate advisory requires Vite major upgrade)
- `gh run watch 21843776310 --exit-status` (pass; CI for `be34cab`)
- `gh run watch 21843776316 --exit-status` (pass; CodeQL for `be34cab`)
- `gh run watch 21843865477 --exit-status` (pass; CI for `742783a`)
- `gh run watch 21843865509 --exit-status` (pass; CodeQL for `742783a`)
- `gh run watch 21843919046 --exit-status` (pass; CI for `2135683`)
- `gh run watch 21843919042 --exit-status` (pass; CodeQL for `2135683`)

## Verification Evidence (2026-02-11, Cycle 1)
- `gh issue list --repo sarveshkapre/agentic-writing-ide --state open --limit 50 --json number,title,author,url` (pass; no owner/bot open issues)
- `gh run list --repo sarveshkapre/agentic-writing-ide --limit 20 --json databaseId,workflowName,headSha,status,conclusion,createdAt,event` (pass; no failing recent runs before changes)
- `npm run check` (pass)
- `npm run e2e:smoke` (fail; `locator.inputValue` timeout on `getByTestId("editor-input")`)
- `npm run e2e:smoke` (pass; after explicit `await editor.waitFor()` hardening)
- `bash -lc 'npm run dev -- --host 127.0.0.1 --port 4174 >/tmp/agentic-dev.log 2>&1 & pid=$!; sleep 3; curl -sf http://127.0.0.1:4174/ | head -n 5; kill $pid; wait $pid || true'` (pass; local smoke HTML returned)
- `git push origin main` (pass; pushed `6260534` to `origin/main`)
- `gh run watch 21896355215 --repo sarveshkapre/agentic-writing-ide --exit-status` (pass; CI for `6260534`)
- `gh run watch 21896355202 --repo sarveshkapre/agentic-writing-ide --exit-status` (pass; CodeQL for `6260534`)
- `git push origin main` (pass; pushed `22be1b3` to `origin/main`)
- `gh run watch 21896411610 --repo sarveshkapre/agentic-writing-ide --exit-status` (pass; CI for `22be1b3`)
- `gh run watch 21896411621 --repo sarveshkapre/agentic-writing-ide --exit-status` (pass; CodeQL for `22be1b3`)
