# Financial Shared Spine Integration — Prompt 02
## Objective
Complete the second shared-spine integration workstream for the Financial module by defining the concrete integration rules for each required shared spine so downstream implementation can proceed safely.

## Context
Prompt 01 should already be completed.
Use the newly created or updated Financial shared-spine integration control document as the primary coordination point for this pass.

This prompt is still an integration-definition pass, not a runtime implementation pass.

## Critical Guardrails
- Stay grounded in repo truth and actual package / plan language.
- Do not silently preserve contradictions; resolve them explicitly where repo truth allows, and flag them where it does not.
- Do not overclaim live integration maturity.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make package code changes in this prompt unless a tiny documentation-adjacent change is absolutely required.
- Do not collapse all spines into generic “integration exists” language; define obligations spine by spine.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Financial doctrine and integration control files
- the Financial shared-spine integration control document from Prompt 01
- the Financial doctrine index
- Financial runtime model files
- Financial source-of-truth / action-boundary files
- Financial route / lane / acceptance files that materially affect integration behavior

### Shared spine package doctrine and implementation seams
Inspect the most relevant files for:
- Activity / timeline publication
- Work Queue / next-move publication
- Related Items graph registration
- Health / posture / operating layer consumption
- Notifications and notification tiers
- Acknowledgment / receipt requirements
- Version lineage integration
- Workflow handoff / ownership transition integration
- Project canvas / tile registration / mandatory operating-layer placement

## Required Actions
1. For each required shared spine, define the concrete Financial integration rules.
   - At minimum, define for each spine:
     - when Financial must publish
     - what type of Financial event or state change triggers publication
     - what minimum linkage or identifier requirements must be present
     - whether publication is mandatory, conditional, or prohibited in certain states
     - whether Financial consumes that spine and for what purpose
     - whether user acknowledgment / ownership / next-step state must be reflected
     - whether there are route/lane-specific differences

2. Pressure-test the spine set against actual Financial capabilities.
   - At minimum evaluate:
     - Budget Import
     - Forecast Summary
     - Forecast Checklist
     - GC-GR Forecast
     - Cash Flow Forecast
     - Buyout Log
     - Review / PER
     - Publication / Export
     - History / Audit
   - Determine which spines each tool must publish to or consume from.

3. Reconcile contradictions between Financial doctrine and shared package expectations.
   - Normalize conflicts between:
     - Financial module posture
     - Financial runtime states / versioning rules
     - shared package contracts
     - Project Hub mandatory operating-layer expectations
     - acceptance/readiness doctrine
   - Where contradictions cannot be safely resolved, document them explicitly.

4. Update the shared-spine integration control document so it is implementation-safe.
   - Tighten wording so a future implementer can answer:
     - which Financial tools publish to which spines
     - which events require timeline/work-queue/related-item/notification publication
     - which records require acknowledgment or handoff behavior
     - what the minimum entity linkage contract is
     - what must appear on Project Hub home / canvas surfaces
     - what evidence is required for acceptance

5. If needed, create one narrowly scoped matrix or appendix.
   - Only do this if the existing files cannot clearly express the obligations.
   - Prefer concise names like:
     - `Financial-Shared-Spine-Tool-Integration-Matrix.md`
   - Do not create redundant narrative files.

6. Update cross-references so the Financial doctrine index, shared-spine contract, and any acceptance surfaces all point to the canonical integration rules.

## Deliverables
1. Revised Financial shared-spine integration control document.
2. Any necessary integration matrix / appendix.
3. Updated doctrine-index / README cross-references.
4. A spine-rule normalization summary.
5. A list of unresolved integration issues, if any.

## Definition of Done
This prompt is complete only when:
- each required shared spine has explicit Financial integration rules,
- each major Financial tool has a defined spine publish/consume posture,
- the doctrine is specific enough for downstream implementation,
- and unresolved contradictions, if any, are explicit and bounded.

## Output Format
Return:
1. objective completed
2. files changed
3. spine-rule findings
4. tool-by-tool integration findings
5. contradiction resolutions made
6. unresolved issues / follow-ups
