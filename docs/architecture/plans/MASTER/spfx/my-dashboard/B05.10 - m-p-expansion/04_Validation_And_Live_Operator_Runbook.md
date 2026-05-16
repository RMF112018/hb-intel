# Validation and Live Operator Runbook

## Objective

Provide a deterministic validation sequence after the multi-platform launch expansion is implemented.

---

# 1. Local static validation

Run targeted format/lint/type/test commands according to the repo package layout discovered by the local agent.

At minimum, expect these categories:

## 1.1 Script and backend tests

```bash
pnpm exec vitest run --config scripts/vitest.config.ts \
  scripts/provision-my-projects-source-list-schema.test.ts \
  scripts/verify-my-project-role-fields.test.ts
```

```bash
(cd backend/functions && pnpm exec vitest run --config vitest.config.ts \
  src/hosts/my-work-read-model/read-models/project-links/my-project-links-read-model-provider.test.ts)
```

## 1.2 My Dashboard frontend tests

Run the My Projects UI tests using the repo's current package-specific command or direct Vitest invocation. At minimum include:

```text
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx
```

and any dedicated launch-menu tests that exist or are introduced.

## 1.3 Type checks

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/spfx-my-dashboard check-types
```

Run the relevant models package type checks if package scripts exist.

## 1.4 Prettier

Run Prettier against touched files or use the repo's canonical formatting command.

---

# 2. Local report expectations

The implementation should produce test evidence covering:

- new schema descriptor fields,
- readiness report additions,
- new read-model actions,
- provider action/stage behavior,
- frontend launch-menu options and updated copy.

---

# 3. Operator dry-run flow

Run this only from a shell with the previously established certificate-backed SharePoint operator identity configured.

## 3.1 Source-list provisioner dry-run

```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts \
  --json \
  --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

Expected before applying new schema:

### Projects target
Planned creates should include:

```text
buildingConnectedUrl
documentCrunchUrl
```

### Legacy Registry target
Planned creates should include:

```text
buildingConnectedUrl
documentCrunchUrl
projectStage
```

If fields have already been provisioned, these should appear under live-verified instead.

No wrong-type blockers should be accepted without explicit review.

---

# 4. Operator apply flow

Do not run until explicitly approved by the operator.

```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts \
  --apply \
  --json \
  --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral
```

Expected:
- create missing fields only,
- no destructive mutation,
- success true when no blockers exist.

---

# 5. Readiness verification

After apply:

```bash
pnpm tsx scripts/verify-my-project-role-fields.ts --json
```

Expected readiness coverage should show:

## Projects
- role arrays live
- `buildingConnectedUrl` live as Text
- `documentCrunchUrl` live as Text

## Legacy Registry
- role arrays live
- `procoreProject` live as Text
- `buildingConnectedUrl` live as Text
- `documentCrunchUrl` live as Text
- `projectStage` live as Text

If the verifier name remains unchanged, its report/comments/docs must make clear it now covers the broader My Projects source-list readiness contract.

---

# 6. Hosted My Dashboard validation

After code deployment and SharePoint provisioning:

1. Open hosted My Dashboard.
2. Locate My Projects.
3. Confirm support copy references:
   - SharePoint
   - Procore
   - BuildingConnected
   - Document Crunch
4. Open a tile launch menu.
5. Confirm four options are present in order.
6. Confirm available links open in a new tab.
7. Confirm missing links render as unavailable menu options.
8. Confirm project stage renders from:
   - Projects rows
   - Registry-only rows where populated
9. Confirm browser overflow/drawer/sheet still opens and renders the same tiles.

---

# 7. Runtime evidence to capture

Capture sanitized evidence only:

- one screenshot or DOM summary of a four-option launch menu,
- one provisioner dry-run JSON before apply,
- one provisioner apply JSON if run,
- one verifier JSON after apply,
- one hosted UI screenshot after deployment,
- test command outputs.

Do not capture bearer tokens or raw auth material.

---

# 8. What this runbook does not prove

This runbook does not prove assigned-project matching if the tenant role-array data remains unpopulated due to the separate backfill issue.

Schema readiness + launch-link support does not by itself prove that a given user will see assigned projects. That requires valid assignment data and a successful My Projects read-model response.
