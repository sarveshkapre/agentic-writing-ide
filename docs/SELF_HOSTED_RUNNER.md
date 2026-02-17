# Self-Hosted GitHub Actions Runner

This repository is configured to run CI on `self-hosted` runners only.

## Runner prerequisites

Recommended platform:
- Linux x64 (Ubuntu 22.04+)

Also supported:
- macOS 13+

Required tools:
- `git`
- `bash`
- Node.js `20.x` + `npm`
- Go `1.22+` (required by `npm run lint:workflows` and gitleaks install)
- `curl`, `tar`, `unzip`

Browser/E2E requirements:
- Playwright Chromium is installed by CI (`npx playwright install chromium`)
- Linux runners must have Chromium runtime libraries installed ahead of time.
  - Example: run once as admin: `npx playwright install --with-deps chromium`

Network requirements:
- Outbound HTTPS access to:
  - `github.com`
  - `api.github.com`
  - `objects.githubusercontent.com`
  - `npmjs.org` / registry mirrors
  - CodeQL package endpoints used by `github/codeql-action`

## Register a self-hosted runner for this repository

1. Open GitHub repository settings:
   - `Settings` -> `Actions` -> `Runners`
2. Click `New self-hosted runner`.
3. Choose your OS/architecture.
4. On the runner machine, execute the generated commands from GitHub:
   - Create runner directory
   - Download runner package
   - Extract package
   - Configure runner with repo URL and token
5. Install and start as a service:
   - Linux: `sudo ./svc.sh install && sudo ./svc.sh start`
   - macOS: `./svc.sh install && ./svc.sh start`
6. Confirm the runner appears as `Idle` in:
   - `Settings` -> `Actions` -> `Runners`

## Local end-to-end validation before attaching runner

Run this in the repo root on the runner machine:

```bash
npm install
npm run lint:workflows
npm run check
npm run build
npx playwright install chromium
npm run e2e:smoke
GOBIN="$(pwd)/.tmp/bin" go install github.com/zricethezav/gitleaks/v8@v8.28.0
"$(pwd)/.tmp/bin/gitleaks" git --redact --no-banner --verbose
```

If all commands pass, the machine satisfies the CI workflow requirements for this repository.
