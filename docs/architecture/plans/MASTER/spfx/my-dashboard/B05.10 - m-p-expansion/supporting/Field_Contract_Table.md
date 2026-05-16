# Field Contract Table

## SharePoint source-list additions

### Projects

| Internal Name | Display Name | Type | Required | Indexed | Provisioned by this package |
|---|---|---:|---:|---:|---|
| `buildingConnectedUrl` | Autodesk BuildingConnected Link | Text | No | No | Yes |
| `documentCrunchUrl` | Document Crunch Link | Text | No | No | Yes |

Existing, reused, not newly provisioned:

| Domain Property | Existing SP Internal Name | Used for |
|---|---|---|
| `projectStage` | `field_6` | My Projects stage display for Projects-backed rows |

### Legacy Project Fallback Registry

| Internal Name | Display Name | Type | Required | Indexed | Provisioned by this package |
|---|---|---:|---:|---:|
| `buildingConnectedUrl` | Autodesk BuildingConnected Link | Text | No | No | Yes |
| `documentCrunchUrl` | Document Crunch Link | Text | No | No | Yes |
| `projectStage` | Project Stage | Text | No | No | Yes |

---

## Read-model action additions

```ts
buildingConnectedAction: {
  state: 'available' | 'unavailable';
  label: 'Open BuildingConnected' | 'BuildingConnected unavailable';
  href?: string;
};

documentCrunchAction: {
  state: 'available' | 'unavailable';
  label: 'Open Document Crunch' | 'Document Crunch unavailable';
  href?: string;
};
```

---

## Warning code additions

```text
building-connected-launch-unavailable
building-connected-url-invalid
document-crunch-launch-unavailable
document-crunch-url-invalid
```

---

## Summary additions

```text
buildingConnectedReadyCount
documentCrunchReadyCount
noBuildingConnectedLaunchCount
noDocumentCrunchLaunchCount
multiPlatformReadyCount
```

---

## Source precedence

| Item Source | Project Stage | BuildingConnected | Document Crunch |
|---|---|---|---|
| Projects-only | Projects | Projects | Projects |
| Merged | Projects, fallback Registry only if missing | Projects only | Projects only |
| Legacy-only | Registry | Registry | Registry |
