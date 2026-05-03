# Prompt 07 — Document and Enforce Security, Retention, and Permission Posture for Cross-Project Knowledge Reuse

## Objective

Close the remaining security/permission design gap for cross-project knowledge reuse, closed-project reference mode, pursuit/estimating references, executive notes, warranty trace records, and HBI/search grounding.

This prompt is documentation-first with small model/test hardening only where needed to enforce the posture already represented in contracts/fixtures.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Context Handling

Do not re-read files still in current context or memory. Re-open only the security-related docs, model contracts, fixtures, tests, and architecture docs required to verify repo truth.

## Required Source Docs

Use:

- `docs/architecture/blueprint/sp-project-control-center/PCC_Company_Knowledge_Reuse_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md`
- `docs/architecture/blueprint/sp-project-control-center/PCC_Warranty_Traceability_Model.md`
- `docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md`
- existing security/permission docs in the PCC architecture folder.

## Required Documentation Updates

Add or update a dedicated security/retention/permission document if one does not already exist. Recommended title:

```text
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
```

The doc must define:

1. Security classes for PCC lifecycle/memory/search records.
2. Redaction posture for restricted content.
3. Pursuit/estimating sensitivity rules.
4. Executive-only note restrictions.
5. Warranty/privacy concerns.
6. Closed-project access rules.
7. Cross-project search restrictions.
8. Source-owned vs PCC-native vs PCC-derived records.
9. Evidence-link behavior.
10. HBI/search grounding restrictions.
11. Retention posture by record family.
12. Conditions that block cross-project reuse.
13. Rules for summaries vs raw record exposure.
14. Required auditability and future tenant-readiness gates.

## Required Model/Test Hardening

If current models/fixtures lack required security fields, add the minimum model/test changes necessary to enforce:

- every cross-project reference includes security class and redaction posture;
- every HBI/search answer fragment includes source/citation metadata or insufficient-evidence state;
- executive/pursuit-sensitive examples are not exposed through default fixtures for unauthorized lenses;
- warranty trace responsibility cannot be assigned without evidence status;
- closed-project references distinguish summary-safe from raw-record access.

Do not implement actual authorization middleware in this prompt unless a lightweight existing pattern makes it necessary and safe. This is primarily a model/documentation guardrail prompt.

## Tests

Add/update tests to prove:

- fixture records include required security metadata;
- restricted fixture fields are redacted in read models or UI fixtures where expected;
- cross-project references cannot omit security posture;
- HBI/search fixture answers cannot omit citations/evidence state;
- warranty trace records cannot assert responsibility without evidence posture.

## Constraints

- No tenant mutation.
- No production auth changes unless already established by existing preview pattern.
- No dependency changes.
- No lockfile change.
- No broad formatting.
- No live external-system calls.

## Validation

Run:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/project-control-center test
pnpm exec prettier --check docs/architecture/blueprint/sp-project-control-center
md5 pnpm-lock.yaml
```

If `prettier --check` scope is too broad or repo script differs, use the closest documented formatting validation without broad unrelated modifications.

## Required Response

Return:

1. Docs changed.
2. Security posture decisions codified.
3. Model/fixture/test hardening added.
4. Validation results.
5. Lockfile MD5 before/after.
6. Remaining gaps passed to Prompt 08.
