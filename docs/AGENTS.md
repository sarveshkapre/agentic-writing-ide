# AGENTS

## Purpose
Guidance for working in this repo as an automated or human agent.

## Canonical Contract
The canonical autonomous engineering contract lives in `AGENTS.md` at the repo root.
Keep these docs aligned with the contract, but avoid duplicating policy text to prevent drift.

## Guardrails
- Keep changes local-first and offline by default.
- No authentication or user accounts.
- Do not add telemetry.
- Prefer small, testable increments.

## Commands
- Setup: `npm install`
- Dev: `npm run dev`
- Tests: `npm run test`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Build: `npm run build`
- Gate: `npm run check`

## Conventions
- Use TypeScript, React, and CSS variables for styling.
- Keep UI fast, keyboard-friendly, and accessible.
- Preserve the agent pipeline semantics (draft -> critique -> revise -> polish).
