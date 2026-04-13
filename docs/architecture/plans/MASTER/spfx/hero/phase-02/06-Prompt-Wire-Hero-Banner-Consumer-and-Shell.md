# 06 — Prompt: Wire Hero Banner Consumer and Shell

Complete the integration wiring so the public Hero Banner and the admin app are both fully reachable through the actual build/runtime/package path.

## Mandatory operating instruction

**Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**

## Strict governing authority

Maintain strict compliance with:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Objective

Finish the runtime, shell, manifest, and packaging wiring for the public Hero Banner + Hero Banner Admin app.

Locked host facts:
- **Admin hosting page:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/SitePages/Homepage-Admin.aspx`
- **Controlled public homepage:** `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

## Required scope

At minimum inspect and update as needed:

- `apps/hb-webparts/src/mount.tsx`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- public and admin manifests
- any package/build orchestration seams required to include the new admin app
- any property-pane behavior that should now be removed, reduced, or reclassified because the admin app owns configuration

## Required checks

1. Public Hero Banner is still doctrine-compliant and purpose-fit.
2. Admin app is reachable through the real runtime path on the admin page.
3. Manifest IDs, aliases, and mount mappings are not drifted.
4. Build/package flow includes the new files/artifacts.
5. Any legacy property-pane configuration that is no longer the primary production path is either:
   - removed,
   - clearly fallback-only,
   - or explicitly documented as such.
6. The admin surface clearly controls the public Hero Banner hosted at the locked public URL.

## Hard rules

- Do not leave dead shell mappings.
- Do not leave misleading property-pane controls that imply the wrong production authoring model.
- Do not weaken existing homepage behavior elsewhere to force this integration.
- Do not violate doctrine for convenience.

## Validation requirements

Prove:
- mount wiring is correct
- manifests are correct
- property-pane behavior is intentional
- the build includes the new public/admin surfaces
- the hosted admin/control relationship is explicit and testable

## Required deliverable format

Return a concise closure report with:

1. Objective
2. Doctrine-Compliance Check
3. Runtime Wiring Summary
4. Shell / Manifest Changes
5. Property-Pane Posture
6. Build Inclusion Proof
7. Residual Risks
