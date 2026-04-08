# Wave 00 — Program Charter and Repo Truth

## Objective

Lock the scope and execution posture for the `CompanyPulse` refactor.

This is a **complete refactor and repurposing** of the `CompanyPulse` webpart into a premium newsroom/editorial homepage surface.

It is **not**:

- a net-new parallel webpart
- a cosmetic cleanup
- a generic SharePoint news-card wrapper
- a broad homepage redesign
- an excuse to preserve the current `CompanyPulse` surface because it already compiles

## Critical instruction from adjacent prompt history

Use the narrow People & Culture remediation prompt as a **UI-quality benchmark** for how to think about:

- premium surface language
- bold focal hierarchy
- subordinate supporting regions
- sparse-state resilience
- CTA integration
- alignment with `ProjectPortfolioSpotlight`

But retune the emotional register for `CompanyPulse` so it becomes:

- more editorial
- more current
- more newsroom-like
- more scannable
- more information-dense in a controlled way
- less celebratory
- less playful
- less socially expressive than People & Culture

## Required repo-truth assessment

Audit the live repo and lock the exact current-state truth for:

- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/companyPulse/index.ts`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`
- `apps/hb-webparts/src/webparts/leadershipMessage/LeadershipMessage.tsx`
- the `hb-webparts` mount seam and any adjacent homepage data/normalization seams that currently affect `CompanyPulse`

## Product decision to lock

Write down and then follow these product decisions:

1. `CompanyPulse` remains the same homepage slot and manifest identity.
2. `CompanyPulse` becomes the communications/newsroom surface.
3. `LeadershipMessage` continues to own executive-message posture.
4. `PeopleCulture` continues to own recognition, celebrations, and Kudos.
5. `CompanyPulse` should borrow the **surface quality discipline** from the People & Culture remediation prompt, but not its celebration-first personality.

## Deliverables

Produce:

1. concise repo-truth notes
2. locked product direction
3. changed-file plan
4. explicit statement of what UI traits are being borrowed from the People & Culture prompt and how they will be retuned for `CompanyPulse`

## Validation

Do not move into implementation until you can state clearly:

- what the current `CompanyPulse` does
- why the current UI is underperforming
- how the People & Culture prompt should guide the UI
- how the emotional/content tuning for newsroom content must differ
