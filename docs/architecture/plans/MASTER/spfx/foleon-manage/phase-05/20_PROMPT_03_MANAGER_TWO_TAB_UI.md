# Prompt 03 — Implement Manager Two-Tab UI

You are working in the `RMF112018/hb-intel` repo on the live `main` branch unless instructed otherwise.

Do not re-read files that are still within your current context or memory unless you need to verify a contradiction, line number, or current repo truth.

## Objective

Implement the Foleon Manager two-tab shell after registry provisioning and runtime readiness remediation.

Tabs:

```text
Homepage Foleon Content
Config
```

The Config tab must be registry-aware. It must not create a new isolated configuration store.

## Required Preconditions

- Registry exists or blocker documented.
- Registry reader/runtime bridge exists.
- Manager load/write-readiness blocker has been remediated or documented.

## Files to Inspect

```text
apps/hb-intel-foleon/src/pages/manage/**
apps/hb-intel-foleon/src/components/**
apps/hb-intel-foleon/src/types/foleon-management.types.ts
apps/hb-intel-foleon/src/services/FoleonManagementApi.ts
apps/hb-intel-foleon/src/runtime/**
apps/hb-intel-foleon/src/pages/__tests__/**
docs/reference/spfx-surfaces/**
docs/reference/ui-kit/doctrine/**
```

## Target UX

### Homepage Foleon Content Tab

Include lane status overview, Project Spotlight lane card, Company Pulse lane card, Leadership Message lane card, content registry table, create/edit drawer, placement alignment, active edition controls, validation warnings, preview/live/blocked state indicator, publish readiness checklist, and sync status.

### Config Tab

Include runtime readiness, registry source readiness, SharePoint list bindings, Foleon API settings, origin/security policy, package/manifest governance, backend/API token readiness, homepage embedded configuration, environment and registry source, validation results, and admin-only diagnostics.

## Role Clarity

Marketing users should focus on content and placements. Admins should manage configuration, validation, runtime proof, package governance, and safe registry-backed settings. Do not expose secrets.

## Required UI Behavior

- Display configuration source per value: `Override`, `Registry`, `Default`, `Missing`.
- Display validation status per value.
- Clearly label preview fallback/sample content.
- Provide actionable blocked-state messages.
- Preserve existing Manager workflows while reorganizing UI.
- Avoid raw SharePoint list editing as the normal user workflow.

## Testing Requirements

Add or update tests for tab rendering, default selected tab, Config tab source labels, Homepage Foleon Content tab lane cards, blocked readiness shown in Config tab, marketing/admin role copy separation, and no secret values rendered.

## Validation Commands

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
```

## Final Response Required From Agent

Return:

```text
Summary:
Changed Files:
UX Structure Implemented:
Registry-Aware Config Behavior:
Tests Added:
Commands Run:
Validation Results:
Unresolved Follow-Up:
Commit Message:
```
