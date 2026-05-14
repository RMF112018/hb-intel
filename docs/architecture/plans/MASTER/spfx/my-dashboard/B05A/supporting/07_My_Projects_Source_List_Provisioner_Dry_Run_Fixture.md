# My Projects Source-List Provisioner Dry-Run Fixture

## Purpose

Deterministic, sanitized dry-run evidence sample for `scripts/provision-my-projects-source-list-schema.ts`.

- No tenant secrets
- No bearer tokens
- No app-setting dumps
- Shows wrong-type blocker visibility and non-apply safety posture

## Sample command (read-only)

```bash
pnpm tsx scripts/provision-my-projects-source-list-schema.ts --json
```

## Sample output fixture (sanitized)

```json
{
  "siteUrl": "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral",
  "apply": false,
  "startedAtUtc": "2026-05-14T00:00:00.000Z",
  "completedAtUtc": "2026-05-14T00:00:01.000Z",
  "identityLaneWarning": {
    "runtimeLane": "Function App UAMI app-only token lane (ManagedIdentityTokenService/getPnPContext).",
    "operatorLane": "HB SharePoint Creator app registration is a separate operator/deployment identity context.",
    "note": "Ensure app-only SharePoint permissions are granted to the runtime identity before using --apply."
  },
  "targets": [
    {
      "listTitle": "Projects",
      "listFound": true,
      "plannedCreates": ["projectManagerUpns"],
      "liveVerified": ["leadEstimatorUpns"],
      "blockers": [
        {
          "listTitle": "Projects",
          "fieldInternalName": "leadProjectManagerUpns",
          "desiredType": "MultiLineText",
          "liveType": "Text",
          "reason": "Type mismatch cannot be auto-converted safely. Allowed live types for MultiLineText: Note"
        }
      ],
      "appliedCreates": []
    },
    {
      "listTitle": "Legacy Project Fallback Registry",
      "listFound": true,
      "plannedCreates": ["warrantyManagerUpns"],
      "liveVerified": ["procoreProject"],
      "blockers": [],
      "appliedCreates": []
    }
  ],
  "hasBlockingDrift": true,
  "listsMissing": false,
  "applied": false,
  "success": false,
  "nextCommands": [
    "Resolve wrong-type fields manually (no delete/recreate is performed by this script).",
    "pnpm tsx scripts/provision-my-projects-source-list-schema.ts --site-url https://hedrickbrotherscom.sharepoint.com/sites/HBCentral --json"
  ]
}
```

## Interpretation

- `apply=false` confirms no mutation path was executed.
- Wrong-type drift remains explicit under `targets[].blockers` and is not auto-remediated.
- `success=false` with blockers is expected until manual wrong-type remediation is completed.
