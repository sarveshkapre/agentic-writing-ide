# Incidents

## 2026-02-11 — E2E smoke locator race after selector migration
- Severity: low
- Impact: Local `npm run e2e:smoke` failed once with a timeout while reading the editor value; risk of flaky CI if left unresolved.
- Detection:
  - Local run reported `locator.inputValue: Timeout 30000ms exceeded` for `getByTestId("editor-input")`.
- Root cause:
  - The script attempted `inputValue()` immediately after page load without explicitly waiting for the editor locator readiness after switching to `data-testid` selectors.
- Fix:
  - Added `await editor.waitFor()` before reading input value in `scripts/e2e-smoke.mjs`.
- Prevention rules:
  - After migrating selectors in browser automation, explicitly wait for critical locators before interaction/value reads.
  - Keep at least one rerun of smoke automation in-session whenever selector strategy changes.
- Evidence:
  - `scripts/e2e-smoke.mjs`
  - `npm run e2e:smoke` (fail then pass after fix)

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

### 2026-02-12T20:01:20Z | Codex execution failure
- Date: 2026-02-12T20:01:20Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-2.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:04:48Z | Codex execution failure
- Date: 2026-02-12T20:04:48Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-3.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:08:16Z | Codex execution failure
- Date: 2026-02-12T20:08:16Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-4.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:11:43Z | Codex execution failure
- Date: 2026-02-12T20:11:43Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-5.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:15:13Z | Codex execution failure
- Date: 2026-02-12T20:15:13Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-6.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:18:45Z | Codex execution failure
- Date: 2026-02-12T20:18:45Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-7.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:22:10Z | Codex execution failure
- Date: 2026-02-12T20:22:10Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-8.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:25:39Z | Codex execution failure
- Date: 2026-02-12T20:25:39Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-9.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:29:18Z | Codex execution failure
- Date: 2026-02-12T20:29:18Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-10.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:32:48Z | Codex execution failure
- Date: 2026-02-12T20:32:48Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-11.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:36:15Z | Codex execution failure
- Date: 2026-02-12T20:36:15Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-12.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:39:45Z | Codex execution failure
- Date: 2026-02-12T20:39:45Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-13.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:43:12Z | Codex execution failure
- Date: 2026-02-12T20:43:12Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-14.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:46:47Z | Codex execution failure
- Date: 2026-02-12T20:46:47Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-15.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:50:15Z | Codex execution failure
- Date: 2026-02-12T20:50:15Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-16.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:53:47Z | Codex execution failure
- Date: 2026-02-12T20:53:47Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-17.log
- Commit: pending
- Confidence: medium

### 2026-02-12T20:57:21Z | Codex execution failure
- Date: 2026-02-12T20:57:21Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-18.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:00:48Z | Codex execution failure
- Date: 2026-02-12T21:00:48Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-19.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:04:15Z | Codex execution failure
- Date: 2026-02-12T21:04:15Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-20.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:07:48Z | Codex execution failure
- Date: 2026-02-12T21:07:48Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-21.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:11:18Z | Codex execution failure
- Date: 2026-02-12T21:11:18Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-22.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:14:50Z | Codex execution failure
- Date: 2026-02-12T21:14:50Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-23.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:18:20Z | Codex execution failure
- Date: 2026-02-12T21:18:20Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-24.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:21:39Z | Codex execution failure
- Date: 2026-02-12T21:21:39Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-25.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:24:52Z | Codex execution failure
- Date: 2026-02-12T21:24:52Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-26.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:28:15Z | Codex execution failure
- Date: 2026-02-12T21:28:15Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-27.log
- Commit: pending
- Confidence: medium

### 2026-02-12T21:31:34Z | Codex execution failure
- Date: 2026-02-12T21:31:34Z
- Trigger: Codex execution failure
- Impact: Repo session did not complete cleanly
- Root Cause: codex exec returned a non-zero status
- Fix: Captured failure logs and kept repository in a recoverable state
- Prevention Rule: Re-run with same pass context and inspect pass log before retrying
- Evidence: pass_log=logs/20260212-101456-agentic-writing-ide-cycle-28.log
- Commit: pending
- Confidence: medium
