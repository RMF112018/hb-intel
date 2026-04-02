# Prompt-06 — Phase 5 Operator Entry Points and Context Handoff

## Objective

Implement the **operator entry-point and context handoff** improvements needed so the new operator-console shell can receive inbound context cleanly and external surfaces can link into it reliably.

This prompt should address the navigation and deep-link quality issues that matter for the operator console.

## Important execution rules

- Do not re-read files still in active context unless needed.
- Focus on route/context correctness.
- Do not turn this into a later-phase backend workflow prompt.

## Inputs

Use:
- current Admin routes and search handling
- `ProvisioningOversightPage`
- relevant Accounting / Estimating cross-app handoff code
- the existing Phase 5 review docs in `docs/architecture/reviews/`

## Required work

### A. Fix inbound route-context handling
Where the Admin app receives inbound query/search context, use the router’s intended search contract cleanly.
Avoid manual URL parsing if the route layer already validates search input.

### B. Fix cross-app deep links into Admin
Repair any stale or incorrect routes that external apps still use.

### C. Improve run selection/context resolution
If multiple runs for one project can exist, implement the Phase 5-appropriate behavior for selecting the right run when inbound context is limited.

### D. Add operator entry-point posture
Where useful, add operator-facing entry cards / command links / lane links that make the new shell easier to enter and use without inventing later-phase execution behavior.

## Required guardrails

- Do not create a fragile coupling across apps.
- Prefer stable route contracts.
- Do not overfit the deep-link contract to a single page that may evolve later.
- If a compatibility alias is the best short-term answer, document it.

## Validation

Before finishing:
- verify inbound Admin links land on valid routes,
- verify selected context behavior works for at least the current provisioning use case,
- verify no existing cross-app path points to a dead route after this prompt,
- verify route/search behavior is typed and intentional.

## Completion condition

Stop when inbound context and cross-app handoff are coherent with the new operator-console shell.
Do not yet do the final doc reconciliation here.
