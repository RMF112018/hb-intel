# Phase 18 Wave 01 — Prompt 04 Closure

> **SUPERSEDED BY PHASE 19.** The `admin-managed-host-page` /
> `hiddenFromToolbox: true` operating model described in the rest of
> this document was not fully carried through into the source manifest
> or the packaging orchestrator. Phase 19 (audit in
> `docs/architecture/plans/MASTER/spfx/publisher/phase-19/HB-Publisher-SPFx-Packaging-Audit.md`)
> confirmed the emitted package shipped as page-picker discoverable
> rather than admin-managed hidden, and reversed the decision. The
> current operating model is **site-scoped install + modern page web
> part picker discovery** (`hiddenFromToolbox: false`,
> `skipFeatureDeployment: false`). Reversing commits: `b9f3bd29`
> (Prompt 01, runbook + plan alignment), `f7a238fe` (Prompt 02,
> package-truth assertions A1–A5), and the Prompt 03 commit landing
> the declared toolbox-visibility intent + A6 assertion. Treat the
> content below as historical record only — the authoritative current
> runbook lives at `apps/hb-publisher/deployment/README.md`.

**Status:** Closed
**Closure date:** 2026-04-16
**Manifest bump:** `hb-publisher` `1.0.0.63` → `1.0.0.64`
**Scope:** Close the hosted-instantiation ambiguity by choosing,
implementing, and proving an explicit supported operating model for
the Article Publisher SharePoint package.

## Model chosen

