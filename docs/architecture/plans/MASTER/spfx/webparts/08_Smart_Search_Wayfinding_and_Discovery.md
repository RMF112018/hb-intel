# 08 — Smart Search, Wayfinding, and Discovery

**Naming guard**

- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.

## Objective

Implement the homepage discovery layer so employees can quickly find tools, forms, policies, teams, and common destinations without falling back to a generic search box only.

## Required Context

- Live repo: `RMF112018/hb-intel`
- This package’s `00_Implementation_Summary.md`
- This package’s `11_Risk_Exposure.md`
- This package’s `12_Standards_and_Best_Practices.md`
- Relevant current-state docs, ADRs, package READMEs, and live source files in the repo

## Operating Rules

- Use **repo truth first**. Inspect the live code and current authoritative docs before editing.
- Do **not** re-read files that are already in your current context or memory window.
- Do **not** broaden scope beyond the HB Central homepage webpart system.
- Do **not** create placeholder or stubbed production code.
- Prefer updating existing authoritative docs over creating redundant documents.
- Preserve SharePoint-native authoring and page composition.
- Default to lightweight homepage webparts unless this prompt explicitly authorizes an exception.
- Keep imports narrow and homepage-safe.
- Record any doc/code contradiction you find instead of silently choosing one source.
- At the end, provide a concise handoff note with changed files, verification, risks, and next-prompt readiness.

## Implementation Tasks

1. Implement the **Smart Search / Wayfinding** webpart.
   It should support:
   - search-oriented discovery
   - intent-oriented quick paths
   - common destinations
   - policies, forms, systems, team spaces
   - optional guided categories or featured resource groups

2. Keep the first release practical and homepage-safe.
   If true search intelligence is too expensive or immature for release 1, implement a premium guided-discovery layer first and document future search-enhancement seams.

3. Make the webpart clearly better than a plain search box plus loose links.
   It should feel:
   - curated
   - fast
   - premium
   - structured
   - easy to scan

4. Define the content source and maintenance model:
   - curated resources
   - category grouping
   - ordering
   - iconography
   - optional promoted destinations
   - optional recent/popular behavior only if practical and trustworthy

5. Provide excellent empty, loading, and bad-config states.

6. Add tests for:
   - category rendering
   - promoted destination behavior
   - keyboard interaction
   - focus and semantic structure
   - malformed/partial data behavior

## Required Deliverables

- working Smart Search / Wayfinding webpart
- documented first-release search/discovery strategy
- content/config docs
- tests and docs for the webpart

## Verification

- run typecheck and relevant tests
- verify the component is valuable even if advanced search intelligence is deferred
- confirm keyboard access and focus behavior
- confirm categories and promoted paths remain scannable and premium

## Definition of Done

- the homepage discovery layer is implemented
- users have a credible guided path to tools, forms, sites, and resources
- future search enhancement seams are explicit rather than hidden

## Prompt-08 Closure Artifacts

Prompt 08 deliverables are now locked for Prompt 09–10 implementation:

- `08A_Smart_Search_Wayfinding_Strategy_and_Contract.md`
- `08B_Discovery_Config_and_Category_Model.md`
- `08C_Discovery_Test_Usage_and_Handoff.md`
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/*`
- shared discovery seams in `src/homepage/helpers/discoveryConfig.ts` and `src/homepage/shared/HomepageDiscoveryCluster.tsx`

## Resolved Decisions Register (Prompt 08)

| Decision ID | Decision                                                                                                 | Status |
| ----------- | -------------------------------------------------------------------------------------------------------- | ------ |
| D8-01       | Discovery release-1 strategy is curated-first with local search filtering over authored resources        | Closed |
| D8-02       | Promoted destinations and quick paths are required first-class discovery surfaces                        | Closed |
| D8-03       | Malformed, partial, or no-match discovery states always render explicit premium empty/no-result guidance | Closed |
| D8-04       | Discovery webpart remains in lightweight standalone homepage lane with homepage-safe imports only        | Closed |
| D8-05       | `hb-webparts` solution + feature versions are patch-bumped to `001.000.006`                              | Closed |

## Prompt-08 Handoff Note

- Smart search/wayfinding is implemented with shared curated discovery normalization seams and explicit future enhancement strategy metadata.
- Prompt-09 should consume Prompt-08 discovery outputs as fixed inputs and focus on authoring/config governance plus page composition controls.
