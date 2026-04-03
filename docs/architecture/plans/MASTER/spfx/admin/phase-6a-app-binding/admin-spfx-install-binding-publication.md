# Admin SPFx IT Control Center — Install/Bootstrap Binding Publication

**Prompt:** P6A-05 — Install Flow Integration and Binding Publication  
**Status:** Complete  
**Date:** 2026-04-03  
**Purpose:** Document how binding publication integrates into the existing setup/install flow, what data it derives from, what happens on partial failure, and how it interacts with checkpoints and verification.

---

## 1. Where binding publication fits in the setup/install flow

Binding publication occurs **after all 19 install steps complete successfully**, as a post-completion action before the final run envelope is returned. It is not an additional install step — it is a derived output of the install run.

```text
Step 1-4: Discovery
Step 5-13: Install (with 2 checkpoint pauses)
Step 14-19: Verification
────────────────────────────────────
RunCompleted audit event
Binding publication for managed apps  ← NEW (P6A-05)
Return final run envelope
```

### Two completion paths

The install flow has two paths that reach successful completion:

1. **`executeInstallRun()`** — initial run with no checkpoint pauses (all steps complete in one invocation)
2. **`resumeAfterCheckpoint()`** — resumed run after operator approves a checkpoint pause

Both paths call the same `publishBindingsAfterInstall()` helper after recording the RunCompleted audit event.

---

## 2. What data binding publication derives from

### Input source: `commandInput`

The install orchestrator receives a `commandInput: Record<string, unknown>` parameter that contains the operator-provided setup values. Binding publication extracts:

| Field | Source | Required |
|-------|--------|----------|
| `functionAppUrl` | `commandInput.functionAppUrl` | Yes — skips publication if absent |
| `apiAudience` | `commandInput.apiAudience` | Yes — skips publication if absent |
| `backendMode` | `commandInput.backendMode` | No — defaults to `'production'` |
| `allowBackendModeSwitch` | `commandInput.allowBackendModeSwitch` | No — defaults to `false` |

### Managed app registry

Binding publication targets a fixed set of managed apps:

```typescript
const MANAGED_APP_IDS = ['accounting', 'project-setup'] as const;
```

Each app receives the same binding values. Per-app differentiation (if needed) is a future concern.

### Publication metadata

| Field | Value |
|-------|-------|
| `publishSource` | `install-run:{runId}` — links binding to the originating run |
| `publishedBy` | The `IAdminActorContext` of the operator who initiated the install |
| `version` | Auto-incremented by the binding store (1 for new, +1 for updates) |

---

## 3. What happens on partial failure

### Missing required fields

If `functionAppUrl` or `apiAudience` is absent from `commandInput`, binding publication is **skipped entirely** with a console warning. The install run still completes successfully — binding publication is a post-completion concern, not a blocking install step.

### Per-app publication failure

If binding publication fails for one app (e.g., table storage error), the error is caught and logged. Publication proceeds for remaining apps. The install run still completes successfully.

### Binding store unavailable

If the entire binding store is unreachable, all publication attempts fail silently (each caught individually). The install run still completes successfully. The operator can manually publish bindings later via the binding API.

### Rationale for non-blocking behavior

Binding publication is **non-critical** to the install run itself. The install/bootstrap steps (deploy resources, create app registrations, install packages) are the core deliverable. Binding publication makes those outputs consumable by managed apps, but their absence does not invalidate the install. The operator can always publish bindings manually afterward.

---

## 4. How publication interacts with checkpoints

### Checkpoint steps in the install flow

The install flow has two checkpoint steps:
- Step 10: `grant-api-permissions` — requires operator approval before proceeding
- Step 12: `request-sharepoint-api-access` — requires operator approval before proceeding

### Publication timing relative to checkpoints

Binding publication occurs **after all steps (including post-checkpoint steps) complete**. Checkpoints pause the run, but binding publication only fires on the success path — after the final step completes, whether that was in the initial `executeInstallRun()` invocation or in `resumeAfterCheckpoint()`.

### Checkpoint rejection

If an operator rejects a checkpoint, the run transitions to Failed/Cancelled and binding publication does not fire.

---

## 5. How publication interacts with verification

### Post-install verification

Steps 14-19 are verification steps that check whether installed infrastructure is healthy. If a verification step fails:
- **Blocking verification step:** Run fails. No binding publication.
- **Non-blocking verification step:** Run continues. Binding publication still fires at completion.

### Binding verification

Binding verification (P6A-07) is a **separate concern** from install verification. Install verification checks infrastructure health. Binding verification compares published binding values to live state. They happen at different times and serve different purposes.

---

## 6. Audit trail

Each successful binding publication produces a `BindingPublished` audit event:

| Field | Value |
|-------|-------|
| `eventType` | `AdminAuditEventType.BindingPublished` |
| `domain` | `AdminDomain.AppBinding` |
| `actionKey` | `APP_BINDING_ACTION_KEYS.PUBLISH` |
| `runId` | The install run ID |
| `actor` | The operator who initiated the install |
| `summary` | `Published binding for {appId} v{version} from install run {runId}` |

Audit events are fire-and-forget — audit failure does not block binding publication or the install run.

---

## 7. Cross-references

| Document | Purpose |
|----------|---------|
| `phase-06/admin-spfx-install-orchestrator.md` | Install orchestrator — the base flow being extended |
| `phase-06/admin-spfx-install-checkpoint-lifecycle.md` | Checkpoint lifecycle — how pauses and resumes work |
| `phase-6a-app-binding/admin-spfx-app-binding-store-and-api.md` | Binding store — where published bindings are persisted |
| `phase-6a-app-binding/admin-spfx-app-binding-architecture.md` | Architecture — why publication is a control-plane concern |
