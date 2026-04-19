# Prompt 03 — Add Hosted-Surface Shell-Fit Contracts

## Objective

Formalize a **hosted-surface shell-fit contract** for homepage occupants so the shell can make layout decisions using trustworthy declarations instead of width guidance alone.

## Why this matters

A modular homepage shell is only as strong as its knowledge of the modules it is placing.

Right now, the registry carries useful metadata, but it does not fully express:
- which nested modes a hosted surface supports,
- what its narrowest stable shell mode is,
- whether it can safely participate in paired or compact layouts,
- and what fallback behavior is required when fit is unsafe.

Without that, the shell is more speculative than it should be.

## Exact repo seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/firstLaneResolver.ts`
- any zone wrapper or occupant-adapter seams that can safely receive shell-fit mode hints

## Current implementation problem

The registry encodes width preferences and some eligibility rules, but compact/summary-collapse behavior is effectively dormant. That leaves the shell with insufficiently explicit fit intelligence.

The result is a shell that can govern placement, but cannot yet govern **nested adaptability** strongly enough.

## Required implementation outcome

Add an explicit shell-fit contract per occupant that covers, at minimum:
- narrowest stable shell width,
- supported nested render modes,
- paired-layout participation eligibility,
- compact-mode or summary-mode support where applicable,
- fallback or stack-forcing conditions,
- and any protected constraints the shell must honor.

Then update shell resolvers to use that contract in a first-class way.

## Specific constraints / guardrails

- Do not rewrite hosted application internals beyond what is strictly required to honor shell-fit modes.
- Do not fake support for compact or paired modes if a module cannot sustain them.
- Keep the shell as the deciding authority; hosted modules declare capabilities, not placement.
- Prefer a small, honest set of modes over an inflated capability matrix.

## Proof of closure

Closure requires all of the following:
1. each active homepage occupant exposes an explicit shell-fit declaration;
2. the shell uses those declarations during layout resolution;
3. unsupported fit states no longer rely on guesswork;
4. diagnostics can explain why an occupant was paired, stacked, compacted, or denied a recipe;
5. there is at least one demonstrable case where the new contract meaningfully improves shell decision quality.


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
