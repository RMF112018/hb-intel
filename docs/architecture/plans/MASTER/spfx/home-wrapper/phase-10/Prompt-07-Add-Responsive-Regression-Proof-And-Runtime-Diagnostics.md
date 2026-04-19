# Prompt 07 — Add Responsive Regression Proof and Runtime Diagnostics

## Objective

Add closure-grade tests, runtime markers, and verification hooks that prove the unified hero-in-homepage implementation behaves correctly across the required width/height matrix.

## Why this matters

This work fails if it only looks good on one monitor. The repo already has useful policy tests and diagnostics patterns. The unified hero path must now be brought under the same proof discipline.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/*`
- any existing homepage/entry-stack/hero tests or harnesses
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- any focused runtime marker or helper seam needed for inspectable proof

## Current implementation problem

The repo has policy-level tests, but not yet a full closure-grade proof surface for the future unified hero path. There is insufficient enforceable proof today for:
- one hero only,
- entry-stack region order,
- shared entry-state alignment,
- no overflow,
- and the required display-state matrix.

## Required implementation outcome

Add the minimum viable regression and diagnostic surface needed to prove the real issue is closed.

Validate, at minimum:
- 1920×1080
- 1512×982
- 1366×1024
- 430×992
- 390×844
- short-height constrained state

Add or update:
- focused tests/assertions,
- runtime data attributes/markers,
- and any small validation helper seams needed for black-box proof.

## Specific constraints / guardrails

- Do **not** add fake proof.
- Do **not** rely on desktop-only inspection.
- Do **not** add generic filler tests unrelated to the actual closure risk.
- Keep diagnostics stable and inspectable, not noisy.

## Proof of closure

Closure requires all of the following:

1. Region ordering is provable.
2. Hero, launcher, and shell shared-state alignment is provable.
3. No ordinary horizontal overflow is explicitly checked or otherwise strongly evidenced.
4. The required display/state matrix is explicitly validated.
5. One-hero-only flagship behavior is explicitly validated where applicable.
6. The first shell lane still begins on first view.

## Explicit prohibition on unrelated changes

Do not:
- widen this into a test-suite overhaul,
- redesign unrelated tooling,
- or skip hosted-oriented proof just because local preview seems acceptable.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:

1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria above.
