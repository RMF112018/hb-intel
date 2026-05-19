# Runbook 02 | MyDashboard List Provisioning and Verification

## Objective

Provision and verify the seven SharePoint lists required by the redirected My Projects architecture.

## Target Site

```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard
```

## Required Scripts

```text
scripts/provision-my-dashboard-my-projects-projection-storage.ts
scripts/verify-my-dashboard-my-projects-projection-storage.ts
```

Repo-convention aliases (same implementation path):

```text
scripts/provision-my-projects-projection-storage.ts
scripts/verify-my-projects-projection-storage.ts
```

## Execution Order

### 1. Verify current state

```bash
pnpm tsx scripts/verify-my-projects-projection-storage.ts --json
```

Expected:
- exits `0` only if already ready;
- otherwise exits `1` with drift/missing detail.

### 2. Dry-run provisioning

```bash
pnpm tsx scripts/provision-my-projects-projection-storage.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
```

Expected:
- no mutation;
- planned list/field/index/unique changes;
- blockers identified.

### 3. Apply provisioning

```bash
pnpm tsx scripts/provision-my-projects-projection-storage.ts --apply --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
```

Expected:
- list/field/index/unique creation or settings remediation only when safe;
- no destructive delete/recreate behavior.

### 4. Post-apply verification

```bash
pnpm tsx scripts/verify-my-projects-projection-storage.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard --json
```

Expected:
- `ready=true`.

## Permission Governance Step

After list creation, perform or verify the governed permissions step:

- break inheritance as required;
- backend service identity read/write;
- authorized operators access as governed;
- no general end-user direct access.

Record operator confirmation in the command ledger.

## Failure Handling

If apply fails due to:

- wrong-site URL;
- field type drift;
- uniqueness drift;
- index drift;
- unauthorized access;

stop and resolve the blocker. Do not force destructive remediation without a dedicated approved prompt.

## Required Evidence

- provisioner dry-run output;
- provisioner apply output;
- verifier output;
- permission step confirmation;
- screenshots or exported list settings only if your standard operator process already uses them.
