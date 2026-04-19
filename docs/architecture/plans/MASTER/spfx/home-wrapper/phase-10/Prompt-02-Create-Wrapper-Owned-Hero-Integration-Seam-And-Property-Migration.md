# Prompt 02 — Create Wrapper-Owned Hero Integration Seam and Property Migration

## Objective

Create a typed wrapper-owned hero integration seam in the homepage wrapper contract and migrate any homepage-specific hero inputs into it cleanly.

## Why this matters

The wrapper already has a typed integration seam for the embedded launcher band. The hero now needs the same level of ownership clarity. Otherwise the flagship cutover will be held together by loose config reads and boundary drift.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- any homepage webpart property / config seam directly required to feed wrapper-owned hero behavior

## Current implementation problem

There is no wrapper-owned hero seam today. The existing contract assumes the wrapper starts after the hero. If hero inputs are threaded into `HbHomepage` informally, the ownership model will become ambiguous immediately.

## Required implementation outcome

Introduce a typed wrapper-facing hero config/input seam that covers the flagship homepage path. At minimum, support the minimal set of wrapper-owned hero inputs needed for:
- enable/disable behavior where appropriate,
- background image or authored asset flow if still relevant,
- any homepage-only hero integration inputs,
- and future-safe wrapper ownership language.

Thread those inputs through the wrapper explicitly rather than reading them ad hoc from untyped config inside the hero.

## Specific constraints / guardrails

- Do **not** leak hero semantics into shell module config slices.
- Do **not** turn shell presets into hero-config carriers.
- Do **not** create a broad new authoring system if a bounded wrapper pass-through seam is enough.
- Keep comments and type names explicit about wrapper ownership.

## Proof of closure

Closure requires all of the following:

1. Wrapper-owned hero inputs are typed and explicit.
2. `hbHomepageWrapperConfig.ts` or an equivalently bounded wrapper seam now owns flagship hero integration inputs.
3. Shell config remains shell-semantic.
4. The hero is no longer relying on loose, ambiguous homepage config plumbing for the flagship path.
5. Contract comments make the boundary clear to a future reviewer.

## Explicit prohibition on unrelated changes

Do not:
- widen this into a CMS redesign,
- add unrelated property-pane work,
- redesign shell presets,
- or rewrite unrelated hero/article contracts beyond what is required for clean flagship wrapper integration.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:

1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria above.
