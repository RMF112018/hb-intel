# Prompt 01 — Authority and Repo-Truth Lock for HB Homepage

You are working in the live local HB Intel repo.

## Objective

Produce a repo-truth authority lock and implementation baseline for the new `hb-homepage` SPFx orchestrator that will wrap selected `apps/hb-webparts` public homepage modules while leaving `hbSignatureHero` independent.

This prompt is not for implementation yet.
This prompt is for authoritative scoping, repo mapping, and constraints locking.

## Critical operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory governing authority

Treat the following as binding authority:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

The repo source of truth is the live `main` branch.

## Locked implementation target

A new `hb-homepage` webpart will become the single composed homepage wrapper for:

- `HbKudos`
- `LeadershipMessage`
- `ProjectPortfolioSpotlight`
- `PeopleCulturePublic`
- `CompanyPulse`

`hbSignatureHero` remains independent and must not be absorbed.

## Required repo-truth investigation

Audit and summarize the exact current seams that will govern implementation, including at minimum:

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/`
- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/webparts/leadershipMessage/`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/`
- `apps/hb-webparts/src/webparts/companyPulse/`
- manifest patterns under `apps/hb-webparts/src/webparts/`
- `tools/build-spfx-package.ts`

## Required output

Create a closure note at:

`docs/architecture/plans/MASTER/spfx/homepage/hb-homepage/phase-01/01-Authority-and-Repo-Truth-Lock.md`

The note must include:

1. objective restatement
2. governing authority
3. actual files and seams audited
4. current mount/runtime truth
5. current packaging truth
6. which target modules are low / medium / high integration effort
7. risks that must shape the implementation sequence
8. explicit lock that `hb-homepage` is the new composed wrapper and `hbSignatureHero` remains independent
9. recommended next-step scope for Prompt 02 only

## Constraints

- Do not implement `hb-homepage` yet
- Do not refactor existing modules yet
- Do not edit packaging yet
- Do not broaden scope beyond repo-truth locking and documentation

## Completion standard

This prompt is only complete when the closure note exists, is grounded in live repo truth, and can be used as the controlling baseline for the rest of the package.
