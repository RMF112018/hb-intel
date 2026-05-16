# Commit and Closeout Template

## Required commit format

```text
Commit summary
<type(scope): concise summary>

Commit description
<short paragraph of what changed>

<short paragraph of guardrails/exclusions>
```

---

## Required closeout report

Use this structure after each implementation prompt:

```text
Closeout

1. Objective completed
- ...

2. Files changed
- ...

3. Validation commands and exact outcomes
- `git diff --check` → ...
- `pnpm --filter @hbc/functions test` → ...
- `pnpm --filter @hbc/functions check-types` → ...

4. Lockfile proof
- `md5 pnpm-lock.yaml` before: ...
- `md5 pnpm-lock.yaml` after: ...
- Changed? yes/no

5. Staging proof
- `git diff --cached --name-only`
- Confirm only the intended files were staged.

6. Guardrail attestation
- No broad `git add .`
- No package/lockfile/manifest/workflow/deployment drift unless explicitly authorized.
- No tenant mutation.
- No secrets/app settings.
- No unrelated Adobe/frontend work.

7. Residual risks or follow-up
- ...

8. Recommended next prompt
- ...
```
