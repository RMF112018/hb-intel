# Phase 20 Closure Note — Publisher Deployment Model Lock

## Chosen deployment model

**Tenant-wide-enabled + page-picker-discoverable** — the Article
Publisher ships as a tenant-wide SPFx solution (`skipFeatureDeployment:
true`) whose single `preconfiguredEntry` is visible in the modern page
web-part picker (`hiddenFromToolbox: false`). No governed host page,
no GUID insertion script, no per-site install.

SharePoint validation path:

1. Upload `.sppkg` to the tenant app catalog.
2. Select *"Enable this app and add it to all sites"* in the
   enablement modal (gated on the emitted
   `AppManifest.SkipFeatureDeployment="true"` attribute).
3. Edit any modern page on any site in the tenant.
4. Insert the Article Publisher through the web-part picker.
5. Confirm the authoring surface renders and
   `window.__hbIntel_hbPublisher.mount` is exposed.

## Audit stance — why Plan-Summary's governed-host-page default is superseded

`Plan-Summary.md` and `Audit-Summary.md` were authored when `main` was
at `hb-publisher 1.0.0.67`, a state that pointed at a governed
host-page model (hidden toolbox + `Add-ArticlePublisherWebPart.ps1`
insertion script + admin-managed host page). Prompt-01's **Required
audit stance** explicitly directs:

> Prefer executable/current repo truth over historical closure prose.

Between 1.0.0.67 and 1.0.0.73, four commits rewrote the executable
repo truth to the tenant-wide-enabled + picker-visible model:

- `b9f3bd29` (1.0.0.70) — align deployment runbook and plan emission
  with site-scoped install and page-picker discovery
- `f7a238fe` (1.0.0.71) — add package-truth assertions A1–A5
  (version / ProductID / feature id / deployment model / discovery
  posture)
- `934c617e` (1.0.0.72) — lock declared toolbox visibility intent and
  assert it against source (A6)
- `31d19f9e` (1.0.0.73) — restore tenant-wide enablement posture and
  add A7 `SkipFeatureDeployment` assertion

At 1.0.0.73, `apps/hb-publisher/deployment/Add-ArticlePublisherWebPart.ps1`
does not exist, the runbook describes only the tenant-wide-enablement
+ picker flow, and the orchestrator fails packaging if any source
attribute drifts from that model. Plan-Summary's governed-host-page
default is therefore **superseded by newer executable repo truth**,
per Prompt-01's own audit stance.

## Artifacts that enforce the locked model

- `apps/hb-publisher/config/package-solution.json`
  — `skipFeatureDeployment: true`, `isDomainIsolated: false`,
  `includeClientSideAssets: true`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
  — `preconfiguredEntries[0].hiddenFromToolbox: false`
- `apps/hb-publisher/deployment/README.md`
  — Phase 20 lock header + tenant-wide-enablement + picker validation
  steps
- `tools/build-spfx-package.ts`
  - `HB_PUBLISHER_TOOLBOX_VISIBILITY_INTENT` constant frozen to
    `page-picker-discoverable`
  - `derivePublisherDiscoveryPosture`, `deriveDeploymentModelKind`
  - Package-truth assertions A1–A7 inside `buildHbPackageTruthProof`:
    - A1 emitted `AppManifest.Version` == source solution.version
    - A2 emitted `ProductID` == source solution.id
    - A3 feature XML present for declared feature id
    - A4 emitted `deploymentModel.kind` derived from source
      `skipFeatureDeployment`
    - A5 packaged `preconfiguredEntries[0].hiddenFromToolbox` ==
      source
    - A6 declared `HB_PUBLISHER_TOOLBOX_VISIBILITY_INTENT` matches
      source
    - A7 emitted `AppManifest.SkipFeatureDeployment` attribute ==
      source `skipFeatureDeployment`

## Emitted proof artifacts

- `dist/sppkg/hb-publisher.sppkg` — deployable binary
- `dist/sppkg/hb-publisher-package-truth-proof.json` — A1–A7 results
- `dist/sppkg/hb-publisher-hosted-deployment-plan.json` — machine-
  readable spec including `deploymentModel.kind` and
  `toolboxVisibility`
- `dist/sppkg/hb-publisher-shim-proof.json` — shim mappings +
  freshness
- `dist/sppkg/hb-publisher-hosted-load-proof.json` — synthetic
  mount/unmount proof

## Reversal policy

Any future flip to `skipFeatureDeployment: false` or
`hiddenFromToolbox: true` must:

1. supersede Phase 19 Prompt-01 and Phase 20 Prompt-01 with a new
   deployment-model decision,
2. rewrite `apps/hb-publisher/deployment/README.md` to match the new
   model,
3. update `HB_PUBLISHER_TOOLBOX_VISIBILITY_INTENT` and the
   corresponding assertions in `tools/build-spfx-package.ts`,
4. reintroduce (or explicitly retire) `Add-ArticlePublisherWebPart.ps1`
   as appropriate.

Until such a reversal lands, `main` supports one deployment model and
one SharePoint validation path.

## Rebuild evidence

Phase 20 was closed at solution version `1.0.0.74` with a clean
Publisher packaging run:

- packaging run id: `2026-04-16T15:12:31.493Z-90cfd912`
- generated at: `2026-04-16T15:12:47.647Z`
- emitted `hb-publisher.sppkg` at `dist/sppkg/hb-publisher.sppkg`
  (≈355 KB)
- `deploymentPostureAlignment.pass = true` with A1–A7 all PASS in
  `dist/sppkg/hb-publisher-package-truth-proof.json`
- packaged `AppManifest.xml` carries `Version="1.0.0.74"`,
  `SkipFeatureDeployment="true"`, `IsDomainIsolated="false"`,
  `ProductID="c7b2a144-9d3e-4a71-8e2a-6f9d3c1b7e42"`
- packaged feature XML
  `feature_b41e97f8-3c2d-4a59-9e12-d8a7f2b6c901.xml` has
  `Version="1.0.0.74"` and `Scope="Web"`
- packaged component manifest for webpart
  `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10` carries
  `preconfiguredEntries[0].hiddenFromToolbox: false`

A fresh auditor reading `apps/hb-publisher/deployment/README.md` and
inspecting `dist/sppkg/hb-publisher.sppkg` now reaches one
unambiguous answer about how Publisher is meant to surface in
SharePoint: **tenant-wide-enabled + page-picker-discoverable**.
