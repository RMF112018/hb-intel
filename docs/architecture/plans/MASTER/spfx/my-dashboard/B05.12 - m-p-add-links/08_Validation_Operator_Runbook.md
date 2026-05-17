# Validation and Operator Runbook

## 1. Local tests

The local agent should run the narrowest repo-true commands covering:

- model tests,
- backend provider tests,
- backend route/service tests,
- frontend My Projects tests,
- client factory/client command tests,
- provisioner/verifier tests,
- type checks,
- formatting.

Exact commands must be taken from repo truth.

---

## 2. Provisioning dry-run

After implementation and from the repo root:

```bash
pnpm tsx scripts/provision-my-projects-custom-links-list.ts --json
```

Expected:
- if list absent:
  - planned list creation / field creation, or a clear creates report depending on script design
- if list present:
  - all fields live-verified
- no blockers.

---

## 3. Provisioning apply

Only after dry-run is clean:

```bash
pnpm tsx scripts/provision-my-projects-custom-links-list.ts --apply --json
```

Expected:
- list created if absent,
- all required fields created,
- success true.

---

## 4. Post-apply readiness verification

Run the selected verifier:

```bash
pnpm tsx scripts/verify-my-projects-custom-links-list.ts --json
```

or, if the implementation extends an existing verifier, use that final command.

Expected:
- ready true
- all fields live-verified.

---

## 5. Hosted My Dashboard smoke test

After deployment:

1. Open My Dashboard.
2. Find a project tile.
3. Expand:
   ```text
   More Project Resources
   ```
4. Confirm empty state if no custom links exist.
5. Click:
   ```text
   Add project link
   ```
6. Confirm helper text appears exactly as specified.
7. Add a private link.
8. Confirm it appears under the same project's resources panel.
9. Add a shared/project-visible link.
10. Confirm it appears under that project.
11. Confirm edit/delete controls only appear for creator-owned links.
12. Validate that another entitled user can see project-visible links but not private links.

---

## 6. Evidence to capture

Sanitized only:

- provisioner dry-run JSON,
- provisioner apply JSON,
- readiness verifier JSON,
- UI screenshot of collapsed resources control,
- UI screenshot of expanded resources panel,
- UI screenshot of add-link modal helper text,
- command API success/failure route logs if already sanitized by code.

Do not capture raw tokens or user PII.

---

## 7. Special validation for visibility rules

### Private link
- Creator sees it.
- Another assigned user does not.

### Project-visible link
- Creator sees it.
- Another assigned user sees it.
- A non-assigned user does not see the project or link.

---

## 8. Failure-path validation

Test:

- invalid non-HTTPS URL,
- title too long,
- link limit reached,
- unauthorized actor,
- owner-required update/delete rejection,
- custom-link source unavailable while base project data still renders.
