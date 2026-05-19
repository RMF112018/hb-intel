# 02 | SharePoint MVP Storage and Provisioning Architecture

## 1. Objective

Define how the MyDashboard SharePoint list set is provisioned, verified, secured, and operated so that the storage redirection is implementation-ready rather than merely conceptual.

## 2. Target Site

All new lists are hosted on:

```text
https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard
```

The provisioning implementation must refuse to operate on any other site URL.

## 3. Required Provisioning Scripts

### New scripts

```text
scripts/provision-my-dashboard-my-projects-projection-storage.ts
scripts/verify-my-dashboard-my-projects-projection-storage.ts
```

Alias script names following established repo convention (same logic path):

```text
scripts/provision-my-projects-projection-storage.ts
scripts/verify-my-projects-projection-storage.ts
```

### Required behavior

| Script | Behavior |
|---|---|
| provision | Dry-run by default; `--apply` performs mutation; `--json` output; `--site-url` accepted but strictly validated; idempotent reruns |
| verify | Read-only; must reject `--apply`; validates live tenant schema/readiness; `--json` output |

## 4. Required Provisioning Pattern

The scripts must emulate the strongest current repo-truth pattern already proven for HB Central/MyDashboard schema provisioning:

- explicit URL validation;
- dry-run default;
- safe apply;
- field reconciliation;
- type-drift detection;
- unique-drift detection;
- index readiness detection;
- target list creation where required;
- structured report object;
- stable exit codes;
- timeout guards;
- readable operator output;
- suggested next commands;
- post-provision verification.

## 5. Layered Architecture

```text
resources/My_Projects_SharePoint_Storage_Schema.json
  ↓
repo descriptor modules
  ↓
provisioning plan builder
  ↓
provision script
  ↓
SharePoint list/field creation and settings reconciliation
  ↓
verify script
  ↓
operator evidence / closeout
```

## 6. Provisioning Coverage

The master provisioner must manage:

1. list existence;
2. fields and type shapes;
3. required fields;
4. choice sets;
5. indexed fields;
6. unique constraints;
7. controlled seed rows:
   - Source Sync State rows for `Projects` and `LegacyRegistry`;
   - Subscription State rows for `Projects` and `LegacyRegistry`;
   - Control State lease rows where the implementation uses pre-created controls;
8. governance reminders for permission inheritance steps;
9. remediation/reporting when drift exists.

## 7. Safe Apply Rules

The provisioner must refuse `--apply` when:

- the site URL is not the MyDashboard site;
- an existing field has a wrong type;
- a required unique key is not uniquely enforced and cannot be safely remediated by the chosen repo pattern;
- an index cannot be confirmed or planned;
- the implementation cannot reconcile without destructive mutation;
- the descriptor and machine-readable schema conflict.

Do not delete/recreate production lists or fields automatically.

## 8. Verification Rules

The verifier must prove:

- all seven lists exist;
- every required field exists;
- field types match;
- choice values match;
- indexed fields are indexed;
- unique key fields enforce uniqueness;
- required seed/control rows exist where applicable;
- list titles match closed architecture;
- target site is exact;
- no old Azure-only provisioning requirement is presented as active MVP readiness.

## 9. Permissions and Manual Operator Step

The provisioner must report that permissions need operator confirmation after list creation. The architecture requires list permission inheritance to be broken and appropriate restricted permissions applied. The script may **report and verify where repo conventions support it**, but this package does not assume destructive automatic permission takeover unless an existing proven repo pattern already does so and the local agent documents it.

### Required access posture

| Principal | Access |
|---|---|
| Function App / backend service identity | read/write |
| Authorized HB Intel/MyDashboard operators | read or edit as governed |
| General site members | no direct access |
| End users | no direct access |

## 10. Schema Documents

The agent must treat these as implementation authorities:

- `03_SharePoint_List_Schemas_And_Field_Contracts.md`
- `resources/My_Projects_SharePoint_Storage_Schema.json`
- `resources/My_Projects_Provisioning_Contract.json`

If these three sources disagree, stop and report the contradiction.

## 11. Site-Specific Naming

Do not invent shorter list names or internal aliases. The list names in the schema contract are canonical.

## 12. Authentication Lane

The local agent must audit repo truth and align with the most current working provisioning authentication pattern. This package closes the requirements, not the final token utility call-site if the repo has shifted.

### Must remain true

- explicit target site;
- no silent fallback to another SharePoint site;
- no user-interactive step hidden inside build logic;
- clear environment-variable/runbook requirements.

## 13. Provisioning Acceptance

Provisioning work is complete only when:

- provisioner dry-run generates accurate plan;
- apply path succeeds in a safe test/operator lane;
- verifier readback passes;
- wrong-site guard is tested;
- wrong-type/unique/index drift reporting is tested;
- docs/runbook show exact commands;
- package closeout documents all evidence.
