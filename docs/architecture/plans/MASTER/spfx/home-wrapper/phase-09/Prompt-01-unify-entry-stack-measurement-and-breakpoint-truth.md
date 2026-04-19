# Prompt 01 — Unify Entry-Stack Measurement and Breakpoint Truth

## Objective

Create a **single authoritative entry-experience measurement and breakpoint system** for the HB Homepage so the launcher band and shell stop making partially separate responsive decisions.

## Why this matters

The current homepage is composed as one entry experience, but its responsive logic is still split between:
- shell container authority,
- and launcher-band container authority.

That is structurally weaker than it needs to be. It makes breakpoint drift easier, makes debugging harder, and weakens confidence that the utility band and shell are truly behaving as one system.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/zones/HbHomepageLauncherBand.tsx`
- any closely related shell/launcher helpers that classify widths, density, or visible-primary budgets

## Current implementation problem

The shell already has a real container-authority seam. The launcher band also measures its own container and resolves its own device/visibility behavior. That is directionally intelligent, but still too split.

The defect is not merely “duplicate measurement.”  
The defect is that **the homepage still lacks a single entry-level truth** for:
- authoritative usable width,
- entry state,
- short-height state,
- shell density posture,
- and launcher visibility budgeting.

## Required implementation outcome

Implement a shared entry-state seam that:
1. is established at the entry-stack level,
2. computes the authoritative measurement state once,
3. exposes that state through a shared hook/context or equivalently strong internal seam,
4. is consumed by both the shell and launcher band,
5. and becomes the only approved source for entry-state responsive classification.

This shared state must include, at minimum:
- authoritative outer width,
- shell-usable width,
- entry-state classification,
- short-height classification if applicable,
- shell inline inset totals or equivalent derived width budget inputs,
- and any launcher visible-count budgeting inputs that must align with shell density.

## Specific constraints / guardrails

- Preserve the wrapper vs shell ownership contract.
- Do not move placement authority out of the shell.
- Do not let the launcher band become a competing layout governor.
- Do not introduce magic-number breakpoints in multiple locations.
- Keep the resulting measurement seam inspectable and diagnosable.

## Proof of closure

Closure requires all of the following:
1. shell and launcher read from the same entry-state authority;
2. there is no second independent breakpoint classification path for the launcher;
3. diagnostics/data attributes or equivalent debug output clearly show the shared state;
4. the implementation proves that shell and launcher cannot silently drift into different entry-state assumptions;
5. tests or assertions cover representative width transitions.


## Explicit prohibition on unrelated changes

Do not:
- rewrite unrelated hosted application internals,
- alter backend or list-seeding code,
- redesign child modules for cosmetic reasons outside shell-fit requirements,
- or drift into adjacent applications that are not required for this shell closure unit.

## Local code-agent operating instruction

Do **not** re-read files that are already in your active context unless you need to verify drift, dependencies, uncertainty, or the impact of your changes after implementation.

## Required output from the local code agent

Return:
1. files changed,
2. exact structural changes made,
3. why those changes satisfy this prompt,
4. any risks or follow-up observations,
5. and concrete proof of closure against the criteria below.
