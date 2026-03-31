# Prompt 10 — Phase 6 Deployment Target Cutover and Environment Proof

## Objective
Close the deployment-truth gap by proving or wiring the actual Project Setup deployment target, and by making environment-gated auth/infrastructure/runtime evidence explicit and decision-useful.

## Required work
1. Re-audit repo truth for the actual intended deployment artifact:
   - dedicated Project Setup host
   - preserved monolithic host
   - release/runbook references
2. Close the “cutover truth” gap:
   - prove the dedicated host is the intended release target in repo artifacts, or
   - explicitly document that cutover is not yet complete.
3. Close or truthfully classify environment-gated prerequisites for:
   - production auth audience and app-registration posture
   - CORS
   - managed identity grants
   - downstream Graph / SharePoint permissions
   - SharePoint-connected-service prerequisites
4. Add or tighten release artifacts so the deployment boundary is no longer ambiguous.
5. Make the retained Project Setup host’s runtime contract explicit and auditable.

## Critical instructions
- Do not claim environment completion if repo cannot prove it.
- For environment-gated items, build the strongest truthful repo-side evidence package possible:
   - checklists
   - verification scripts
   - release gates
   - manifest docs
   - required evidence tables
- Distinguish between:
   - repo-configured
   - repo-verified
   - environment-applied
   - not yet proven

## Required documentation updates
Update:
- `docs/architecture/reviews/project-setup-phase-1-through-5-implementation-and-gap-report.md`

Add/update:
- Phase 1 dedicated-host cutover proof note
- Phase 3 production auth prerequisite note
- Phase 4 deployment-scoped CORS / managed identity / downstream-permission note
- explicit closure or residual-status language for environment proof items

## Acceptance criteria
- Deployment-target posture is explicit.
- Dedicated-host cutover is either proven or truthfully still open.
- Environment-gated auth/infrastructure prerequisites are categorized clearly.
- The review report reflects repo truth instead of ambiguous deployment assumptions.