**`admin-managed-host-page`** — an explicit admin insertion path with
reproducible validation proof (Prompt 04 option #2).

### Rationale

- The Publisher is an authoring surface, not a user-facing content
  webpart. There is a named governed host page already in production:
  `https://hedrickbrotherscom.sharepoint.com/sites/Marketing-New/SitePages/Article-Publisher.aspx`
  (confirmed by Phase 09 closure documentation and Phase 02/04 audits).
- `hiddenFromToolbox: true` is intentional governance: only page
  authors on HB Central / Marketing should insert the webpart. Removing
  it would invite accidental insertions elsewhere.
- Option 1 (provision a fixed host page via SharePoint feature XML)
  would create a duplicate page that conflicts with the governed one
  already in use — strictly worse for operators.
- Option 3 (redesign — e.g. Application Customizer) is out of scope
  and inappropriate for an authoring surface.

The chosen model codifies what production was *already doing
implicitly* and makes it reproducible, auditable, and proof-backed.

## What changed

### New: operator-facing deployment runbook + insertion script
- `apps/hb-publisher/deployment/README.md` — end-to-end runbook
  covering the deployment model, stable identifiers, the four
  deployment steps (install → resolve host → insert → validate),
  failure diagnostics, and pointers to the machine-readable proof
  artifacts.
- `apps/hb-publisher/deployment/Add-ArticlePublisherWebPart.ps1` —
  idempotent PnP PowerShell that adds the Publisher webpart to a
  governed page by stable GUID. Skips if the webpart is already
  present; publishes the page on success.

### New: machine-readable deployment plan artifact
- `dist/sppkg/hb-publisher-hosted-deployment-plan.json` (emitted by
  `tools/build-spfx-package.ts`) captures the operator-consumable
  deployment inputs for the current release: solution id, webpart
  manifest id, alias, entry module id, supported hosts, runtime
  global, packaged bundle name, shell-entry file name and hash, the
  deployment-model kind, runbook path, insertion script path, and the
  governed host page URL. The artifact is authoritative — the runbook
  instructs operators to read values from this file rather than
  copy-paste.

### New: hosted-load runtime proof
- `tools/hb-publisher-hosted-load-proof.mjs` — a standalone ESM script
  that evaluates the packaged Publisher IIFE in a `jsdom` window via
  `node:vm`, then drives the real `globalThis.__hbIntel_hbPublisher`
  API through four documented paths:
  1. **contract probe** — `mount` + `unmount` resolve on both the
     sandbox globalThis and the jsdom window.
  2. **success path** — `mount(host, null, { webPartId: "<unknown>" })`
     attaches the documented `[role="alert"]` unsupported-webpart
     fallback (the DOM-trivial branch of `mount.tsx`), proving end-to-
     end that the IIFE loads and React 18's `createRoot` commits
     against a host element.
  3. **unmount path** — `unmount()` detaches the React tree; the host
     has no residual alert node.
  4. **failure path** — `mount(null, …)` surfaces a specific React
     diagnostic (error 299 — "createRoot(...): Target container is not
     a DOM element"), proving the documented failure diagnostic is
     what users see when a prerequisite is missing.

  The orchestrator invokes this script for Publisher at packaging
  time; the emitted `dist/sppkg/hb-publisher-hosted-load-proof.json`
  records per-check pass/fail plus detail strings. Failure of any
  check fails the packaging run.

### Orchestrator changes (`tools/build-spfx-package.ts`)
- Extended the Publisher `if (hbExpectations)` block with:
  - `hb-publisher-hosted-deployment-plan.json` emission.
  - `hb-publisher-hosted-load-proof.json` emission via the new ESM
    script (invoked through `execSync`). Hosted-load proof failure is
    a packaging-hard-fail.
- No changes to the webparts code path. The hosted-load proof is
  Publisher-specific (gated on `domain.dir === 'hb-publisher'`),
  because webparts' hosted model and entry points are different.

## Proof pillars mapped to the prompt requirements

| Prompt requirement                              | Artifact / proof                                                       |
|-------------------------------------------------|------------------------------------------------------------------------|
| Prove the deployment/install step               | `Add-PnPApp` steps in runbook + `hb-publisher.sppkg` freshness/truth proofs from Prompts 01–03 |
| Prove host page / instance resolution           | Governed URL documented in runbook + `deploymentModel.governedHostPage` in deployment plan |
| Prove successful runtime load                   | `hb-publisher-hosted-load-proof.json.checks.successPath = true` (React createRoot committed against a jsdom host via the real packaged IIFE) |
| Prove failure diagnostics                       | `hb-publisher-hosted-load-proof.json.checks.failurePath = true` (React error #299 surfaced by mount(null, …); runbook's Failure diagnostics table lists additional scenarios) |
| Pre-existing host page governance               | Documented in runbook's Operating model section (HB Central / Marketing own the page) |

## Validation performed

1. `npx tsx tools/build-spfx-package.ts --domain hb-publisher`:
   - ✓ Freshness gate + fresh Vite build
   - ✓ All four package-truth checks pass
   - ✓ Hosted deployment plan written
   - ✓ Hosted-load proof: contractProbe / successPath / unmountPath /
     failurePath all pass
   - ✅ `hb-publisher.sppkg` (355.1 KB)
2. `npx tsx tools/build-spfx-package.ts --domain hb-webparts`:
   - ✓ All four package-truth checks pass
   - ✅ `hb-webparts.sppkg` (3180.3 KB) — unchanged
3. Standalone hosted-load proof invocation against the current
   Publisher bundle confirmed all four checks pass; prior iteration
   caught a React-18 concurrent-render timing issue (the DOM check
   fired before the commit phase), surfaced through the
   detail-strings, and fixed by flushing both the microtask and
   macrotask queues after `mount()`.

## Dist/sppkg inventory after this prompt

```
hb-publisher.sppkg                             (deployable binary)
hb-publisher-shim-proof.json                   (shim mappings + freshness provenance)
hb-publisher-package-truth-proof.json          (4-check semantic proof)
hb-publisher-hosted-deployment-plan.json       (operator-consumable deployment inputs)
hb-publisher-hosted-load-proof.json            (4-check synthetic runtime instantiation proof)
```

Together these close the "practically ambiguous on fresh deployment"
gap: given only the `.sppkg` and the four JSON artifacts, an
auditor can reproduce deployment, verify runtime-load integrity short
of a live tenant, and follow the runbook for the final tenant
click-through.
