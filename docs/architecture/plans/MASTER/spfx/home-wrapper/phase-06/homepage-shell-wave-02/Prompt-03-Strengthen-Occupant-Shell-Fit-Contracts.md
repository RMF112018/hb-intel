# Prompt 03 — Strengthen Occupant Shell-Fit Contracts

## Objective

Upgrade occupant-level shell-fit metadata and contracts so future layout governance can make stronger decisions without redesigning child modules.

## Governing authorities

- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`

## Exact files / seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- zone wrappers under `apps/hb-webparts/src/webparts/hbHomepage/zones/`
- any module-facing contracts that could safely expose compact / collapsed / shell-fit state

Do not re-read files still in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required implementation outcome

- refine occupant shell-fit metadata where currently too coarse
- distinguish true compact-capable occupants from full-width-only occupants
- improve future readiness for reordering, pairing, and optional visibility without touching child visual internals

## Proof of closure

Provide:
- updated shell-fit descriptor model
- how the shell uses the stronger metadata
- files changed
- tests added or updated
