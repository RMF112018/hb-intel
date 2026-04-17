# 03 — Future-State Gap Register

| ID | Gap | Severity | Scale | Why it matters | Primary repo seams |
|---|---|---|---|---|---|
| G-01 | No flagship top-band exists in the rendered homepage shell | Critical | Structural redesign | The homepage overlay expects a single flagship top-band object; the current shell is only a stacked sequence of zones | `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`, `HbHomepageShell.module.css`, `packages/ui-kit/src/HbcSignatureHeroSurface/index.tsx` |
| G-02 | Shell lacks explicit composition authority | Critical | Structural redesign | There is no registry or metadata model for zone role, order, spacing, fallback policy, or layout priority | `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`, `hbHomepageContract.ts` |
| G-03 | Zone failure behavior is silent | High | Targeted refinement | `ZoneErrorBoundary` logs and returns `null`, which is not a benchmark-grade authoring/runtime posture | `apps/hb-webparts/src/webparts/hbHomepage/ZoneErrorBoundary.tsx` |
| G-04 | Shell contract and runtime are drifting | Medium | Targeted refinement | The published prop contract is broader than what the shell actually forwards to zones; that weakens governance clarity | `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`, `HbHomepageShell.tsx` |
| G-05 | People & Culture Public bypasses the governed homepage surface system | Critical | Structural redesign | The local public surface is inline-style heavy, raw-value heavy, and harder to benchmark or reuse consistently | `apps/hb-webparts/src/webparts/peopleCulturePublic/PeopleCulturePublicSurface.tsx`, `PeopleCulturePublic.tsx` |
| G-06 | Shared hero primitive is not aligned to current homepage doctrine | High | Structural redesign | The existing hero primitive still supports gradient wash and pre-Phase-18 slot complexity, so it is not safe to adopt as-is for the flagship top-band | `packages/ui-kit/src/HbcSignatureHeroSurface/index.tsx`, `packages/ui-kit/src/homepage.ts` |
| G-07 | Manifest intent is stronger than rendered reality | Medium | Refinement | `supportsFullBleed` is declared, but the current homepage shell does not yet exploit that capability to create a flagship opening plane | `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageWebPart.manifest.json`, `HbHomepageShell.module.css` |
| G-08 | Width and hierarchy governance are too timid at shell level | High | Structural redesign | A centered max-width single-column stack is too weak as the governing homepage shell for a flagship intranet homepage | `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.module.css` |
| G-09 | Shell has no proof-based closure package | Critical | Refinement | Benchmark workflow requires hosted validation, scorecard evidence, and explicit closure proof | benchmark docs, hosted validation artifacts not present |
| G-10 | No shell-level freshness or narrative coordination across zones | Medium | Refinement | Each zone can be strong individually, but the homepage shell does not yet shape them into one coherent editorial/operational narrative | `HbHomepageShell.tsx`, zone ordering model |

## Preserve-without-rebuild items

These items should **not** be discarded while closing the gaps above:

- the current zone model itself
- thin consumer posture in Company Pulse, Leadership Message, and Project Spotlight
- Project Spotlight’s list-first / manifest-fallback seam
- HB Kudos runtime depth
- the governed homepage entrypoint pattern in `packages/ui-kit/src/homepage.ts`

## Core forward-looking interpretation

The homepage is not weak because the zone components are poor.

It is weak because the **shell is under-authored**, the **hero system is not closed to doctrine**, and the **People & Culture public lane remains outside the governed homepage family**.
