# 07 — Project / Portfolio Spotlight and Safety / Field Excellence

**Naming guard**

- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.

## Objective

Implement the operational-awareness webparts that connect the homepage to real business and field context without introducing a heavyweight app model.

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

1. Implement the **Project / Portfolio Spotlight** webpart.
   It should support:
   - featured projects
   - milestones
   - status indicators
   - spotlight cards
   - optional strategic or executive emphasis where appropriate
     Keep it homepage-appropriate: meaningful signal, not full dashboard sprawl.

2. Implement the **Safety and Field Excellence** webpart.
   It should support:
   - safety highlights
   - recognitions
   - reminders
   - field-oriented notices
   - optional lightweight indicators where they add value

3. Ensure both webparts remain in the first-release lightweight homepage lane unless a truly unavoidable implementation constraint emerges.
   Do not turn them into routed experiences or broad dashboard recreations.

4. Define the content/data model explicitly:
   - curated vs live data
   - summary vs detail
   - CTA pattern
   - authoring ownership
   - freshness expectations

5. Use homepage-safe shared primitives for:
   - metric or signal strips
   - spotlight cards
   - status badges
   - summary metadata

6. Add disciplined fallbacks for:
   - no live signal available
   - no curated spotlight set
   - stale/expired items
   - partial data feeds

7. Add tests for:
   - spotlight card rendering
   - status / badge semantics
   - stale/no-data states
   - CTA and focus behavior

## Required Deliverables

- working Project / Portfolio Spotlight webpart
- working Safety / Field Excellence webpart
- documented data/config model for both
- tests and docs for both

## Verification

- run typecheck and relevant tests
- verify homepage-safe scope: no dashboard sprawl, no routed mini-app behavior
- confirm status semantics and accessibility are sound
- confirm stale and no-data states remain premium and understandable

## Definition of Done

- the homepage now includes operationally grounded business/field awareness
- both webparts add real value without violating performance and composition discipline

## Prompt-07 Closure Artifacts

Prompt 07 deliverables are now locked for Prompt 08–10 implementation:

- `07A_Project_Portfolio_Spotlight_Contract_and_Status_Model.md`
- `07B_Safety_Field_Excellence_Config_and_Indicator_Contract.md`
- `07C_Operational_Awareness_Test_Usage_and_Handoff.md`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/*`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/*`
- shared operational seams in `src/homepage/helpers/operationalAwarenessConfig.ts` and `src/homepage/shared/HomepageOperationalAwarenessCluster.tsx`

## Resolved Decisions Register (Prompt 07)

| Decision ID | Decision                                                                                                                 | Status |
| ----------- | ------------------------------------------------------------------------------------------------------------------------ | ------ |
| D7-01       | Operational awareness items are curated into one featured item plus bounded secondary items (no flat equal-weight lists) | Closed |
| D7-02       | Curated/live freshness metadata is normalized and stale signals are explicitly surfaced                                  | Closed |
| D7-03       | Missing, malformed, or partial operational inputs always fall back to explicit empty-state guidance                      | Closed |
| D7-04       | Project and safety webparts stay in lightweight standalone homepage lane with homepage-safe imports only                 | Closed |
| D7-05       | `hb-webparts` solution + feature versions are patch-bumped to `001.000.005`                                              | Closed |

## Prompt-07 Handoff Note

- Project/portfolio spotlight and safety/field excellence contracts are implemented with shared hierarchy/status/freshness normalization seams.
- Prompt-08 should consume Prompt-07 operational-awareness outputs as fixed inputs and focus on smart search, wayfinding, and discovery surfaces.
