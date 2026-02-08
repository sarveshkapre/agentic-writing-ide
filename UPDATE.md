# Update (2026-02-08)

## What changed
- Fixed CI workflow parsing in `.github/workflows/ci.yml` by correcting the `pull_request` expression string literal.
- Added revision-scoped stash behavior for dirty working copies so uncommitted edits can be preserved per revision.
- Added `Stash & continue` option in the navigation guard when switching revisions/branches with uncommitted edits.
- Hardened import flow: JSON import now validates payload shape and shows explicit error status when invalid.
- Added file-reading fallback (`FileReader`) when `File.text()` is unavailable.
- Added smoke test coverage for stash navigation and invalid JSON import failures.
- Added `npm run lint:workflows` (`scripts/lint-workflows.sh`) for local GitHub workflow validation with `actionlint`.

## How to verify
- `npm run lint:workflows`
- `npm run check`
- `npm run dev -- --host 127.0.0.1 --port 4173` then `curl -sf http://127.0.0.1:4173 | head`

## Notes
- No PR created/updated for this change (working directly on `main`).

# Update (2026-02-01)

## What changed
- Added a “working copy” editing model so historical revisions are immutable.
- Added a navigation guard: when you have uncommitted edits and switch revisions/branches, the app prompts you to commit/discard/cancel.
- Improved print/PDF export reliability by using an in-page print iframe (avoids pop-up windows).
- Fixed typechecking by adding missing type packages for `dompurify` and `diff-match-patch`.
- Hardened tests: enable Vitest globals and add a smoke test for print export.
- History ergonomics: pin revisions, filter to pinned only, and show pinned as a dedicated section.
- History ergonomics: add compare presets (head/parent) and quick clear.

## How to verify
- `npm install`
- `npm run check`

## Notes
- No PR created/updated for this change (working directly on `main`).
