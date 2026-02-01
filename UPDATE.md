# Update (2026-02-01)

## What changed
- Added a “working copy” editing model so historical revisions are immutable.
- Added a navigation guard: when you have uncommitted edits and switch revisions/branches, the app prompts you to commit/discard/cancel.
- Improved print/PDF export reliability by using an in-page print iframe (avoids pop-up windows).
- Fixed typechecking by adding missing type packages for `dompurify` and `diff-match-patch`.
- Hardened tests: enable Vitest globals and add a smoke test for print export.

## How to verify
- `npm install`
- `npm run check`

## Notes
- No PR created/updated for this change (working directly on `main`).
