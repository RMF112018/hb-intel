# Prompt 00 — Authority, Scope, and UI Governance Lock

Use the live repo as authoritative and perform a targeted implementation-start audit for the HB Kudos + HR Approval Companion work. This is not a broad discovery phase. This is a repo-truth lock and execution setup pass.

## Objective

Before implementation, reconcile the current repo against the v3 package assumptions and freeze:

- file ownership
- actual current component/runtime seams
- homepage UI-kit entry-point discipline
- shared-versus-local UI boundaries
- data/storage assumptions against the live SharePoint list posture
- any stale documentation conflicts that could mislead later prompts

## Primary Inputs

Audit at minimum:

### Repo / implementation
- `apps/hb-webparts/src/webparts/peopleCulture/`
- adjacent seams under `apps/hb-webparts/src/homepage/`
- `apps/hb-webparts/src/mount.tsx`
- relevant manifests for the target webparts
- any current HB Kudos / moderation / archive / page / companion files actually present in repo truth

### Shared UI
- `packages/ui-kit/`
- `packages/ui-kit/src/homepage.ts`
- relevant component folders exported through the homepage entry point

### Doctrine
- `docs/reference/ui-kit/README.md`
- `docs/reference/ui-kit/entry-points.md`
- `docs/reference/ui-kit/Presentation-Lane-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

### Supporting notes
- latest migration/completion notes relevant to People & Culture / ui-kit migration
- latest schema/report files under `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`

## Required Conflict-Resolution Rule

If older review documents conflict with current code or later migration notes, prefer:
1. current source code
2. latest implementation/migration note
3. older review/audit text

Do not let stale review documents override current repo truth.

## Required UI Classification Deliverable

Inventory the UI work needed for HB Kudos and classify every required pattern into one of these buckets:

### A. Use existing shared homepage primitive directly
Examples may include:
- premium badges
- premium CTAs
- avatar stack
- premium section/surface framing
- existing homepage metadata/action row patterns

### B. Extend or create a shared homepage-safe primitive first
Examples may include:
- recognition archive cards
- mixed-recipient summary/bucket patterns
- governance queue rows
- governance toolbar/filter/preset controls
- workflow state / aging / ownership chips
- governance detail sections
- audit timeline presentation blocks
- inline governance action bars

### C. Keep local
Only keep work local when it is truly feature/business-logic-specific, such as:
- SharePoint reads/writes
- workflow reducers
- permission checks
- notification routing
- view-model adaptation
- mount/runtime registration

## Locked UI Entry-Point Rules

Confirm and then obey these rules in later prompts:

- Homepage webparts use `@hbc/ui-kit/homepage` as the primary UI entry point.
- Do not use `@hbc/ui-kit`, `@hbc/ui-kit/primitives`, `@hbc/ui-kit/app-shell`, or `@hbc/ui-kit/fluent` as homepage webpart UI entry points.
- Only use `@hbc/ui-kit/theme`, `@hbc/ui-kit/icons`, or `@hbc/ui-kit/branding` where the homepage entry point does not expose what is needed.
- Do not bypass the shared kit with new local premium shells for repeated patterns.

## Recipient Model Lock

Confirm the live schema and current code path, then explicitly freeze this rule:

- the final HB Kudos submission/editing model must be typed against:
  - `IndividualRecipients`
  - `TeamRecipients`
  - `DepartmentRecipients`
  - `ProjectGroupRecipients`
- the current string/comma-delimited recipient model is not final-state compliant

## Tasks

1. Audit the actual current webpart/component file set.
2. Identify which legacy files named in older prompts no longer exist or are no longer authoritative.
3. Inspect current homepage entry-point exports and list the relevant existing shared components.
4. Identify missing shared recognition/governance primitives that must be added before local implementation proceeds.
5. Verify the live SharePoint schema files and confirm the current code assumptions that do or do not align.
6. Freeze file ownership boundaries:
   - shared UI-kit files
   - homepage shared helpers/contracts
   - local webpart consumers
   - manifests/runtime mount files
7. Produce an execution-start note that later prompts can rely on.

## Deliverables

Return:

1. **Repo-truth file inventory**
2. **Authority resolution note**
3. **Homepage UI inventory**
4. **Shared-vs-local classification table**
5. **Recipient-model compliance note**
6. **List-schema alignment summary**
7. **Implementation scope lock**

## Important Rules

- Do not start major code edits in this prompt unless a tiny corrective change is needed to unblock later prompts.
- Do not re-read files that are still within your active context window or memory unless a detail is genuinely uncertain.
- Be explicit about what must be built in shared layers before local implementation proceeds.
