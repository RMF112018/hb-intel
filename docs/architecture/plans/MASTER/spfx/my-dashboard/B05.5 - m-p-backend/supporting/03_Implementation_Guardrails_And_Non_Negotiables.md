# Supporting 03 — Implementation Guardrails and Non-Negotiables

## Purpose

This file defines the locked scope and implementation guardrails for the local agent.

---

# 1. Mandatory Execution Behavior

1. **Do not re-read files that are still within current context or memory.**
   - Re-open files only when needed to confirm drift or immediately before editing.

2. **Do not ask for confirmation before editing.**
   - Proceed with best-effort implementation if repo truth materially aligns with the prompt.
   - Stop only if repo truth contradicts the objective in a way that would make implementation unsafe.

3. **Do not stage unrelated dirty files.**
   - Preserve unrelated worktree changes exactly as found.

4. **Do not broaden the task.**
   - This is a backend identity-path correction, not a wider My Dashboard architecture refactor.

---

# 2. Prohibited Change Areas

Do not modify:

- frontend/SPFx files;
- `apps/my-dashboard` runtime/config/layout;
- dashboard card components;
- package-solution files;
- SPFx manifest files;
- Adobe Sign OAuth/search/token/queue behavior;
- Adobe Sign storage abstractions;
- `AZURE_CLIENT_ID` semantics;
- Table Storage auth posture.

---

# 3. Required Identity Architecture

Preserve:

```text
Function App UAMI
  = workload identity and federated assertion source
```

Standardize:

```text
HB SharePoint Creator app registration
  = Graph / SharePoint application principal
```

Implement:

```text
UAMI assertion token
→ ClientAssertionCredential for HB SharePoint Creator
→ Graph access token
→ GraphListClient requests
```

---

# 4. Token-Safety Requirements

Never log:

- bearer tokens;
- JWT fragments;
- managed identity assertion tokens;
- app access tokens;
- client secrets;
- raw auth headers.

Any new failure messages must be:

- bounded;
- safe for telemetry ingestion;
- compatible with existing sanitization patterns.

---

# 5. Telemetry Compatibility Requirement

The current My Projects runtime diagnostic stage classifier must remain meaningful.

Federation/token exchange failures must surface in a form that classifies as:

```text
token
```

Do not convert a known token/auth failure into:

```text
other
```

without intentionally updating the classifier and tests.

---

# 6. Validation Minimum

Prompt 01 must run:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions build
pnpm exec prettier --check <all changed files>
```

Prompt 02 must run formatting/doc validation applicable to the files it changes. If it touches TypeScript/Bicep/config again, rerun the appropriate backend validations.

---

# 7. Commit Discipline

Return commit guidance, but do not push or deploy unless separately authorized by the operator.

Use the commit templates in:

```text
supporting/05_Commit_Closeout_Template.md
```
