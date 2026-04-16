# Prompt-04 — Close Hosted Instantiation and Load Proof for Article Publisher

## Objective
Close the remaining gap between “structurally valid package” and “fully functional SharePoint package” by making the hosted Publisher instantiation model explicit, implemented, and proven.

## Governing authority / required reference docs
- live repo truth in `main`
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/config/package-solution.json`
- `apps/hb-publisher/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- Microsoft Learn documentation on SPFx solution packaging, SharePoint asset provisioning, and feature-based provisioning
- current audit package findings on hidden-toolbox packaging closure

## Exact repo files and code paths to inspect
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-publisher/config/package-solution.json`
- `tools/build-spfx-package.ts`
- any SharePoint asset provisioning files already present or absent under the Publisher domain
- any Playwright / hosted validation surfaces that can be used for proof

## Exact issue to close
The Publisher webpart is packaged with `hiddenFromToolbox: true`, and the current package-solution metadata does not establish a first-class host-page or component-instance provisioning story. That leaves the package practically ambiguous on a fresh deployment.

## Required implementation outcome
Choose and implement one explicit supported operating model, then prove it works:
1. provision a fixed host page or component instance through SharePoint assets
2. provide an explicit supported admin insertion path with reproducible validation proof
3. or, if neither is acceptable, redesign the deployment model so the package can honestly be called fully functional on fresh deployment

You must not leave this as documentation-only ambiguity.

## Validation / proof-of-closure requirements
- prove how a fresh deployment reaches the Publisher surface
- prove the packaged Publisher loads in hosted SharePoint with the intended shell/runtime linkage
- capture closure evidence showing:
  - deployment/install step
  - host page / instance resolution step
  - successful runtime load step
  - failure diagnostics if prerequisites are intentionally missing
- if the chosen model relies on a pre-existing host page, prove where and how that page is created and governed

## Deliverables or closure docs to create
- implementation changes required for the chosen host model
- proof artifact(s) or hosted validation evidence
- a concise operator-facing note explaining the supported deployment/reachability path

## Explicit guardrails
- conduct an exhaustive scrub of the Publisher hosting and provisioning path before editing
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- do not make unrelated code changes
- do not solve this by weakening the “fully functional” standard
