# Prompt 06 — Improve Ultrawide Width Use and Shell Density

## Objective

Rework large-surface homepage density so the shell uses width more confidently and no longer presents as a narrow, overly centered composition on large desktop surfaces.

## Why this matters

The current screenshots show a homepage that still looks too cautious for the available host surface. The result is a visual posture that undersells the architecture behind it.

This is not a request to bloat the UI. It is a request to correct the current underuse of width and underpowered compositional rhythm.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- any related recipe or density helpers introduced by earlier prompts

## Current implementation problem

Even with container-aware shell behavior, the live rendered result still exhibits:
- timid width consumption,
- over-centered composition,
- excessive unused horizontal space,
- and insufficiently varied lane density.

## Required implementation outcome

Tune the entry stack and shell so that:
1. large desktop widths are used more assertively,
2. the default homepage feels intentionally laid out for widescreen use,
3. asymmetry and density improve where supported by shell recipes,
4. and constrained hosts still fall back cleanly.

This likely requires coordinated adjustment across:
- outer envelope strategy,
- shell insets,
- recipe behavior by entry state,
- and large-screen defaults.

## Specific constraints / guardrails

- Do not solve this by manually widening child cards inside hosted modules.
- Do not introduce horizontal scrolling for ordinary content.
- Do not chase visual excess or unstable masonry behavior.
- Respect reflow and constrained-host safety at all times.

## Proof of closure

Closure requires all of the following:
1. large desktop renders no longer read as timid or overly centered;
2. width usage is materially stronger than the current screenshots;
3. the shell remains stable at standard laptop and tablet breakpoints;
4. no horizontal overflow is introduced;
5. the improvement is achieved through shell/entry-stack governance, not ad hoc child CSS edits.


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
