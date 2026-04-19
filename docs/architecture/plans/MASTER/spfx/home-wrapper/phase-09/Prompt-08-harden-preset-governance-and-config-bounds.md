# Prompt 08 — Harden Preset Governance and Config Bounds

## Objective

Strengthen shell preset governance so the homepage can gain richer layout capability **without** degenerating into configuration sprawl or unsafe recipe combinations.

## Why this matters

The current shell is somewhat protected from layout chaos simply because the active vocabulary is narrow. Once richer recipes are added, weak preset governance becomes a major risk.

This prompt closes that gap now rather than after drift appears.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- any configuration ingestion path that can feed shell preset data

## Current implementation problem

The repo already has schema and validation seams, but the current grammar is limited enough that many future risks are simply not activated yet.

If recipe richness increases without stronger preset control, the homepage will become harder to reason about, harder to validate, and easier to misconfigure.

## Required implementation outcome

Strengthen preset governance so:
1. recipes are explicitly allow-listed,
2. slot-role and occupant compatibility is validated,
3. prohibited or unsafe combinations are rejected with diagnosable errors,
4. protected or shell-owned decisions cannot be casually bypassed,
5. and the default preset becomes a strong canonical example of the system rather than a minimal placeholder.

## Specific constraints / guardrails

- Do not introduce a free-form JSON playground mentality.
- Do not let runtime silently coerce invalid preset structures into “best effort” layouts.
- Prefer explicit validation failures or explicit governed fallback.
- Keep configuration readable enough for future maintenance.

## Proof of closure

Closure requires all of the following:
1. richer shell recipes are validated, not merely interpreted;
2. invalid preset combinations fail deterministically and diagnosably;
3. protected shell decisions remain enforceable;
4. the canonical preset demonstrates the intended target posture;
5. config flexibility remains bounded and understandable.


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
