# Incidents

## 2026-02-02 — CI workflow parse failure (no jobs scheduled)
- Severity: high
- Impact: Pushes to `main` reported failed CI with zero runnable jobs, blocking trusted status checks.
- Detection:
  - GitHub Actions runs `21579381622`, `21579004301`, `21553547452`
- Root cause:
  - Invalid expression in `.github/workflows/ci.yml` for `dependency-review` event gating.
- Fix:
  - Quote `'pull_request'` literal in workflow condition.
- Prevention rules:
  - Keep `npm run lint:workflows` green before merge.
  - Run workflow lint in CI so parser regressions fail fast and explicitly.
- Evidence:
  - `.github/workflows/ci.yml`
  - `scripts/lint-workflows.sh`

## 2026-02-08 — Gitleaks push scan failure due to shallow checkout
- Severity: medium
- Impact: `gitleaks` job failed on push events (`ambiguous argument A^..B`) despite no secret leak findings.
- Detection:
  - GitHub Actions run `21807361590`
- Root cause:
  - Default shallow clone omitted commit range history required by gitleaks push scans.
- Fix:
  - Set `actions/checkout@v4` `fetch-depth: 0` for `gitleaks` job.
- Prevention rules:
  - Use full fetch depth for tools that diff commit ranges.
  - Validate CI updates with at least one push-triggered run after workflow changes.
- Evidence:
  - `.github/workflows/ci.yml`
  - GitHub Actions runs `21807361590`, `21807377279`

## 2026-02-09 — E2E smoke server binding mismatch (localhost vs 127.0.0.1)
- Severity: low
- Impact: Newly added E2E smoke automation failed by timing out while polling the preview server; risk of CI flake or false failures.
- Detection:
  - Local run of `npm run e2e:smoke` timed out waiting for `http://127.0.0.1:4173/` while `vite preview` reported `http://localhost:4173/`.
- Root cause:
  - `vite preview` bound to `localhost` only (often IPv6 `::1`), while the smoke script polled `127.0.0.1` (IPv4).
- Fix:
  - Run `vite preview` with `--host 127.0.0.1` in the smoke script.
- Prevention rules:
  - In automation, always bind local dev/preview servers to an explicit host and poll the same host.
  - Prefer `--strictPort` and deterministic URLs for smoke checks.
- Evidence:
  - `scripts/e2e-smoke.mjs`
