# Phase 2 — Data Contract Package

This package contains a sequenced implementation kit for bringing the **HB Intel Estimating / Project Setup SPFx package** through **Phase 2 — Data contract**.

## Included files

1. `Phase-2_Data-Contract_Action-Plan.md`
   - Master action plan
   - Workstreams
   - Deliverables
   - Acceptance criteria
   - Execution sequence

2. `Prompt-01_Repo-Truth-and-Field-Map-Baseline.md`
   - Establish the exact current `Projects` list contract
   - Inventory every read/write/query assumption in repo truth
   - Produce the canonical baseline before refactor work starts

3. `Prompt-02_Canonical-Data-Contract-and-Types.md`
   - Define the canonical domain contract
   - Separate business DTOs from SharePoint persistence DTOs
   - Lock the translation boundaries and field dictionaries

4. `Prompt-03_SharePoint-Field-Mapping-and-Serialization.md`
   - Implement internal-name mapping
   - Centralize serialization / deserialization
   - Eliminate display-name assumptions from the persistence layer

5. `Prompt-04_Query-Write-Path-Refactor_and-Contract-Tests.md`
   - Refactor all query and write paths to use the canonical mapping layer
   - Add unit / integration / contract tests around the data contract

6. `Prompt-05_Runtime-Validation-and-Observability.md`
   - Add runtime safeguards for schema drift and null/empty edge cases
   - Improve diagnostics for field-map failures and data-shape mismatches

7. `Prompt-06_Final-Verification_and-Handoff.md`
   - Run the final verification pass
   - Produce handoff notes, unresolved items, and next-phase blockers

## Recommended use

- Run the prompts **in order**.
- Do **not** merge work from a later prompt until the acceptance criteria from the prior prompt are satisfied.
- Treat this package as **Phase 2 only**.
- Keep token-version redesign, full auth-model changes, broader infrastructure hardening, and long-tail provisioning maturity out of this phase unless a prompt explicitly allows a narrowly scoped enabling change.

## Governing intent for Phase 2

Phase 2 is complete only when all of the following are true:

- The backend no longer relies on friendly SharePoint display-name assumptions for the production `Projects` list.
- A single authoritative mapping layer exists between the business/domain model and the SharePoint persistence model.
- All read, write, filter, select, and update paths use that mapping layer.
- Contract tests protect the mapping so field-name drift or partial regressions fail loudly.
- The package and backend can rely on a stable, documented data contract going into later auth and infrastructure phases.
