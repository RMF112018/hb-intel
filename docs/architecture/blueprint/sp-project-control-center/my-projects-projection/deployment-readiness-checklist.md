# My Projects Projection — Deployment Readiness Checklist

> Classification: **Canonical Current-State** operator-facing checklist.
> Active architecture authority: B05.16 SharePoint storage redirection package.
> Audience: operator running deployment + post-permission validation.
> Read mode default: `legacy` until controlled cutover.

## How to use this checklist

Run it twice:

1. **Pre-deployment** — confirm SharePoint storage/control lists, identity, and app settings are ready before enabling projection processing.
2. **Post-permission, pre-cutover** — confirm `Sites.Read.All` is granted and the subsystem is ready for live subscription + delta validation.

---

## 1. SharePoint storage/control readiness

| Artifact | Expected target | Verification |
| --- | --- | --- |
| MyDashboard storage site | `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard` | Site URL exactly matches target; no fallback site accepted. |
| Required projection lists | 7 total (`Registry`, `Source Sync State`, `Subscription State`, `Pending Work`, `Control State`, `Runs`, `Sync Failures`) | Provision/verify scripts report all lists present with expected schema and index/uniqueness posture. |
| Registry provisioning | `scripts/provision-my-projects-registry-schema.ts` | Dry-run + apply results show no blocking drift. |
| Registry verification | `scripts/verify-my-projects-registry-schema.ts` | Readiness report returns ready=true after provisioning. |

Authority: B05.16 docs `02_*`, `03_*`, `resources/My_Projects_SharePoint_Storage_Schema.json`, and runbooks.

---

## 2. Identity and permission readiness

Confirm the Function App UAMI can:

| Scope | Why |
| --- | --- |
| SharePoint target sites/lists | Read/write projection registry and operational control rows. |
| Microsoft Graph application lane (`Sites.Read.All`) | Create/renew subscriptions and execute delta reads for Projects + Legacy Registry source lists. |

Verification sources:

- B05.16 `runbooks/Runbook_03_Permissions_And_Configuration_Preflight.md`
- B05.16 `resources/Environment_Settings_Matrix.md`

---

## 3. Function App settings readiness

Use B05.16 environment matrix as source of truth.

Active required settings include:

- `HBC_MY_PROJECTS_PROJECTION_ENABLED`
- `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE`
- SharePoint source/registry site URLs + list titles
- Graph webhook settings (`HBC_MY_PROJECTS_PROJECTION_NOTIFICATION_URL`, `HBC_MY_PROJECTS_PROJECTION_GRAPH_CLIENT_STATE`)
- Pending-work processor timer settings (`..._PENDING_WORK_PROCESSOR_TIMER_ENABLED`, `..._PENDING_WORK_PROCESSOR_TIMER_SCHEDULE`)
- Subscription/drift/purge timer gates and schedules

Quarantined compatibility settings (not active MVP blockers):

- `HBC_MY_PROJECTS_PROJECTION_TABLE_ACCOUNT_URL`
- `HBC_MY_PROJECTS_PROJECTION_SERVICEBUS_FQDN`
- `HBC_MY_PROJECTS_PROJECTION_QUEUE_NAME`
- `MyProjectsProjectionServiceBus__*`
- Projection table-name settings (`..._SUBSCRIPTIONS_TABLE`, `..._DELTA_STATE_TABLE`, `..._LEASES_TABLE`, `..._RUNS_TABLE`)

Prompt 04 active-state redirect note:

- Runtime operational repositories now use SharePoint-backed state lists (`Source Sync State`, `Subscription State`, `Pending Work`, `Control State`, `Runs`, `Sync Failures`) as the active persistence/control plane.
- Webhook ingress writes deterministic `Pending Work` rows and the 1-minute pending-work timer is the active worker lane.
- Azure Table state repositories and Service Bus sender/queue-trigger seams are superseded/quarantined compatibility artifacts and are not required active MVP blockers.

Prompt 07 seed/rebuild redirect note:
- Seed/rebuild control lease persistence uses SharePoint `Control State`.
- Seed/rebuild run ledger persistence uses SharePoint `Runs`.
- Seed/rebuild failure diagnostics persist in SharePoint `Sync Failures`.
- Seed/rebuild baseline initialization persists in SharePoint `Source Sync State`.

## 3.1 Storage provisioning/verifier scripts

Use the seven-list MyDashboard storage scripts before cutover:

- package-required names:
  - `scripts/provision-my-dashboard-my-projects-projection-storage.ts`
  - `scripts/verify-my-dashboard-my-projects-projection-storage.ts`
- repo-convention aliases (same implementation path):
  - `scripts/provision-my-projects-projection-storage.ts`
  - `scripts/verify-my-projects-projection-storage.ts`

---

## 4. `readMode` safety check

Before deployment and until parity sign-off:

| Setting | Required value |
| --- | --- |
| `HBC_MY_PROJECTS_PROJECT_LINKS_READ_MODE` | `legacy` (or unset if environment default resolves to legacy) |

Cutover to `projection` remains an explicit operator action after validation evidence is complete.

---

## 5. `Sites.Read.All` gate status

`Sites.Read.All` is required for:

1. Graph subscription create/renew.
2. Graph delta reads.

Operator capture:

```text
[ ] Sites.Read.All status:  <Not requested | Pending | Granted>
[ ] Date noted:             <YYYY-MM-DD>
[ ] Granting admin:         <UPN, if Granted>
```

---

## 6. Superseded-setting disposition check

Before marking readiness complete, verify no deployment instruction still presents Azure Table/Service Bus settings as active MVP blockers.

Pass criteria:

- projection-enabled config can validate without Table/ServiceBus env keys;
- docs classify those settings as superseded/quarantined compatibility seams;
- operator runbooks use SharePoint-backed active target terminology.

---

## 7. Closeout statement

When sections 1–6 pass and `Sites.Read.All` is granted:

> Ready for post-permission live Graph validation and controlled read-mode cutover sequencing.

## Related references

- `parity-evidence.md`
- `telemetry-evidence.md`
- `runtime-degradation-reference.md`
- B05.16 package docs under `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.16 - m-p-sp-cache/`

## Prompt 10 Gate Status (2026-05-19)

- Proof-gate execution record: `docs/architecture/plans/MASTER/spfx/my-dashboard/B05.16 - m-p-sp-cache/resources/Prompt_10_Closeout_Evidence.md`
- Current decision: **Not Ready**.
- Current blockers:
  - local `@hbc/functions` typecheck fails on unrelated active drift in `adobe-sign-webhook-receiver-routes.ts`;
  - provisioning verify/apply lane returned `401` in the current execution lane;
  - hosted live proof sequence (Runbook 04) not yet captured in authorized operator lane.
