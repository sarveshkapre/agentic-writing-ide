# Changelog

## Unreleased
- CI: fixed invalid `dependency-review` condition in `.github/workflows/ci.yml` (`'pull_request'` string literal), which previously prevented CI jobs from starting.
- CI: fixed gitleaks push-scan failures by setting `actions/checkout` `fetch-depth: 0` in the `gitleaks` job.
- Added revision-scoped draft stash behavior so uncommitted edits can be preserved and restored when navigating between revisions/branches.
- Navigation guard now supports `Stash & continue` in addition to commit/discard.
- Import reliability: JSON import now validates shape, reports friendly errors, and uses a `FileReader` fallback when `File.text()` is unavailable.
- Tests: added smoke coverage for stash navigation + invalid import handling.
- DevEx: added `npm run lint:workflows` via `scripts/lint-workflows.sh` to run `actionlint` locally.
- Working copy editing (revisions are immutable); stage/branch actions auto-commit dirty edits.
- Navigation guard: prompts to commit/discard uncommitted edits when switching revisions/branches.
- History ergonomics: pin revisions and filter to pinned only.
- History ergonomics: compare presets (head/parent) and quick clear.
- Print/PDF export uses an in-page print iframe (more reliable than popups).
- Test harness: enable Vitest globals; add smoke coverage for print export.
- Typecheck: add missing `@types/diff-match-patch` and `@types/dompurify`.

## 0.1.0
- Initial scaffold with editor, agent pipeline, revision history, and diffs.
- Added history filters, diff modes, and keyboard shortcuts.
- Added LLM stub settings panel and export to HTML/PDF.
- Added branch merge (no-conflict copy).
