# Prompt 03 — Consistency Validation and Commit Closeout

You are working in the local repo:

```text
/Users/bobbyfetting/hb-intel
```

You are closing out **Phase 3 / Wave 09 — Job Startup Checklist** planning refinement after Prompt 02.

Do not re-read files that are still within your current context or memory unless you need to verify repo truth, line-level details, changed content, or final validation evidence.

---

## Objective

Validate the Wave 09 planning updates, confirm consistency across changed files, verify strict scope boundaries, and commit the work if clean.

The expected commit summary is:

```text
docs(pcc): define wave 9 startup checklist module
```

Use that summary unless the final diff proves a more accurate summary is required.

---

## Required Review Before Validation

Re-read only the changed files and any directly related governing sections necessary to confirm alignment.

Confirm:

- Wave 09 is defined as **Job Startup Checklist**;
- the module is described as a governed item-level Project Readiness workflow module;
- the source PDF path is referenced correctly:

```text
docs/reference/example/Project_Startup_Checklist.pdf
```

- the standard PDF is treated as the default seed source;
- item-level status, owner/responsible-party, due/trigger date, applicability, review/approval, comments, attachments/references, audit history, and source traceability expectations are described where appropriate;
- blocked, overdue, missing-owner, and needs-review items are eligible to surface into Priority Actions Rail / Project Home / Project Readiness rollups;
- status vocabulary aligns with the Phase 3 Project Readiness framework where repo truth supports it;
- authority language aligns with Project Executive, Project Manager, Admin / PCC Admin, and assigned participants without adding unauthorized runtime permission execution;
- Wave 09 is positioned consistently after Wave 08 and before Wave 10;
- no file changed without justification from Prompt 01 / Prompt 02.

---

## Forbidden Scope Confirmation

Confirm no work introduced:

- SPFx UI implementation;
- backend routes;
- parser/importer;
- generated JSON schema;
- package changes;
- lockfile changes;
- manifest changes;
- workflow changes;
- deployment artifacts;
- `.sppkg`;
- app-catalog upload;
- tenant mutation;
- Graph/PnP/SharePoint REST runtime;
- Procore/Sage/Document Crunch/Adobe Sign runtime;
- auth/token wiring;
- provisioning executor work;
- backend write routes.

If any forbidden work occurred, stop. Do not commit. Report the issue and recommended rollback/correction.

---

## Required Validation Commands

Run:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
md5 pnpm-lock.yaml
git diff --check
git diff --stat HEAD
git diff --name-only HEAD
```

If any `packages/models/**` file changed, also run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

If docs only, do not require unrelated full app/backend builds unless repo policy requires them.

Record lockfile MD5 before and after if available from Prompt 02. If Prompt 02 did not capture pre/post MD5, capture current MD5 and state that prior MD5 was not provided.

---

## Diff Review Requirements

Review the final diff for:

- accidental unrelated formatting churn;
- incorrect PDF path;
- inconsistent wave numbering/title;
- implemented-state overstatement;
- invented status vocabulary;
- unauthorized runtime scope;
- missing no-mutation/no-runtime boundary language;
- model metadata drift if model files changed.

Use:

```bash
git diff --stat HEAD
git diff --name-only HEAD
git diff --check
git diff HEAD -- <changed-file-path>
```

Use targeted diffs. Do not dump excessive diff content into the final response.

---

## Commit Instructions

If validation is clean and scope is correct:

```bash
git add <changed files only>
git commit -m "docs(pcc): define wave 9 startup checklist module"
```

Use a detailed commit body mentioning:

```text
Refines Phase 3 Wave 09 / Job Startup Checklist planning.

Defines the standard seed source as docs/reference/example/Project_Startup_Checklist.pdf, establishes default seeded item posture, item-level readiness workflow expectations, traceability requirements, editable authority, and Priority Actions / Project Readiness linkage.

No runtime implementation, backend route, parser/importer, generated schema, deployment, package/lockfile, workflow, app-catalog, tenant mutation, or external-system runtime is introduced.
```

If model metadata files changed, adjust the commit body to mention metadata alignment and validation commands.

Do not include unrelated changed files in the commit.

If there are pre-existing unrelated local changes, leave them untouched and explicitly report them.

---

## Required Final Output

Return:

```text
## Closeout — Wave 09 Job Startup Checklist

### Commit

- Summary:
- Hash:

### Files Changed

- ...

### Validation Results

- git status --short before commit:
- md5 pnpm-lock.yaml:
- git diff --check:
- git diff --stat HEAD:
- git diff --name-only HEAD:
- pnpm --filter @hbc/models check-types: [if applicable]
- pnpm --filter @hbc/models test: [if applicable]

### Consistency Checks

- Roadmap alignment:
- Blueprint alignment:
- Standard Project Site Template Contract alignment:
- Phase 3 implementation plan alignment:
- Metadata alignment if applicable:
- PDF source path alignment:

### Scope Boundaries Confirmed

- No SPFx UI:
- No backend routes:
- No parser/importer:
- No generated schema:
- No package/lockfile/manifest/workflow/deployment changes:
- No tenant/runtime mutation:

### Commit Description

[Paste the commit body.]

### Residual Risks / Follow-Up Decisions

- ...

### Recommendation

Ready for reviewer session / Needs correction
```

Keep the closeout concise, evidence-based, and specific.
