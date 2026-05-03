# Prompt 07A — Security, Retention, and Permission Architecture Docs

## Objective

Create or update the canonical PCC security, retention, and permission architecture for cross-project knowledge reuse, closed-project references, pursuit/estimating references, executive notes, warranty trace records, and HBI/search grounding.

This prompt is **documentation-only**. Do not modify runtime source, models, tests, backend, SPFx, package files, manifests, or lockfile.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Required Baseline

Do not begin until Prompt 06D has completed and confirmed Prompt 06 closeout.

Expected current model posture:

- Unified lifecycle contracts already contain security classifications, redaction levels, source lineage refs, evidence link refs, security posture, cross-project reference records, warranty trace records, and grounded/refusal Ask-HBI response shapes.
- Prompt 07A documents the policy/architecture governing those seams; it does not reimplement them.

## Required Pre-Edit Repo Truth

Run and report:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Classify uncommitted files as:

- user-owned;
- agent-owned;
- unknown.

Preserve unrelated and user-owned files.

## Required Source Docs to Inspect

Inspect these if present:

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/HB_Project_Control_Center_Target_Architecture_Blueprint.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Unified_Lifecycle_Documentation_Update_Closeout.md
```

Also search the PCC architecture folder for existing security, permission, retention, records-management, system-of-record, HBI grounding, warranty, pursuit, executive-note, and cross-project knowledge docs.

If a listed source doc does not exist, state that in the completion summary and use the closest canonical repo-truth docs. Do not fabricate source-doc existence.

## Required Documentation Work

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
```

If the file already exists, update it rather than creating a duplicate.

The document must define, with resolved decisions and no open questions:

### 1. Security Classes

Define security classes for lifecycle, memory, search, traceability, warranty, and knowledge reuse records. Align with existing model vocabulary where applicable:

- project-internal;
- need-to-know;
- restricted;
- privileged.

Define when each applies.

### 2. Redaction Posture

Define redaction levels and behavior:

- none;
- masked;
- withheld.

Define what each means for:

- record summaries;
- raw record access;
- evidence links;
- source URLs;
- executive notes;
- pursuit/estimating details;
- warranty/privacy data;
- HBI responses.

### 3. Role / Persona Permission Rules

Define persona visibility rules for:

- estimating;
- preconstruction;
- operations;
- field;
- accounting;
- closeout;
- warranty;
- executive;
- admin;
- future-pursuit-reference.

Define how lenses filter shared project truth without becoming separate workspaces.

### 4. Pursuit / Estimating Sensitivity Rules

Define sensitivity posture for:

- pursuit notes;
- go/no-go rationale;
- estimate assumptions;
- bid strategy;
- subcontractor pricing;
- client/deal terms;
- future pursuit reuse.

Resolve summary-safe vs raw-record rules.

### 5. Executive-Only Notes

Define:

- executive-note classification;
- default access posture;
- summary availability;
- redaction behavior;
- audit requirements;
- conditions blocking cross-project reuse.

### 6. Warranty / Privacy Rules

Define:

- warranty trace privacy concerns;
- responsibility recommendation requirements;
- insufficient-evidence/no-blame posture;
- evidence threshold before responsibility is shown;
- vendor/subcontractor/manufacturer display rules;
- owner/resident/private-party information handling.

### 7. Closed-Project Access Rules

Define:

- active project vs closed project access;
- closed-project reference mode;
- archive/future-reference stages;
- summary-safe vs raw-record access;
- cross-project reuse approval posture;
- conditions that block reuse.

### 8. Cross-Project Search Restrictions

Define:

- who can search across projects;
- what can be returned;
- how redaction works;
- what must never be returned;
- how future-pursuit references are displayed;
- why cross-project search is not a source-of-record change.

### 9. Source-Owned vs PCC-Native vs PCC-Derived Records

Define:

- source-system-reference;
- pcc-native;
- pcc-derived / transformed summaries, if applicable.

Align to System of Record Matrix rules:

- Procore owns Procore-native records;
- Sage owns accounting book-of-record data;
- Microsoft 365/SharePoint/Graph owns files and source documents;
- PCC owns PCC-native workflow/reuse records;
- HBI does not own source truth.

### 10. Evidence-Link Behavior

Define:

- source lineage required fields;
- evidence link visibility;
- source URL visibility;
- redaction of evidence excerpts;
- citations in Ask-HBI answers;
- audit trail expectations.

### 11. HBI/Search Grounding Restrictions

Define:

- no uncited grounded answers;
- refusal/insufficient evidence behavior;
- no source-truth claim;
- no live LLM/vector/search behavior in preview;
- project-scoped posture;
- cross-project search restrictions;
- unsupported warranty/responsibility conclusions must refuse or remain insufficient.

### 12. Retention Posture by Record Family

Define retention posture for:

- lifecycle events;
- memory records;
- decisions;
- assumptions;
- executive notes;
- pursuit notes;
- traceability edges;
- warranty trace records;
- cross-project references;
- Ask-HBI query/response records;
- evidence/citations;
- source-system references.

Use qualitative retention categories if exact legal retention periods are not yet decided:

- source-system retained;
- project lifecycle retained;
- closed-project archive;
- restricted executive retention;
- warranty-period retention;
- audit-log retained;
- purge/block candidate.

Do not invent legal retention periods unless repo docs already establish them.

### 13. Reuse Blockers

Define conditions that block cross-project reuse:

- privileged/restricted without summary-safe approval;
- withheld redaction;
- executive-only note;
- active litigation/claim/dispute;
- privacy-sensitive warranty details;
- owner/client confidential data;
- subcontractor pricing where not approved;
- missing source lineage;
- missing evidence threshold;
- low confidence traceability;
- source-system access denied.

### 14. Summaries vs Raw Record Exposure

Define:

- when summaries are safe;
- when raw records can be opened;
- when raw records are blocked;
- what summary fields are allowed;
- what raw fields must be masked/withheld.

### 15. Auditability and Tenant-Readiness Gates

Define required future gates:

- tenant permission validation;
- audit logging;
- access review;
- security review;
- retention review;
- legal/compliance review;
- Microsoft 365 permission-boundary validation;
- HBI grounding attestation.

## Cross-References

Add or update cross-references in nearby docs only if narrowly necessary, for example:

- PCC unified lifecycle doctrine/blueprint doc;
- HBI grounding model doc;
- project memory model doc;
- warranty traceability model doc;
- System of Record Matrix;
- phase/wave README or closeout index.

Do not broadly rewrite existing docs.

## Constraints

Do not modify:

- `packages/**`;
- `apps/**`;
- `backend/**`;
- package files;
- `pnpm-lock.yaml`;
- manifests;
- workflows.

No tenant mutation. No live external calls. No dependency changes.

## Validation

Run targeted doc validation:

```bash
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
md5 pnpm-lock.yaml
```

If you update additional docs, include them in the Prettier check or run the closest targeted documented formatting validation. Do not broad-format unrelated docs.

## Required Completion Summary

Return:

1. Pre-edit repo truth.
2. Workspace classification.
3. Source docs inspected.
4. Docs changed.
5. Security/retention/permission decisions codified.
6. Cross-references updated.
7. Validation results.
8. Lockfile MD5 before/after.
9. Remaining gaps for Prompt 07B.
10. Commit hash if committed.
11. Confirm no push unless explicitly instructed.

## Commit Guidance

Commit only Prompt 07A-owned documentation files. Do not push unless explicitly instructed.

Recommended commit message:

```text
docs(pcc): define knowledge reuse security and retention posture
```
