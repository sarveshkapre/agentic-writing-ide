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
- More: see `docs/PROJECT.md`

## Shipped (latest)
- 2026-02-01: Working copy editing (revisions are immutable) + safe navigation prompts for uncommitted edits + print/PDF export without popups + pinned revisions + compare presets.

## Next to ship
- Editor flow: autosave snapshots and/or a “stash” for uncommitted edits
- History ergonomics: pinned list section polish (counts, sorting)
