# 01 — Repo-Truth Baseline and Governance Lock

Conduct a **targeted, exhaustive repo-truth baseline audit** for the Hero Banner Admin effort.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Strict governing authority

Read and apply these first, and treat them as **binding with strict compliance**:

### Doctrine — primary authority
1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

You must explicitly translate these doctrine files into implementation constraints for:
- the public Hero Banner
- the admin app hosted at `.../SitePages/Homepage-Admin.aspx`
- the control relationship between the admin page and the public HBCentral homepage

### Benchmark governance package — subordinate authority
3. `docs/architecture/plans/MASTER/spfx/benchmark/README.md`
4. `docs/architecture/plans/MASTER/spfx/benchmark/00-Plan-Summary.md`
5. `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
6. `docs/architecture/plans/MASTER/spfx/benchmark/02-Kudos-Public-Benchmark-Reference.md`
7. `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
8. `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
9. `docs/architecture/plans/MASTER/spfx/benchmark/05-Code-Agent-Governance-Prompt-Template.md`
10. `docs/architecture/plans/MASTER/spfx/benchmark/06-Closure-Checklist.md`
11. `docs/architecture/plans/MASTER/spfx/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

## Locked host facts to audit against

- **Admin hosting page:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/Homepage-Admin.aspx`
- **Controlled public homepage:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Required audit scope

At minimum, inspect:

- `apps/hb-webparts/src/webparts/hbHeroBanner/`
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx`
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBannerWebPart.manifest.json`
- `apps/hb-webparts/src/homepage/helpers/topBandConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/topBandContracts.ts`
- `apps/hb-webparts/src/webparts/hbSignatureHero/`
- `apps/hb-webparts/src/homepage/helpers/greeting.ts`
- `apps/hb-webparts/src/homepage/helpers/welcomeMessage.ts`
- `apps/hb-webparts/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- one or more existing list-backed homepage data seams for pattern reference
- one or more existing admin/companion surfaces for interaction-quality reference

## Audit goals

Produce a concise repo-truth baseline covering:

1. current Hero Banner runtime architecture
2. current Hero Banner config source(s)
3. current shell/property-pane seam
4. current greeting helper behavior
5. best existing repo pattern for:
   - canonical SharePoint list-backed config reads
   - admin/companion authoring UI
   - cache invalidation / refresh after write
6. doctrine obligations that materially constrain the solution
7. benchmark expectations that materially constrain the solution
8. the target persona of:
   - the public Hero Banner
   - the Hero Banner Admin app
9. how the admin host page should control the public homepage without violating doctrine or faking shell ownership

## Hard rules

- Do not guess at the current architecture.
- Do not begin implementation in this prompt.
- Do not broaden into dynamic article architecture unless the audited code forces it.
- Do not copy HB Kudos visual identity into this effort.
- Do not soften doctrine language into “guidance.” Treat it as strict governing authority.

## Required deliverable

Produce a markdown baseline with these exact sections:

1. Doctrine Summary
2. Benchmark-Governance Summary
3. Current-State Architecture Summary
4. Host-Context Summary
5. Greeting Logic Baseline
6. Existing Repo Patterns Worth Reusing
7. Persona Lock Recommendations
8. Risks to Avoid During Implementation
9. Recommended Next Step
