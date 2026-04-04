# 02 — Homepage Doctrine, UI-Kit Contract, and Brand Foundation

**Naming guard**
- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.


## Objective

Create the homepage-safe visual/implementation contract that all homepage webparts must follow, and encode the Hedrick Brothers brand foundation into governed reusable seams.

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


1. Define the **homepage doctrine** for HB Central.
   It should cover:
   - homepage system vs monolith
   - native SharePoint coexistence
   - page composition rules
   - above-the-fold discipline
   - premium-but-operational visual posture
   - authoring and maintainability constraints

2. Create a **homepage-safe `ui-kit` usage guide**:
   - allowed entry points
   - prohibited broad-import patterns
   - when to use core kit primitives directly
   - when to create homepage-specific wrappers / primitives
   - motion, density, and accessibility rules for homepage surfaces

3. Implement the initial **homepage-safe shared entry point or contract** in the repo.
   This may include:
   - a dedicated homepage sub-entrypoint
   - homepage-focused barrel exports
   - homepage wrapper primitives
   - homepage-safe design tokens / aliases where appropriate
   Keep it minimal and governed; do not dump unrelated exports into it.

4. Encode the **HB brand foundation** for homepage use:
   - primary blue `rgb(34, 83, 145)`
   - secondary orange `rgb(229, 126, 70)`
   - premium, established, polished, operational
   - not flashy, not template-like, not startup-like

5. Create reusable homepage visual rules for:
   - hero typography
   - section headers
   - editorial cards
   - utility tiles
   - intelligence strips / spotlight cards
   - light-theme-first behavior
   - focus, hover, disabled, loading, and reduced-motion states

6. Ensure the resulting contract is credible for SharePoint use and does not recreate a giant shell layer.

7. Update authoritative docs so future work points to the homepage-safe contract instead of generic interpretation.


## Required Deliverables


- homepage doctrine markdown doc
- homepage-safe `ui-kit` usage guide
- repo changes implementing the initial homepage-safe shared contract / entry point
- any necessary `packages/ui-kit` export or documentation updates
- a concise brand foundation reference for homepage implementers


## Verification


- typecheck all touched packages
- ensure no prohibited or overly broad entry-point pattern remains in newly added homepage code
- ensure light-theme-first behavior is explicit
- confirm reduced-motion and accessibility rules are documented and represented in shared primitives


## Definition of Done


- a stable homepage-safe visual / implementation contract exists
- brand rules are encoded, not just described
- downstream homepage webpart prompts can build on this contract without inventing their own UI rules
