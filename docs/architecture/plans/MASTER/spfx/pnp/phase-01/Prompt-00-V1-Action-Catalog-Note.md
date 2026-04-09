# Prompt 00 — V1 Action Catalog Note

Date: 2026-04-09  
Scope: Prompt-00 architecture lock for Phase-01 PnP Operations

## 1. Catalog purpose

This note locks the first-wave, high-value, read/export action catalog for the PnP Operations lane.

This is a contract lock, not implementation.

## 2. Action-key convention

Locked convention for v1 action keys:

`sharepoint:pnp:<action-slug>`

Examples:
- `sharepoint:pnp:site-starting-point-template-export`
- `sharepoint:pnp:list-schema-export`
- `sharepoint:pnp:page-layout-export`

## 3. V1 actions

## 3.1 Site starting-point template extraction

- **Action key:** `sharepoint:pnp:site-starting-point-template-export`
- **Intent:** extract a reusable starting-point structural snapshot for a target site.
- **Required inputs:**
  - `targetSiteUrl` (required)
  - `includeLists` (optional, default true)
  - `includeLibraries` (optional, default true)
  - `includePages` (optional, default true)
  - `includeFolderSkeleton` (optional, default true)
- **Outputs:**
  - `site-template.raw.json`
  - `site-template.normalized.json`
  - `site-template-report.md`
  - `artifact-manifest.json`
- **Risk level / execution mode:** low risk, read-only, asynchronous run lifecycle.
- **Expected run states:** queued -> running -> completed|failed.
- **Download artifact contract:** downloadable file set with manifest + metadata references from run evidence.

## 3.2 List schema extraction

- **Action key:** `sharepoint:pnp:list-schema-export`
- **Intent:** extract complete schema for one target list in one target site.
- **Required inputs:**
  - `targetSiteUrl` (required)
  - `listIdentity` (required; title, GUID, or server-relative list path)
  - `sampleItemValidation` (optional, default true, bounded sample)
- **Outputs:**
  - `<list-slug>-list-schema.raw.json`
  - `<list-slug>-list-schema.normalized.json`
  - `<list-slug>-schema-report.md`
  - `artifact-manifest.json`
- **Risk level / execution mode:** low risk, read-only, asynchronous run lifecycle.
- **Expected run states:** queued -> running -> completed|failed.
- **Download artifact contract:** file manifest includes counts (fields/views/content types) and optional sample-item file reference.

## 3.3 Page/layout extraction

- **Action key:** `sharepoint:pnp:page-layout-export`
- **Intent:** inventory modern pages and export section/control/webpart placement data.
- **Required inputs:**
  - `targetSiteUrl` (required)
  - `pageFilter` (optional; by name/path/prefix)
  - `includeWebPartRefs` (optional, default true)
- **Outputs:**
  - `page-layout.raw.json`
  - `page-layout.normalized.json`
  - `page-layout-report.md`
  - `artifact-manifest.json`
- **Risk level / execution mode:** low risk, read-only, asynchronous run lifecycle.
- **Expected run states:** queued -> running -> completed|failed.
- **Download artifact contract:** manifest includes per-page extraction status and produced files.

## 4. Shared output and status model

All v1 actions share these locked expectations:

1. produce machine-readable raw export,
2. produce normalized export suitable for downstream adapter/type generation,
3. produce concise markdown summary,
4. emit deterministic artifact manifest,
5. expose downloads through run-linked artifact metadata,
6. return clean failure states without secret leakage.

## 5. Explicit non-goals for v1 catalog

- No mutating SharePoint actions.
- No browser-side execution.
- No unconstrained action ingestion from free-form operator scripts.
- No bypass of admin-control-plane run/audit/evidence model.

## 6. Prompt linkage

This catalog is the required source for Prompt-01 UI catalog rendering and Prompt-02 backend dispatch wiring. Any new action added after Prompt-00 must be appended here first.
