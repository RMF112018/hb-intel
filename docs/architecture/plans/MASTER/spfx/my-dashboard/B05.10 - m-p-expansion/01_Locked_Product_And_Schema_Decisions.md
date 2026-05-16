# Locked Product and Schema Decisions

This document removes ambiguity before implementation begins.

---

## 1. Product name for the feature package

Use:

> **My Projects Multi-Platform Launch Expansion**

Do not continue describing the future state as “dual launch.”

---

## 2. Launch destinations

The My Projects launch menu must support exactly four destination types:

1. SharePoint
2. Procore
3. Autodesk BuildingConnected
4. Document Crunch

Menu order is locked to that sequence.

---

## 3. SharePoint field contract

### 3.1 New fields on `Projects`

| Internal Name | Display Name | Type | Required | Indexed |
|---|---|---:|---:|---:|
| `buildingConnectedUrl` | `Autodesk BuildingConnected Link` | `Text` | No | No |
| `documentCrunchUrl` | `Document Crunch Link` | `Text` | No | No |

### 3.2 Existing Projects field reused

| Domain Property | SharePoint Internal Name | Meaning |
|---|---|---|
| `projectStage` | `field_6` | Existing Projects project stage |

No new Projects `projectStage` column may be created.

### 3.3 New fields on `Legacy Project Fallback Registry`

| Internal Name | Display Name | Type | Required | Indexed |
|---|---|---:|---:|---:|
| `buildingConnectedUrl` | `Autodesk BuildingConnected Link` | `Text` | No | No |
| `documentCrunchUrl` | `Document Crunch Link` | `Text` | No | No |
| `projectStage` | `Project Stage` | `Text` | No | No |

---

## 4. Why new link columns are Text, not URL

Use SharePoint `Text` fields.

Reasoning:

- The repository already stores some launch-like strings as Text in relevant list contexts.
- The My Projects provider should validate launchability at read time.
- Text avoids introducing a second provisioning behavior path or legacy SharePoint URL-column edge cases.
- The UI needs a usable href string, not SharePoint URL-field metadata.

---

## 5. Read-model contract shape

Add the following fields to `MyProjectLinkItem`:

```ts
readonly buildingConnectedAction: {
  readonly state: 'available' | 'unavailable';
  readonly label: 'Open BuildingConnected' | 'BuildingConnected unavailable';
  readonly href?: string;
};

readonly documentCrunchAction: {
  readonly state: 'available' | 'unavailable';
  readonly label: 'Open Document Crunch' | 'Document Crunch unavailable';
  readonly href?: string;
};
```

Do not replace existing `sharePointAction` or `procoreAction`.

---

## 6. Warning codes

Add these warning codes:

```text
building-connected-launch-unavailable
building-connected-url-invalid
document-crunch-launch-unavailable
document-crunch-url-invalid
```

Behavior:

- Empty value:
  - launch-unavailable warning
- Non-empty but not a valid `http://` or `https://` URL:
  - url-invalid warning
  - launch-unavailable warning
- Valid URL:
  - no warning

The warning set must remain deduplicated through the existing warning-merging path.

---

## 7. Summary counts

Preserve existing summary properties. Do **not** repurpose or remove:

```text
dualLaunchReadyCount
sharePointReadyCount
procoreReadyCount
noSharePointLaunchCount
noProcoreLaunchCount
```

Add:

```text
buildingConnectedReadyCount
documentCrunchReadyCount
noBuildingConnectedLaunchCount
noDocumentCrunchLaunchCount
multiPlatformReadyCount
```

Metric semantics:

- `dualLaunchReadyCount`
  - SharePoint + Procore available
  - preserved for backward compatibility
- `multiPlatformReadyCount`
  - SharePoint + Procore + BuildingConnected + Document Crunch available

---

## 8. Source-of-record and merged-row rules

### 8.1 Project stage precedence

| Row Type | Stage Source |
|---|---|
| Projects-only | Projects stage |
| Merged | Projects stage if present, else Registry stage |
| Legacy-only | Registry stage |

### 8.2 External platform link precedence

| Row Type | BuildingConnected / Document Crunch Source |
|---|---|
| Projects-only | Projects |
| Merged | Projects only |
| Legacy-only | Registry |

Do not silently fall back to Registry links for merged rows when the Projects value is missing. Projects remains the authoritative current-project source for matched rows.

---

## 9. Frontend UX decisions

### 9.1 Masthead copy

Replace:

```text
Open assigned projects in SharePoint or Procore.
```

with:

```text
Open assigned projects across SharePoint, Procore, BuildingConnected, and Document Crunch.
```

### 9.2 Launch menu

The existing tile launch menu remains the interaction pattern. It must show four options in the locked order.

Available option:
- anchor
- `target="_blank"`
- `rel="noopener noreferrer"`

Unavailable option:
- disabled button
- `aria-disabled="true"`
- descriptive `aria-label`

### 9.3 Assistive destination hint

Replace the current per-destination hint pattern with a single consolidated hint that can scale across four platforms.

Recommended copy pattern:

```text
Some assigned projects do not currently have launch destinations for: SharePoint, Procore, BuildingConnected, Document Crunch.
```

Render only the destinations actually missing across the current item set.

---

## 10. Provisioning/readiness scope

The My Projects readiness flow should expand to the newly required operational source fields.

Expected readiness coverage:

### Projects
- 14 role-array Note fields
- `buildingConnectedUrl` Text
- `documentCrunchUrl` Text

### Legacy Registry
- 14 role-array Note fields
- `procoreProject` Text
- `buildingConnectedUrl` Text
- `documentCrunchUrl` Text
- `projectStage` Text

Projects `field_6` stage is reused, not provisioned by this descriptor, and therefore is not added to the create-plan descriptor. The agent may note its preexisting dependency in docs without making it a My Projects provisioning target.

---

## 11. No automatic data migration in this package

The package must not create a new backfill for BuildingConnected or Document Crunch values.

Provisioning creates columns. Product integration reads values when present. Data population is a separate business/data operation.

---

## 12. No backwards-incompatible API cleanup

Do not remove or rename existing public contract properties unless a compilation issue requires a follow-up compatibility layer. Additive changes are preferred.

---

## 13. Documentation naming

Update docs and copy that still refer to:

- “dual launch”
- “SharePoint or Procore” as if those are the only supported destinations

Use:

- “multi-platform launch”
- “SharePoint, Procore, BuildingConnected, and Document Crunch”

where the new behavior is live.
