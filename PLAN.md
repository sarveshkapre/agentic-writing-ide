# Agentic Writing IDE — Plan

## Product pitch
Local-first writing IDE that turns a draft into stronger iterations (draft → critique → revise → polish), with revision history, diffs, and rationales — offline by default.

## Features (today)
- Markdown editor + live preview
- Offline agent pipeline stages
- Branchable revision history + diff compare
- Local persistence + JSON import/export
- Export to HTML/PDF

## Top risks / unknowns
- History correctness: keep revisions immutable; avoid accidental mutation
- UX complexity: progressive disclosure; keep the core flow obvious
- Performance: diff/preview should stay snappy for long drafts

## Commands
- Setup: `npm install`
- Dev: `npm run dev`
- Quality gate: `npm run check`
- Workflow lint: `npm run lint:workflows`
- More: see `docs/PROJECT.md`

## Shipped (latest)
- 2026-02-09: Added focus mode + typewriter mode, revision labels (named versions) with History filtering, and selectable export themes for HTML/PDF.
- 2026-02-09: Three-way merge preview with conflict resolution modes (`manual`, `prefer current`, `prefer source`) + merge utility tests + branch-name validation + CI workflow lint in build job.
- 2026-02-08: CI workflow parsing fix + revision-scoped draft stash with `Stash & continue` navigation + hardened JSON import errors + workflow lint command.
- 2026-02-01: Working copy editing (revisions are immutable) + safe navigation prompts for uncommitted edits + print/PDF export without popups + pinned revisions + compare presets.

## Next to ship
- Real LLM provider integration (bring your own key) with safe failure states.
- Smarter merge alignment to reduce false-positive conflicts on large insertions.
