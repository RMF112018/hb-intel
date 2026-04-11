# HB Kudos Public Webpart — Reaction Component Prompt Package

This package is limited to the **public-facing HB Kudos webpart reaction / like interaction**.

It is intentionally narrower than the broader public-webpart remediation package.

## Objective

Expose the intended reaction capability on the **public Kudos surface itself** in a production-ready, ownership-correct way.

Repo-truth indicates that the reaction model already exists in the codebase:
- the data model carries `CelebrateCount`
- the governance writer supports a `celebrate` patch/write
- the detail-panel path already executes the celebrate action
- the public shared surface can render celebrate-related UI signals
- but the public webpart does **not** currently surface an obvious interactive reaction control on the primary display element

## This package covers

- public-surface reaction affordance design
- shared surface interaction seam changes
- wiring the public webpart to execute celebrate actions
- count/state display behavior
- validation in SharePoint-hosted runtime

## This package does not cover

- flyout remediation
- archive/search density work except where the reaction control materially affects the public display
- companion moderation workflows
- broad visual redesign unrelated to reaction exposure

## Mandatory repo scope

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`

## Ownership rule

The missing reaction is primarily a **public-surface interaction seam** problem, not a missing persistence problem.

- shared reaction affordance belongs in the shared public surface
- public action dispatch belongs in `HbKudos.tsx`
- count persistence remains in the existing governance writer path
- any local-only one-off button jammed into the webpart is not acceptable as the durable fix
