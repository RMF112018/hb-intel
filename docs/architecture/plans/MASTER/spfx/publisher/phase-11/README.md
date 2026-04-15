# Enhanced Publisher Remediation Prompt Package

This package replaces the earlier publisher remediation prompt package after a narrowed, repo-truth audit against the live `main` branch of `RMF112018/hb-intel`.

## Primary surface
- `apps/hb-publisher/`

## What changed from the original package
The original package contained six prompts. After auditing those prompts against the current repo state:

- three prompts were removed because the underlying issues are already closed on `main`
- three prompts were retained but rewritten substantially
- one new closure-proof prompt was added

Read `00-Audit-Reconciliation.md` first so the local code agent understands why the package changed.

## Execution order
Run the prompts in numeric order:

1. `Prompt-01-Make-first-persistence-and-save-readiness-truthful.md`
2. `Prompt-02-Add-authoring-health-preflight-for-template-registry-and-bootstrap.md`
3. `Prompt-03-Make-promotion-rule-health-fail-truthful.md`
4. `Prompt-04-Prove-closure-with-regression-build-and-reporting.md`

## Mandatory execution posture
For every prompt in this package, the local code agent must:

- work from the live local `hb-intel` repo, not stale plan assumptions
- treat repo truth as final authority over prior package wording
- scrub the named seams exhaustively before changing anything
- avoid unrelated refactors
- preserve the currently supported Project Spotlight path
- not reopen already-closed `companyPulse`, `milestoneSpotlight`, or `scheduled` work unless fresh repo truth proves a regression
- prove closure before moving to the next prompt
- not re-read files that are already in active context unless needed to confirm drift, dependencies, or uncertainty after changes

## Closure standard
This is a no-deferral package.

If a defect is in scope here, it must be closed now:
- code
- gating
- messaging
- tests
- regression proof
- closure notes
