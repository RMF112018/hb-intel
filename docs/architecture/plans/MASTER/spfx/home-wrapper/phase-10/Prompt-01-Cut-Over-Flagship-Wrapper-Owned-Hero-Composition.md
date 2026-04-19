# Prompt 01 — Cut Over Flagship Wrapper-Owned Hero Composition

## Objective

Move the flagship homepage hero into `HbHomepageEntryStack` so the flagship runtime becomes a wrapper-owned three-stage entry stack: hero, launcher/actions, shell.

## Why this matters

The repo still treats the flagship hero as a separate page-authored webpart above the homepage app. Until that changes, the homepage is only pretending to be one entry experience.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- any directly adjacent wrapper-only helper needed for composition

## Current implementation problem

The current entry stack starts at the launcher/actions region. The hero is still outside the wrapper-owned runtime. That leaves the flagship page architecturally split and prevents unified first-screen ownership.

## Required implementation outcome

Implement a wrapper-owned hero region inside `HbHomepageEntryStack` and make the flagship homepage runtime read as:

1. wrapper-owned hero region
2. wrapper-owned launcher/actions region
3. shell region

Use the existing reusable hero surface rather than building a second flagship hero implementation. Preserve non-flagship/article-mode reuse, but stop treating separate standalone hero authoring as the flagship composition truth in runtime code.

## Specific constraints / guardrails

- Do **not** make the hero a shell occupant.
- Do **not** move shell responsibilities into the wrapper.
- Do **not** create a second flagship-only hero component unless there is a narrowly justified adapter reason.
- Do **not** widen this into a full homepage redesign.
- Preserve article-mode / non-flagship hero reuse.

## Proof of closure

Closure requires all of the following:

1. `HbHomepageEntryStack` renders hero, launcher/actions, then shell in that order.
2. The flagship hero is now wrapper-owned at runtime.
3. The shell remains post-entry only.
4. The implementation preserves reusable hero behavior for non-flagship contexts.
5. Region order is inspectable in code and, where appropriate, via runtime markers.

## Explicit prohibition on unrelated changes

Do not:
- redesign unrelated shell occupants,
- refactor unrelated homepage modules,
- alter backend or list-seeding work,
- or rewrite article-mode behavior beyond what is required to preserve reuse after the flagship cutover.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:

1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria above.
