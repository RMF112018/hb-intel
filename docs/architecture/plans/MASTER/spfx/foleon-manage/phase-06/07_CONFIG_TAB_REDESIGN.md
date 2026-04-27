# 07 — Config Tab Redesign

## Goal

Make Config feel like an admin console, not a raw debug dump.

## Default Structure

```text
Config
├─ System Health Summary
├─ Required Admin Actions
├─ Configuration Groups
└─ Diagnostics
```

## System Health Summary

Show grouped health cards:

| Group | Plain-language label |
|---|---|
| API consent/token state | API approval |
| backend URL / route | Backend connection |
| registry bridge/config source | Registry connection |
| list GUID bindings | SharePoint lists |
| write/read/sync split | Publishing and sync access |
| manifest/package | Package governance |

## Required Admin Actions

Rank blockers by operational impact.

Example order:

1. API approval missing.
2. Backend connection unavailable.
3. Registry missing/invalid required keys.
4. SharePoint list binding missing/invalid.
5. Route authorization blocked.
6. Write path blocked.
7. Sync path blocked.
8. Package/manifest mismatch.
9. Origin policy missing or unsafe.

Each item should include:

- plain title;
- impact;
- required action;
- owner/where to resolve;
- link/button to diagnostics if needed.

## Configuration Groups

### Registry

Show:

- status;
- source: registry / override / default / missing / blocked;
- missing keys count;
- invalid keys count;
- safe fingerprints where already supported.

Do not show raw registry values in primary UI.

### SharePoint Lists

Show:

- Content Registry;
- Homepage Placements;
- Interaction Events;
- Sync Runs.

For each:

- configured / missing / invalid / blocked;
- no raw GUIDs by default;
- diagnostics can show redacted fingerprint.

### Backend/API

Show:

- backend connection configured;
- API permission configured;
- API approval status;
- token setup;
- route authorization;
- read/write/sync split.

### Origin and Preview Policy

Show:

- accepted Foleon origins configured;
- preview policy;
- production URL-only requirements;
- unsafe origins blocked.

### Package Governance

Show:

- package version;
- manifest ID match;
- runtime bridge state;
- property-pane bridge state.

## Diagnostics

Collapsed by default.

Include:

- runtime binding proof;
- config source by key/value;
- readiness proof;
- registry source details;
- route authorization proof;
- package proof;
- copy diagnostic proof button.

## Raw Table Handling

The raw `Config Source by Value` table must not be the first visible object in Config.

Approved placement:

```text
Config → Diagnostics → Config source proof
```

## Label Rewrites

| Raw | Config UI |
|---|---|
| Registry valid | Registry connection — Ready |
| List bindings valid | SharePoint lists — Ready |
| API resource valid | API permission — Configured |
| Token acquisition blocked | API approval — Needs approval |
| Read path blocked | Read access — Blocked |
| Write path blocked | Publishing access — Blocked |
| Sync path blocked | Sync access — Blocked |

## Acceptance Criteria

- Admin can identify API approval, registry, backend, list, package/version, read/write/sync status in under five seconds.
- Required admin actions are ranked and plain-language.
- Raw proof tables are collapsed.
- Diagnostics are redacted and copyable.
- Split readiness states remain visible and are not collapsed into a single ready/blocked value.
