# 05 — Target Manager UX and Workflow

## Objective

Turn Foleon Manager into the administrative and marketing-facing control surface for homepage Foleon content and runtime configuration.

## UX Principles

- Marketing users should not edit raw SharePoint lists.
- Admin users should not have to inspect browser console proof to understand readiness.
- The Manager should clearly distinguish live, preview, blocked, and empty states.
- The Manager should explain cause and remediation for blocked states.
- Configuration should be validated before publishing content to homepage lanes.
- Admin-only configuration must not expose secrets.

## Shell Layout

Top-level layout:

```text
Foleon Manager
├── Header
│   ├── Environment badge
│   ├── Runtime readiness badge
│   ├── Last sync badge
│   └── Admin diagnostics toggle
├── Tabs
│   ├── Homepage Foleon Content
│   └── Config
└── Status / toast region
```

## Tab 1 — Homepage Foleon Content

Audience: Marketing users, content owners, approved publishers.

Primary workflow:

1. Select lane:
   - Project Spotlight
   - Company Pulse
   - Leadership Message
2. Review current active edition.
3. Add or edit content record.
4. Validate URL, origin, embed eligibility, display dates, audience, active edition uniqueness.
5. Assign homepage placement.
6. Preview final lane state.
7. Publish when checklist passes.
8. Archive old edition if needed.

## Tab 2 — Config

Audience: Admins, IT, platform owners.

Primary workflow:

1. Review runtime readiness.
2. Review SharePoint list bindings.
3. Review backend API/token readiness.
4. Review Foleon API sync readiness.
5. Review origin/security policy.
6. Review package/manifest governance.
7. Validate configuration.
8. Store non-secret config in registry when available.
9. Use page-property override only as bootstrap or break-glass path.

## Role-Based UX

### Marketing

Can:
- create/edit draft content;
- update preview copy and audience;
- request validation;
- set display windows;
- stage active edition;
- publish if role allows publishing.

Cannot:
- edit backend URL;
- edit API resource;
- edit list GUIDs;
- edit accepted origins;
- toggle production preview policy unless explicitly granted.

### Admin

Can:
- edit config;
- validate list bindings;
- run provisioning/validation;
- inspect runtime proof;
- view backend safe config;
- manage registry entries;
- approve production URL policy.

## State Model

Each lane should display one of:

- `Live`
  - active published homepage-eligible content passes reader gate.
- `Preview`
  - sample or staged content is intentionally shown and labeled as preview.
- `Blocked`
  - content exists but violates a hard gate.
- `Empty`
  - no eligible content and no preview fallback available.
- `Config incomplete`
  - lane cannot resolve list/API/runtime prerequisites.

## Target Components

Likely new or refactored components:

- `ManageTabs.tsx`
- `HomepageFoleonContentTab.tsx`
- `FoleonConfigTab.tsx`
- `LaneStatusOverview.tsx`
- `LaneContentCard.tsx`
- `ActiveEditionControl.tsx`
- `ContentRegistryTable.tsx`
- `ContentEditorDrawer.tsx`
- `PlacementAlignmentPanel.tsx`
- `PublishReadinessChecklist.tsx`
- `RuntimeReadinessPanel.tsx`
- `SharePointListBindingsPanel.tsx`
- `BackendApiReadinessPanel.tsx`
- `OriginSecurityPolicyPanel.tsx`
- `PackageGovernancePanel.tsx`
- `ConfigRegistrySourcePanel.tsx`
- `AdminDiagnosticsPanel.tsx`

## Acceptance Criteria

- Manager presents two tabs.
- Marketing users can complete lane content workflow without raw list editing.
- Admins can see exactly why the Manager is read-only or write-enabled.
- Config tab remains available when backend writes are blocked.
- UI uses current HB/SPFx doctrine and avoids generic admin-console styling.
