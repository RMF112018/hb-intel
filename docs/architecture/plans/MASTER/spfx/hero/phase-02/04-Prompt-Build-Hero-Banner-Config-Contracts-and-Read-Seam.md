# 04 — Prompt: Build Hero Banner Config Contracts and Read Seam

Implement the canonical Hero Banner config contract and hosted read seam.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Strict governing authority

Maintain strict compliance with:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Objective

Move the Hero Banner toward a durable hosted config model using explicit typed contracts and a canonical SharePoint-backed read seam.

The public consumer controlled by this seam is the Hero Banner rendered at:

`https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Required scope

At minimum inspect and update as needed:

- `apps/hb-webparts/src/homepage/webparts/topBandContracts.ts`
- `apps/hb-webparts/src/homepage/helpers/topBandConfig.ts`
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx`
- `apps/hb-webparts/src/mount.tsx`
- any homepage data seam pattern files reused for the new implementation
- any required new files for:
  - config list descriptor
  - list-read adapter
  - hook for hosted config retrieval
  - cache invalidation / refresh utility if needed

## Strong default architecture

Unless repo-truth evidence forces a different answer:

- Hosted runtime source of truth = canonical SharePoint list-backed config
- Local/no-SPFx fallback = existing manifest/property config
- Public Hero Banner remains a thin consumer
- Normalization remains explicit in helper/contract code
- No direct raw-field usage inside the presentational surface

## Required authored fields to support

At minimum support:

- headline / banner title
- message
- eyebrow
- metadata
- background image URL
- primary CTA label + href + open-in-new-tab
- secondary CTA label + href + open-in-new-tab
- enabled / active flag if needed by the chosen config model

You may add only the minimum additional fields needed for a clean durable seam.

## Hard rules

- Do not build the admin app in this prompt.
- Do not leave the read seam implicit.
- Do not couple public rendering directly to ad hoc SharePoint field names.
- Do not remove fallback behavior unless you replace it with a better hosted-safe equivalent.
- Do not violate doctrine in pursuit of CMS convenience.

## Validation requirements

Prove:
- hosted runtime can resolve canonical config for the HBCentral homepage
- local/dev fallback still works where intended
- contract mapping is explicit and testable
- no dead config path remains

## Required deliverable format

Return a concise closure report with:

1. Objective
2. Doctrine-Compliance Check
3. Contract Decisions
4. Read-Seam Architecture
5. Files Added or Changed
6. Validation Performed
7. Remaining Dependencies for Admin App
