# 04 — Recommended Remediation Sequence

## Recommended closure order

### Step 1 — Re-baseline the data model (highest priority)
**Objective:** close the schema-contract drift before any workflow or UI work.

#### Required work
1. Replace `Project Spotlight *` list descriptors with the actual `HB Article*` list titles.
2. Finish the schema-layer scrub so the newly rebranded **Article Publisher** app identity is cleanly separated from still-valid **Project Spotlight** destination terms.
3. Replace the `PublisherPostRow` / `PostId` model with the tenant `HB Articles` / `ArticleId` model.
4. Rebuild:
   - contracts
   - row mappers
   - repositories
   - writers
5. Add the missing `HB Article Promotion Rules` repository seam.
6. Add a real `HB Article Publishing Errors` writer.

#### Exit criteria
- Every repository read/write targets the correct tenant list title.
- Every repository uses actual tenant field names.
- Every parent/child relationship is keyed by `ArticleId`.
- No publisher repository depends on fields not present in the tenant schema.

---

### Step 2 — Rebuild workflow and history behavior against tenant schema
**Objective:** close the lifecycle mismatch after the data layer is corrected.

#### Required work
1. Replace `inReview` with `review`.
2. Rebuild the workflow-history write model around:
   - `ArticleId`
   - `PreviousState`
   - `NewState`
   - `ActionDateUtc`
   - `ActorEmail`
   - `ActionNote`
3. Decide whether the tenant schema should remain actionless or be extended.
4. Define explicit side effects for:
   - submit for review
   - approve
   - publish
   - republish
   - archive
   - withdraw

#### Exit criteria
- State machine matches tenant state values.
- Every transition writes a valid history row.
- Archive / withdraw are fully defined operational flows.

---

### Step 3 — Rebuild template resolution, validation, and binding logic
**Objective:** align preview/publish decisions to the actual template and binding registries.

#### Required work
1. Rebuild template typing around the actual registry fields:
   - `IsActive`
   - `VersionLabel`
   - `ContentTypes`
   - `Destination`
   - `PageShellTemplateKey`
   - profile keys
   - show/hide toggles
2. Rebuild binding typing around `HB Article Destination Pages`.
3. Rebuild validation profiles against the real fields and real template rules.

#### Exit criteria
- Preview and publish operate on tenant-aligned resolution context.
- Binding drift logic uses tenant binding fields.
- Validation errors refer only to real tenant fields.

---

### Step 4 — Harden the publish pipeline
**Objective:** make “publish” operationally complete.

#### Required work
1. Prove and, if necessary, implement final modern-page publish behavior.
2. Persist post-publish metadata back to `HB Articles`.
3. Write binding rows to `HB Article Destination Pages`.
4. Write error rows on failure.
5. Incorporate promotion rules into publish-time outcomes.

#### Exit criteria
- Publish produces a live destination page.
- Master record, binding record, and history record stay in sync.
- Failure paths write to `HB Article Publishing Errors`.

---

### Step 5 — Hosted verification and closure
**Objective:** prove the hosted page behaves correctly in tenant.

#### Required work
1. Test create / save / submit / approve / publish / republish / archive / withdraw.
2. Verify list mutations in all 8 tenant lists.
3. Verify generated page behavior on the destination site.
4. Verify Team Viewer resolution against live `HB Article Team Members`.
5. Verify promotion-rule behavior.

#### Exit criteria
- No list-title failures
- No field-name failures
- No silent publish failures
- No orphaned bindings
- No missing history or error rows

---

## Prompt-package recommendation
A follow-on prompt package **should** be generated.

## Recommended structure
Do **not** generate one huge all-in-one remediation prompt.  
Use a tightly bounded sequence:

### Wave 1 — Schema and repository realignment
One prompt package focused only on:
- list descriptors
- contracts
- row mappers
- repositories
- writers
- promotion-rules seam
- publishing-errors writer

### Wave 2 — Workflow and history realignment
One prompt package focused only on:
- workflow states
- transition rules
- history writes
- archive/withdraw lifecycle

### Wave 3 — Template, validation, and binding realignment
One prompt package focused only on:
- template registry
- validation engine
- resolution context
- binding logic

### Wave 4 — Publish-pipeline completion and hosted verification
One prompt package focused only on:
- final publish semantics
- master-record sync
- error handling
- hosted verification checklist

## Recommended first package
Start with **one tightly bounded remediation package for the highest-priority category: schema and repository realignment**.

That is the correct first move because the rest of the system cannot be trusted until the data layer matches the tenant.
