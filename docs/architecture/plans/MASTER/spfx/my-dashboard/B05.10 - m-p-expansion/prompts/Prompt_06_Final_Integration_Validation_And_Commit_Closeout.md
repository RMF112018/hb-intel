# Prompt 06 — My Projects Multi-Platform Launch Expansion | Final Integration Validation and Commit Closeout

## Objective

Perform final integration validation for the completed My Projects Multi-Platform Launch Expansion and prepare the exact commit summary/description.

This is a final validation + closeout prompt. Do not introduce new feature scope.

---

## Mandatory working rules

1. Do not re-read files that remain available in your current context or working memory unless exact lines are needed or source changed.
2. Work from the completed Prompt 05 repo state.
3. Do not alter implementation unless validation exposes a real defect.
4. Do not run live tenant `--apply` unless explicitly authorized by the operator in this session.
5. If live operator dry-run or verifier commands are executable in the current shell, run them and report redacted results.
6. Do not claim hosted tenant validation unless it was actually performed.

---

## Required final local validation

Run the final focused suite required by the implementation.

At minimum, report exact outcomes for:
- scripts tests,
- provider tests,
- My Dashboard frontend tests,
- typechecks,
- Prettier/format validation.

---

## Required optional operator-context validation

If credentials/environment are available and the operator has not prohibited live read-only checks, run:

```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts \
  --json \
  --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

and:

```bash
pnpm tsx scripts/verify-my-project-role-fields.ts --json
```

Do not apply unless explicitly authorized.

---

## Expected final operator instructions

Return the exact next live commands:

### Dry-run
```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts \
  --json \
  --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

### Apply, only when approved
```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts \
  --apply \
  --json \
  --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

### Verify
```bash
pnpm tsx scripts/verify-my-project-role-fields.ts --json
```

---

## Required closeout

Return exactly:

# Prompt 06 Closeout — Final Integration Validation and Commit Closeout

## 1. Executive Verdict
State whether the implementation is ready to commit/push.

## 2. Final Files Changed
Grouped by:
- schema/provisioning,
- contracts/provider,
- frontend,
- fixtures/tests/docs.

## 3. Final Validation Results
Exact commands and outcomes.

## 4. Live Operator Readiness
State:
- dry-run status if executed,
- verifier status if executed,
- apply deferred or executed only if operator-approved.

## 5. Known Remaining Dependencies
Call out:
- separate backfill-script hang issue remains outside this feature package if still unresolved,
- tenant field population is separate from schema creation.

## 6. Recommended Commit Title
Use the package commit guidance unless validation materially changes it.

## 7. Recommended Full Commit Description
Provide a complete multi-bullet commit description.

## 8. Push / Deployment Note
State whether code is ready for normal push/deploy workflow.
