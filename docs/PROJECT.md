# Project

## Commands
- setup: `npm install`
- dev: `npm run dev`
- test: `npm run test`
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
1. Real LLM provider adapter.
2. Merge with conflict resolution.
3. Export templates and themes.
