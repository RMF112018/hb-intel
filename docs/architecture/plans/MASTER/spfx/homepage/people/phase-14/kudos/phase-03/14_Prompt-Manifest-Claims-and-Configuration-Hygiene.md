# Prompt — Manifest Claims and Configuration Hygiene

## Objective
Correct any manifest descriptions, defaults, and configuration claims that currently overstate runtime completion or obscure operational requirements in the HB Kudos surfaces.

## Repo truth
Work directly against the live repo:
- `https://github.com/RMF112018/hb-intel`

Do not re-read files that are already in your current context or memory.

## Governing authority
Use repo truth and at minimum:
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- current live `@hbc/ui-kit`
- current live `docs/reference/ui-kit/`


## Scope
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- related runtime/config docs and comments

## Non-negotiable requirements
- Do not leave manifests claiming completion beyond what runtime actually supports.
- Do not rely on blank default group fields without clear operator consequences.
- Align titles, descriptions, defaults, and runtime truth.

## Guardrails
- Repo truth first.
- Do not accept comments, manifest descriptions, or stale reports as proof by themselves.
- Do not leave “writer support exists” as a substitute for a runtime-complete workflow.
- Do not preserve weak bespoke local UI where shared homepage-safe promotion is warranted.
- Do not claim closure unless code, runtime behavior, tests, and documentation align.

## Required outputs
- manifest updates
- doc/comment updates aligned to runtime truth

## Verification
- show exact overclaims corrected
- prove defaults and operator expectations are now explicit and accurate
