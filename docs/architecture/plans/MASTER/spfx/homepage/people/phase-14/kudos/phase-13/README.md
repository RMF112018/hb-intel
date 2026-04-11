# HB Kudos — Public Webpart Only Remediation Prompt Package

This package is limited to the **public-facing primary HB Kudos display webpart**.

It does **not** cover:
- the Give Kudos flyout
- the HR/companion moderation app
- SharePoint host footer-button accommodation for the flyout

It covers only the public display element visible on the homepage, including:
- hero band
- featured recognition card
- recipient avatar/photo behavior
- recent/archive transition
- archive search and browse zone
- standard 100% zoom calibration

## Primary objective

Bring the public-facing HB Kudos webpart to a production-ready homepage presentation standard by correcting:
- top-heaviness in the hero + featured stack
- duplicate CTA hierarchy
- underpowered archive/browse treatment
- recipient avatar/photo omission
- 100% zoom composition imbalance

## Mandatory repo scope

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`
- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css`
- `packages/ui-kit/src/HbcAvatarStack/index.tsx`

## Architectural rule

Public-webpart remediation must stay ownership-correct:

- shared hero / spotlight / homepage-fit composition changes belong in `HbcPeopleCultureSurface`
- recipient photo hydration belongs in the Kudos data mapping seam
- archive/search browse refinements may be local to `HbKudos.tsx`
- initials fallback remains valid only when no recipient photo can be resolved

## Package contents

- `00-Plan-Summary.md`
- `01-Audit-Summary.md`
- `02-Prompt-Shared-Surface-Recalibration.md`
- `03-Prompt-Recipient-Photo-Hydration.md`
- `04-Prompt-Archive-and-Browse-Refinement.md`
- `05-Prompt-Hosted-Validation-and-Closure.md`
