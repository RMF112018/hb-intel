# 03 — Shared Homepage Primitives and Standalone SPFx Scaffolding

**Naming guard**
- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.


## Objective

Create the reusable homepage primitives, shared scaffolding, and homepage webpart structure that all first-release webparts will build on.

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


1. Scaffold the **homepage shared layer** in the repo.
   It should include reusable primitives for:
   - section shell / band wrapper
   - editorial card
   - utility tile
   - spotlight / intelligence card
   - person / recognition chip or card
   - empty state
   - loading / skeleton state
   - optional list / rail shell where clearly reusable

2. Ensure the shared homepage primitives use the homepage-safe contract from Prompt 02.

3. Establish the **homepage webpart scaffolding pattern** for first-release components:
   - folder conventions
   - root component conventions
   - config/property-pane conventions
   - data adapter seams
   - test placement
   - doc placement

4. Build the **common identity/context helpers** needed for homepage use:
   - current user / first-name resolution seam
   - local time-of-day greeting resolver
   - common audience/role visibility helper if required
   - homepage-safe config normalization helper

5. Create the **common content/data seams** likely reused by multiple homepage webparts:
   - curated list item normalization
   - common CTA / link model
   - image/media slot model where needed
   - spotlight item model
   - message / notice model

6. Build the shared styles and responsive behavior needed to support:
   - authored hero treatment
   - compact utility zones
   - balanced editorial/operational layout
   - desktop/tablet/mobile viability inside SharePoint sections

7. Add tests for the shared primitives and helpers.
   Focus on:
   - rendering states
   - accessibility semantics
   - greeting logic
   - loading/empty behavior
   - responsive-safe class/state behavior where testable


## Required Deliverables


- homepage shared primitive components in the repo
- common homepage helper utilities
- homepage scaffolding conventions in code and docs
- tests covering shared homepage primitives and greeting/time helpers
- developer docs explaining how later homepage webparts should consume the shared layer


## Verification


- run package typecheck
- run relevant unit tests
- verify shared primitives do not import broad or disallowed dependencies
- confirm greeting / first-name / local-time helpers are deterministic and test-covered


## Definition of Done


- the homepage system has a reusable foundation
- later webpart prompts can focus on feature implementation instead of recreating layout/state primitives
- greeting, skeleton, empty, editorial, utility, and spotlight patterns are available and governed
