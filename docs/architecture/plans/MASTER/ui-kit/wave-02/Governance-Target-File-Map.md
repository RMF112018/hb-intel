# Governance Target File Map

## Add or Update — Governance Root

```text
docs/reference/ui-kit/README.md
docs/reference/ui-kit/GOVERNANCE-MAP.md
docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md
```

## Add or Update — Doctrine

```text
docs/reference/ui-kit/doctrine/README.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md
docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md
docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md
docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md
```

## Add — Standards and Patterns

```text
docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md
docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md
docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md
docs/reference/ui-kit/standards/SPFx-Host-Runtime-Validation-Standard.md
docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md
docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md
```

## Add or Update — Brand Governance

```text
docs/reference/brand/README.md
docs/reference/brand/BRAND-ASSET-INVENTORY.md
docs/reference/brand/BRAND-USAGE-GOVERNANCE.md
docs/reference/brand/source/HB-Brand-Guide.zip
```

## Update — UI Kit Brand Registry

```text
packages/ui-kit/src/branding/index.ts
packages/ui-kit/src/branding/assets/**
```

## Add or Update — UI Kit Font Governance

Preferred, pending repo convention and license review:

```text
packages/ui-kit/src/branding/fonts/**
packages/ui-kit/src/theme/fonts/**
packages/ui-kit/src/theme/index.ts
packages/ui-kit/src/theme/*.ts
packages/ui-kit/src/theme/*.css
```

The agent must determine the repo-correct theme/font location before writing.

## Component Reference Docs

All direct component reference docs under `docs/reference/ui-kit/`, including `Hbc*.md`, `DashboardLayout.md`, `WorkspacePageShell.md`, and similar files, should receive a governance-status header unless already classified.

## Do Not Touch Unless Explicitly Authorized

```text
apps/** product source
backend/**
infra/**
.github/**
SPFx package-solution files
.sppkg files
```
