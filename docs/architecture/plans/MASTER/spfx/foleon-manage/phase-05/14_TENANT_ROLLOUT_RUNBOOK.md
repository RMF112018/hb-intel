# 14 — Tenant Rollout Runbook

## Phase 1 — Registry Preflight

1. Confirm target site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`.
2. Confirm registered app ID: `08c399eb-a394-4087-b859-659d493f8dc7`.
3. Confirm authentication method matches existing repo provisioning conventions.
4. Run registry provisioning dry-run.
5. Review planned fields, indexes, and seed records.

## Phase 2 — Registry Provisioning

1. Run live registry provisioning with seed mode.
2. Run registry validation.
3. Capture proof artifact.
4. Resolve any duplicate active keys or secret hygiene warnings.
5. Confirm no actual secrets are stored in SharePoint.

## Phase 3 — Foleon List Validation

1. Validate existing Foleon lists.
2. Update registry records with validated list GUIDs.
3. Mark validated list records `Valid` where appropriate.

## Phase 4 — Runtime Bridge Deployment

1. Implement registry reader/runtime config bridge.
2. Preserve page override compatibility.
3. Deploy package to app catalog.
4. Confirm hosted page reads registry values.

## Phase 5 — Foleon Manager Validation

1. Open `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Foleon-Manager.aspx`.
2. Confirm Manager does not show the backend API/token blocked state when registry config is valid.
3. Confirm Config tab shows source per value.
4. Confirm content read works.
5. Confirm write operation works for an authorized admin/marketing user.
6. Confirm unauthorized users are denied.

## Phase 6 — Homepage Embedded Lane Validation

1. Validate Project Spotlight lane.
2. Validate Company Pulse lane.
3. Validate Leadership Message lane.
4. Confirm lane config resolves from registry or documented page override.
5. Confirm preview/live/blocked state reporting is correct.

## Rollback

- Disable or deactivate registry values by setting `IsActive = false`.
- Restore page/webpart override values if emergency fallback is required.
- Revert SPFx package to prior known-good version if runtime bridge creates tenant issues.
- Do not delete registry list during rollback; preserve audit trail.
