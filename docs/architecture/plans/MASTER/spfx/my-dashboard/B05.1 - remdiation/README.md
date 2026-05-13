# My Dashboard Live Auth / Personalization / Adobe OAuth Remediation Prompt Package

## Purpose
This package converts the repo-truth audit findings into focused, execution-ready prompts for a local code agent. The prompts are sequenced to remove diagnostic ambiguity first, then close the My Projects and Adobe Sign live-path gaps, then lock the package/test/evidence gates.

## Recommended Execution Order
1. `Prompt-01-Replace-Preview-Hero-With-Envelope-Derived-State.md`
2. `Prompt-02-Production-Data-Path-Proof-And-Fixture-Guardrails.md`
3. `Prompt-03-Adobe-Authorization-Required-CTA-Live-State-Closure.md`
4. `Prompt-04-My-Projects-Actor-And-Match-Diagnostics.md`
5. `Prompt-05-My-Projects-Role-Schema-Readiness-And-Provisioning-Evidence.md`
6. `Prompt-06-Package-Runtime-Deployment-Proof-And-Hosted-Evidence.md`
7. `Prompt-07-Regression-Test-Matrix-And-Closeout-Evidence.md`

## Cross-Prompt Rules
- Preserve current production security posture.
- Do not weaken OAuth state handling, redirect validation, token cipher behavior, or access-point allowlist logic.
- Do not reintroduce preview/mock content into production-labeled surfaces.
- Do not mutate tenant data unless a prompt explicitly asks for an operator-gated provisioning/evidence path.
- Keep docs and tests aligned with implemented changes.
- Produce commit-ready, validation-backed outcomes for each prompt.

## Central Audit Findings Driving This Package
- Preview hero copy remains hard-bound in production shell composition.
- Adobe queue rows visible in the hosted screenshot fingerprint fixture data.
- OAuth implementation exists, but the hosted state does not reach the CTA branch.
- My Projects matching depends on normalized UPNs plus schema/data readiness that is not yet tenant-proven.
- Current package builder is stronger than the hosted symptom suggests; stale artifact/runtime proof is required.
