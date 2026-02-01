# Plan — Agentic Writing IDE

Canonical snapshot: see `/PLAN.md`.

## Goal
Build a local-first, document‑centric writing IDE that walks a draft through multi‑agent stages (draft → critique → revise → polish) with branchable history, diffs, and rationales. Runs fully offline by default, with optional LLM integration later.

## Target users
Solo writers who want structured iteration, clear rationale, and a versioned writing workflow without accounts.

## MVP scope
- Document editor + live preview.
- Agent pipeline with configurable stages and deterministic offline transforms.
- Commit history with rationale, tags, and branch support.
- Diff viewer between any two revisions.
- Local persistence (localStorage) with import/export JSON.

Non-goals (MVP)
- Real-time collaboration.
- Cloud sync.
- Real LLM calls (optional adapter stub only).

## Stack choices
- Frontend: Vite + React + TypeScript.
- State: lightweight custom store (useState + context + reducers).
- Styling: CSS modules + CSS variables (no heavy UI libs).
- Tests: Vitest + React Testing Library.

Rationale: smallest maintenance surface, fast dev/build, easy static deploy.

## Architecture
- `src/state`: document model, history/branches, persistence.
- `src/agents`: offline pipeline transforms + rationale generation.
- `src/ui`: editor, history, diff, pipeline panels.
- `src/lib`: diff helper, export/import helpers.

Data model (MVP)
- Document: id, title, currentBranchId, branches.
- Branch: id, name, headRevisionId.
- Revision: id, parentId, createdAt, author("agent" or "user"), content, rationale, stage.

## Milestones
1. Scaffold repo + tooling + CI + checks.
2. Core editor + preview + persistence.
3. Agent pipeline + history + diff.
4. UX polish, a11y, docs.

## MVP checklist
- [ ] Create/open document
- [ ] Run pipeline stages offline
- [ ] Commit per stage with rationale
- [ ] View history and switch branches
- [ ] Diff two revisions
- [ ] Import/export JSON
- [ ] Tests pass (`make check`)

## Risks & mitigations
- History complexity: keep model minimal; avoid merge in MVP.
- Revision integrity: keep historical revisions immutable; edit via a working copy.
- Diff performance: only diff selected revisions.
- UX overload: progressive disclosure, clean layout.

## Security & privacy
- Local-only by default.
- No telemetry.
- Input sanitization for any HTML rendering in preview.
