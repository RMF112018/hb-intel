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
