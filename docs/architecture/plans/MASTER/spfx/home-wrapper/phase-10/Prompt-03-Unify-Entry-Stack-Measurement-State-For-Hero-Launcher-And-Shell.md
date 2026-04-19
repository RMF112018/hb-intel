# Prompt 03 — Unify Entry-Stack Measurement State for Hero, Launcher, and Shell

## Objective

Make hero, launcher, and shell consume the same wrapper-owned entry-stack measurement and entry-state truth.

## Why this matters

The launcher band already consumes shared entry-state truth from the wrapper. The shell obviously does too. If the hero remains outside that same state model, the flagship entry stack is still only partially unified.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/entryStackPolicy.ts`
- `apps/hb-webparts/src/homepage/entryStack/entryStackContract.ts`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHero.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- any small shared adapter/helper required to hand hero a stable entry-state payload

## Current implementation problem

The repo already has authoritative width accounting, short-height classification, and shared snapshot helpers. The hero is the main entry-stage surface that is not yet downstream of that shared truth.

## Required implementation outcome

Extend or adapt the existing measurement/state seam so the hero receives the same authoritative entry-stack state that the launcher band and shell use.

That state must cover, at minimum:
- authoritative width,
- usable width where relevant,
- entry-state id,
- entry-state reason,
- short-height constrained boolean,
- and any derived budget or layout-mode inputs the hero must honor.

Prefer extending the current seam rather than creating a parallel responsive state system.

## Specific constraints / guardrails

- Do **not** create a second breakpoint vocabulary for the hero.
- Do **not** let the hero compute independent flagship state using unrelated viewport rules.
- Do **not** break the launcher band’s existing shared-state path.
- Do **not** widen this into a new global state framework.

## Proof of closure

Closure requires all of the following:

1. Hero, launcher, and shell read from the same entry-stack authority.
2. There is no separate flagship hero breakpoint classification path that can silently drift.
3. Shared state is inspectable through runtime markers or equivalent diagnostics.
4. Existing policy seams remain the source of truth for entry-state and budget logic.
5. Focused tests or assertions cover representative width/height transitions.

## Explicit prohibition on unrelated changes

Do not:
- redesign unrelated launcher visuals,
- change shell occupant internals,
- introduce a new state library,
- or broaden the work beyond shared entry-stack truth.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:

1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria above.
