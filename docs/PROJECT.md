# Project

## Commands
- setup: `npm install`
- dev: `npm run dev`
- test: `npm run test`
- e2e smoke: `npm run e2e:smoke` (first-time: `npx playwright install chromium`)
- lint: `npm run lint`
- lint workflows: `npm run lint:workflows`
- typecheck: `npm run typecheck`
- build: `npm run build`
- check: `npm run check`
- release: `npm run build`

## Architecture summary
- `src/state`: app state and persistence helpers.
- `src/agents`: offline pipeline stages and LLM stub.
- `src/ui`: UI components.
- `src/lib`: shared utilities (diff, ids, markdown).

## Next 3 improvements
1. Improve three-way merge alignment to reduce false-positive conflicts on large inserts/moves.
2. Document-wide search (working copy + revisions) with jump-to-result.
3. Local comments/annotations tied to revision ranges.
