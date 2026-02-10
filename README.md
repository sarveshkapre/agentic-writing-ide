# Agentic Writing IDE

Local-first writing IDE with an agent revision pipeline and branchable history.

Runs a draft through a multi-stage pipeline (draft → critique → revise → polish) with diffs and rationales, and works offline.

## Features
- Document editor with live markdown preview.
- Agent pipeline that creates revisions with rationale (optional local LLM via Ollama, or stub).
- Branchable revision history with filters and three-way merge preview/resolution.
- Inline or side-by-side diffs.
- Multi-document library (create/switch/rename/delete) with local persistence.
- Revision labels (named versions) for milestones and filtering.
- Focus mode + typewriter mode toggles for distraction-free drafting.
- Local persistence with JSON import/export.
- Export to HTML and PDF with selectable export themes.

## Quickstart
```bash
npm install
npm run dev
```

## Quality gate
```bash
npm run check
npm run lint:workflows
npm run e2e:smoke
```

## Keyboard shortcuts
- Cmd/Ctrl + 1-4: run pipeline stages
- Cmd/Ctrl + S: commit edit
- Cmd/Ctrl + F: search
- Cmd/Ctrl + Shift + E: export JSON
- Cmd/Ctrl + Shift + H: export HTML
- Cmd/Ctrl + Shift + P: print/PDF
- Cmd/Ctrl + Shift + O: generate outline
- Cmd/Ctrl + Shift + F: focus mode
- Cmd/Ctrl + Shift + T: typewriter mode
- Cmd/Ctrl + /: show shortcuts

## Docker
```bash
docker build -t agentic-writing-ide .
docker run -p 8080:80 agentic-writing-ide
```

## Screenshots
Add screenshots or a short GIF once the UI is stable.
