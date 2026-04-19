# Prompt 05 — Align Launcher Band with Shell Governance

## Objective

Bring the launcher band fully under the same homepage shell governance posture so it behaves as an intentional part of the entry experience, not a separately clever utility strip.

## Why this matters

The launcher band already does meaningful work:
- visibility budgeting,
- overflow partitioning,
- device-class behavior.

That is a strength.

But the homepage needs more than launcher competence. It needs **launcher-shell coherence**. The utility band must make decisions that are aligned with the same entry-state truth, density posture, and composition intent as the shell.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/zones/HbHomepageLauncherBand.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`
- any launcher device / primary-visible-count helper seams
- the shared entry-state seam created in Prompt 01

## Current implementation problem

The launcher band is structurally adjacent to the shell, but still not governed strongly enough as part of one system. It needs:
- shared width truth,
- shared density understanding,
- and clearer proof that its visible-primary behavior remains compatible with shell composition.

## Required implementation outcome

Update launcher behavior so it:
1. consumes the shared entry-state seam,
2. aligns visible-primary / overflow behavior to shell density expectations,
3. exposes diagnostics that make launcher-shell alignment inspectable,
4. and behaves consistently across width transitions and constrained host states.

## Specific constraints / guardrails

- Do not let the launcher band define its own independent breakpoint universe.
- Do not collapse the launcher into the shell renderer if that would blur ownership.
- Preserve launcher-specific overflow behavior where it is useful.
- Keep wrapper-level composition intact.

## Proof of closure

Closure requires all of the following:
1. launcher state derives from shared entry-state authority;
2. launcher diagnostics expose its alignment with shell state;
3. visible-primary behavior is stable across width transitions;
4. overflow behavior is not brittle under reduced width or short-height conditions;
5. launcher and shell can be validated together as one entry experience.


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
