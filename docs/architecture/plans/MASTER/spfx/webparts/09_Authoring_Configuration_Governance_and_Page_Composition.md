# 09 — Authoring, Configuration, Governance, and Page Composition

**Naming guard**

- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.

## Objective

Turn the homepage webpart set into a maintainable product by implementing configuration discipline, content ownership patterns, and page-composition guidance.

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

1. Audit the current implementation produced by Prompts 01–08 and standardize the configuration model across homepage webparts.

2. Define and implement the **authoring/configuration pattern** per webpart:
   - property pane use
   - list-backed content/configuration
   - ordering / visibility
   - CTA configuration
   - media handling
   - role/audience awareness if supported

3. Create the **homepage governance documentation**:
   - what each zone is for
   - what content belongs / does not belong
   - owner per zone/webpart
   - freshness / rotation expectations
   - anti-sprawl rules
   - editorial hierarchy rules

4. Create the **page composition guidance** for HB Central site owners:
   - recommended homepage zone ordering
   - above-the-fold guidance
   - how custom and Microsoft webparts can coexist
   - recommended use of section layouts
   - what combinations to avoid

5. Harden site-owner-facing webpart behavior:
   - clear empty states
   - clear config validation
   - friendly authoring messages
   - no silent failures

6. Create docs that allow normal homepage operation without developer involvement for standard content updates.

7. Update any authoritative repo docs that should now point to the homepage webpart program and its authoring/governance model.

## Required Deliverables

- unified authoring/configuration docs for the homepage system
- homepage governance doc
- homepage page-composition / site-owner guide
- any necessary config-validation improvements in code
- updates to authoritative docs

## Verification

- run typecheck and relevant tests
- verify every first-release webpart has a documented owner/config model
- verify page-composition rules are explicit and practical
- confirm no critical authoring path still depends on developer intervention

## Definition of Done

- the homepage program is maintainable and governable
- site owners have clear composition and authoring guidance
- the homepage is protected from uncontrolled sprawl

## Prompt-09 Closure Artifacts

Prompt 09 deliverables are now locked for Prompt 10 implementation:

- `09A_Unified_Authoring_and_Configuration_Model.md`
- `09B_Homepage_Governance_and_Zone_Ownership.md`
- `09C_Page_Composition_and_Site_Owner_Playbook.md`
- shared governance seams in `apps/hb-webparts/src/homepage/webparts/authoringGovernanceContracts.ts` and `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts`

## Resolved Decisions Register (Prompt 09)

| Decision ID | Decision                                                                                                        | Status |
| ----------- | --------------------------------------------------------------------------------------------------------------- | ------ |
| D9-01       | First-release authoring model is standardized around property-pane-driven curated configuration                 | Closed |
| D9-02       | Every first-release webpart has explicit owner, freshness cadence, and allowed-content scope metadata           | Closed |
| D9-03       | No-data, invalid, and no-result authoring paths must present explicit actionable messaging (no silent failures) | Closed |
| D9-04       | Page composition guidance is fixed around zone ordering, above-the-fold discipline, and anti-sprawl constraints | Closed |
| D9-05       | `hb-webparts` solution + feature versions are patch-bumped to `001.000.007`                                     | Closed |

## Prompt-09 Handoff Note

- Authoring/config governance and page composition controls are locked with shared runtime governance seams and site-owner guidance docs.
- Prompt-10 should consume Prompt-09 governance outputs as fixed inputs and focus on verification, packaging, and release-readiness handoff.
