# Prompt-02 — Phase 10 Accounting Packaging and Runtime Injection Closure

## Objective

Bring the Accounting SPFx packaging path fully into alignment with the current shared shell build/runtime injection model and prove that the packaged `.sppkg` artifact carries the intended production runtime wiring.

## Context

The audit found that the shipped Accounting shell artifact did not prove the current shell injection path for production-sensitive runtime config, even though the shared shell source and build orchestrator now support it.

## Working Rules

- Treat the live repo as the source of truth.
- Do not re-read files that are already in your active context or memory unless you need to verify a contradiction, confirm exact wording, or inspect a file you have not yet opened.
- Do not rely on stale phase documents when repo truth disagrees.
- Do not make assumptions about production readiness that are not evidenced in code, build artifacts, tests, or docs.
- Keep changes narrowly scoped to the objective of this prompt unless a directly dependent correction is required.
- When you change behavior, also update the governing docs and validation evidence that define or prove that behavior.
- Prefer additive, explicit, and test-backed changes over hidden fallbacks.
- If you discover that a requested change is already fully implemented in repo truth, do not re-implement it. Instead, document the repo truth, close the gap in the affected docs, and continue to the next unresolved item.

## Required Repo Focus

- `apps/accounting/config/package-solution.json`
- `apps/accounting/src/`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/gulpfile.js`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- any Accounting build scripts, package scripts, and release verification helpers


## Tasks

1. Audit the current Accounting build path end to end:
   - Vite output
   - shell asset copy step
   - DefinePlugin/runtime injection
   - packaged shell asset verification
2. Implement any missing Accounting-specific changes needed so the packaged shell asset can carry and expose:
   - `FUNCTION_APP_URL`
   - `API_AUDIENCE`
   - `ALLOW_BACKEND_MODE_SWITCH` if intentionally supported
   - any other runtime fields required by the final Accounting production contract
3. Ensure the packaging path does not rely on implicit fallbacks that hide missing production configuration.
4. Add or refine package-inspection verification so the build/release flow explicitly fails if the packaged shell asset does not contain the required injected values or references.
5. Perform a fresh Accounting `.sppkg` build from current repo truth.
6. Inspect the built `.sppkg` directly and record:
   - package metadata
   - shell web part asset name
   - Accounting app asset name
   - presence of required injected runtime references
   - absence of known stale fallback behavior where applicable
7. Update any build/readiness docs affected by the new packaging proof path.


## Deliverables

- updated packaging/runtime injection implementation if needed
- build-time/package-time validation for required Accounting runtime config
- a freshly rebuilt Accounting `.sppkg`
- a markdown artifact-inspection report proving the packaged shell asset contents


## Acceptance Criteria

- the Accounting `.sppkg` is rebuilt from current repo truth
- the packaged shell asset proves the intended runtime injection path
- missing required production config produces an actionable build/release failure instead of a silent fallback
- the new artifact-inspection report cites exact packaged evidence


## Output Format

Provide:
1. a concise implementation summary
2. the exact build command(s) run
3. the exact packaged-artifact findings
4. the files changed
5. the path to the new verification report

