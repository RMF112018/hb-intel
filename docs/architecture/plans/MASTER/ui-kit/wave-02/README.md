# UI Kit Governance Cleanup Prompt Package

## Purpose

This package instructs a local coding agent to comprehensively clean up and align UI governance under `docs/reference/ui-kit/`, incorporate the brand governance files under `docs/reference/brand/`, and establish a clear standard for future HB Intel UI work.

## Primary Objective

Create a unified UI governance system that guides development toward a product experience that feels like:

- a polished executive command center;
- a premium custom-built HB product;
- a high-density project controls cockpit where appropriate;
- a practical construction operations platform rather than a generic enterprise dashboard.

The governance must preserve reuse of common primitives. Do not reinvent buttons, fields, tables, badges, dialogs, pickers, or common controls unless a documented exception is justified.

## Brand Package Context

The HB brand kit and associated brand governance files have been saved under:

```text
docs/reference/brand/
```

Expected governance files:

```text
docs/reference/brand/README.md
docs/reference/brand/BRAND-ASSET-INVENTORY.md
docs/reference/brand/BRAND-USAGE-GOVERNANCE.md
```

Expected source package location, or equivalent path discovered by repo audit:

```text
docs/reference/brand/source/HB-Brand-Guide.zip
```

Stable implementation-ready logo assets should be curated into:

```text
packages/ui-kit/src/branding/assets/
packages/ui-kit/src/branding/index.ts
```

Approved font files should be placed only after internal-use/license review, preferably under a UI-kit-controlled font path such as:

```text
packages/ui-kit/src/branding/fonts/
```

or, if repo conventions support theme-level font serving:

```text
packages/ui-kit/src/theme/fonts/
```

Do not expose, paste, or redistribute font files in prompt outputs, documentation packages, external artifacts, or generated zips.

## Prompt Sequence

1. `Prompt-01-Governance-Inventory-and-Scope-Lock.md`
2. `Prompt-02-Doctrine-Index-and-Supersession-Cleanup.md`
3. `Prompt-03-SPFx-Full-Page-Widget-Overlay-and-Scoring-Model.md`
4. `Prompt-04-Brand-Governance-Docs-Reconciliation.md`
5. `Prompt-05-Curated-Web-Ready-Brand-Assets.md`
6. `Prompt-06-Font-Package-Placement-and-Theme-Governance.md`
7. `Prompt-07-Pattern-Standards-and-PCC-Layout-Governance.md`
8. `Prompt-08-Component-Reference-Hygiene.md`
9. `Prompt-09-Validation-Closeout-and-Agent-Usage-Guide.md`

Supporting files:

- `Plan-Summary.md`
- `Interview-Decisions.md`
- `Repo-Truth-Audit-Targets.md`
- `Governance-Target-File-Map.md`
- `Validation-Matrix.md`

## Desired Final State

After execution, developers and agents should know:

- which doctrine governs each runtime;
- what applies to homepage surfaces vs full-page SPFx apps/widgets vs PWA routes;
- how flagship/benchmark acceptance is scored and evidenced;
- how brand assets and fonts are governed;
- where curated web-ready logos live;
- how app code should import logos and fonts;
- how PCC-style command-center / cockpit layouts are governed;
- how component docs relate to governing doctrine;
- what constitutes a hard-stop UI governance failure.
