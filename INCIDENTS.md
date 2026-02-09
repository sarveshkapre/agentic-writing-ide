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
