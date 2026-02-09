# Agentic Writing IDE

Local-first writing IDE with an agent revision pipeline and branchable history.

Runs a draft through a multi-stage pipeline (draft → critique → revise → polish) with diffs and rationales, and works offline.

## Features
- Document editor with live markdown preview.
- Agent pipeline that creates revisions with rationale (optional local LLM via Ollama, or stub).
- Branchable revision history with filters and three-way merge preview/resolution.
- Inline or side-by-side diffs.
- Local persistence with JSON import/export.
- Export to HTML and PDF.

## Quickstart
```bash
npm install
npm run dev
```

## Quality gate
```bash
npm run check
npm run lint:workflows
```

## Keyboard shortcuts
- Cmd/Ctrl + 1-4: run pipeline stages
- Cmd/Ctrl + S: commit edit
- Cmd/Ctrl + Shift + E: export JSON
- Cmd/Ctrl + Shift + H: export HTML
- Cmd/Ctrl + Shift + P: print/PDF

## Docker
```bash
docker build -t agentic-writing-ide .
docker run -p 8080:80 agentic-writing-ide
```

## Screenshots
Add screenshots or a short GIF once the UI is stable.
