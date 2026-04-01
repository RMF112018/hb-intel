# Accounting Phase 6 Prompt Package Audit Report

## Objective

Audit the attached **Phase 6 — Data Contract and SharePoint Schema Hardening** package against current repo truth, then revise the package so a local code agent executes against the live Project Setup persistence model rather than inferred or partially stale identifier/schema assumptions.

## Overall assessment

The original package is **directionally strong**. It correctly focuses on:

- the SharePoint `Projects` list contract
- mapper/repository hardening
- migration and compatibility posture
- cross-surface verification
- documentation reconciliation

The package needed revision in four critical areas:

1. **Identifier semantics were overstated.**  
   The live repo does **not** currently implement a cleanly separated persisted `requestId` and `projectId` contract. The submit handler sets `requestId = projectId`, the SharePoint contract maps `field_1` through the `requestId` field-map entry, and the mapper reconstructs both `requestId` and `projectId` from that same persisted value. Phase 6 must therefore start from an **aliased key reality**, not from an already-separated immutable dual-key model.

2. **The mixed SharePoint schema posture was under-emphasized.**  
   The live repo uses a deliberate mixed strategy:
   - legacy CSV-import `field_1` through `field_24`
   - named replacement columns such as `viewerUPNs` and `addOns`
   - named P2-07 columns such as `projectStreetAddress`, `supportingEstimatorUpns`, `clarificationItems`
   - named identity columns such as `submittedByOid` and `completedByOid`

   The original package pointed at ambiguity, but it did not force the agent to treat this mixed mapping posture as a **first-class current-state fact** that must be documented before any normalization decisions are made.

3. **Audit targets needed broader consumer coverage.**  
   The original prompts targeted the mapper and repository correctly, but Phase 6 also needs to verify:
   - request submission and read handlers
   - Accounting queue/detail consumers
   - provisioning linkage fields (`projectId`, `projectNumber`, `siteUrl`, completion fields)
   - shared client seams (`packages/provisioning/src/api-client.ts`)
   - canonical model definitions in `packages/models/src/provisioning/IProvisioning.ts`

4. **The package needed a stronger rule for migration posture.**  
   The revised package now requires the agent to distinguish clearly between:
   - **current canonical repo contract**
   - **legacy compatibility retained intentionally**
   - **optional normalization target**
   - **hard production prerequisite**

   It must not silently “freeze” a normalized schema that the live repo does not yet truly own.

## Key repo-truth findings

### 1. `requestId` and `projectId` are aliased in live persistence behavior

`submitProjectSetupRequest` creates `projectId`, then sets `requestId = projectId`, and persists both that way. The API route surface still speaks in terms of `requestId`, but backend provisioning and durable status use `projectId`. The repo therefore currently operates with a **single persisted durable identifier represented through two semantic names**.

### 2. The SharePoint contract is already explicit but internally mixed

The contract file already defines a raw `IProjectsListItem` DTO and an authoritative `PROJECTS_LIST_FIELD_MAP`, but that map itself proves the schema is mixed:
- `field_1`..`field_24`
- `viewerUPNs`
- `addOns`
- P2-07 named fields
- OID fields

Phase 6 should therefore treat “generic imported columns” as **present current-state reality**, not just a migration risk.

### 3. Some comments still carry stale or confusing contract language

Examples:
- contract comments describe `field_1` as “ProjectId — primary key for request lookup” while the field map binds `requestId -> field_1`
- mapper comments and type notes still imply a cleaner domain/storage separation than the live aliasing behavior actually provides

Phase 6 should explicitly reconcile those wording seams.

### 4. Cross-surface verification must include lifecycle linkage fields

The Project Setup request record is not just an Accounting concern. The contract touches:
- backend lifecycle handlers
- provisioning launch linkage
- completion/site URL propagation
- Accounting queue/detail pages
- shared provisioning client behavior

A Phase 6 package that only hardens the mapper without checking those consumers would be incomplete.

## Revisions made to the package

### Package-wide changes

- strengthened the authority order around live code, current-state docs, living refs, and historical plans
- reframed identifier hardening around **current aliasing first**
- made mixed schema posture explicit in the README and implementation plan
- added a single evolving review artifact path expectation
- required direct reconciliation of stale code comments and mapping-language drift

### Prompt-level changes

#### Prompt-01
Expanded the audit to require explicit answers on:
- aliased vs separated identifier semantics
- exact mixed mapping strategy in current repo
- stale comment/doc contradictions
- all consumer seams that depend on identifier and schema meaning

#### Prompt-02
Changed the contract-freeze objective so the agent must first decide whether the canonical Phase 6 contract is:
- **aliased by design for now**, or
- **ready for deliberate key separation**

The prompt now forbids pretending the separation already exists unless repo changes actually implement it.

#### Prompt-03
Strengthened mapper/repository hardening to cover:
- alias safety
- title computation behavior
- named-column vs `field_N` coexistence
- explicit compatibility behavior
- targeted tests for identifier persistence and legacy compatibility

#### Prompt-04
Made migration posture more concrete:
- warning-only vs blocking schema mismatches
- tolerated legacy shape vs required production shape
- current-production-safe posture vs optional normalized future posture

#### Prompt-05
Expanded cross-surface verification to cover:
- backend handlers
- provisioning linkage
- shared API client semantics
- Accounting route/detail consumers
- completion and site URL semantics

#### Prompt-06
Clarified that final closure must mark:
- what is now canonical
- what remains intentionally legacy-compatible
- whether downstream phases can safely rely on the contract without schema guesswork

## Result

The revised package is safer for execution because it now tells the local code agent to:

- start from the real aliased identifier model
- acknowledge the mixed SharePoint schema that already exists
- harden mapper/repository behavior without inventing a normalized contract
- reconcile consumer semantics before declaring Phase 6 closed

## Files delivered

- `README_Phase-6-Data-Contract-and-SharePoint-Schema-Hardening.md`
- `Phase-6_Data-Contract-and-SharePoint-Schema-Hardening_Implementation-Plan.md`
- `Prompt-01_Phase-6-Repo-Truth-Data-Contract-and-SharePoint-Schema-Audit.md`
- `Prompt-02_Phase-6-Canonical-Request-Record-Contract-Freeze.md`
- `Prompt-03_Phase-6-SharePoint-Mapper-and-Persistence-Hardening.md`
- `Prompt-04_Phase-6-Migration-Compatibility-and-Schema-Validation-Hardening.md`
- `Prompt-05_Phase-6-Cross-Surface-Contract-Verification.md`
- `Prompt-06_Phase-6-Final-Documentation-Reconciliation-and-Readiness-Report.md`
