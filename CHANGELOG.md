# Changelog

## Unreleased
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
