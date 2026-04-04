# 01B — Lane Assignment Decision Record

## Decision Scope

This record locks lane decisions for Prompt 01 of the HB Central homepage webpart program and governs Prompts 02–10 unless superseded by an explicit architecture decision.

## Locked Decisions

### D1 — First-release default lane

All ten first-release components run as **lightweight standalone SPFx homepage webparts**.  
No first-release component is approved as a routed mini-app by default.

### D2 — No routed mini-app behavior in v1

Homepage components may not introduce shell recreation, internal route trees, or app-island interaction models as part of first-release scope.

### D3 — Package naming guard

When the implementation package is scaffolded, the package name must be exactly `hb-webparts` and must not use homepage-labeled package names.

### D4 — Homepage-safe UI consumption

Prompt 02 must enforce constrained `@hbc/ui-kit` usage for homepage surfaces (narrow entry points and homepage-safe primitives only).

## Exception Policy

An exception to the lightweight lane is allowed only when all conditions below are met:

1. Documented user requirement cannot be satisfied by standalone webpart composition.
2. The proposed exception includes performance, accessibility, and authoring impact assessment.
3. The proposal identifies why SharePoint-native composition is insufficient.
4. The exception is recorded in program docs before implementation of the exception.
5. Approval is granted by platform architecture + implementation owner for this prompt stream.

If any condition is not satisfied, the exception is rejected and the component remains in the default lightweight lane.

## Packaging Ambiguity Resolution

- Current repo truth does **not** yet include a scaffolded `hb-webparts` SPFx package/manifest target.
- Therefore Prompt-01 closure records manifest patch-bump as **deferred** until the package is created by downstream implementation prompts.
- This deferment is explicit and intentional; it is not an unresolved open item.

## Prompt-01 Closure Check

- Default lane is locked and explicit.
- No component remains lane-ambiguous.
- Exception process is documented and approval-gated.
- Packaging ambiguity outcome is recorded with a deterministic next trigger (hb-webparts scaffold creation).
