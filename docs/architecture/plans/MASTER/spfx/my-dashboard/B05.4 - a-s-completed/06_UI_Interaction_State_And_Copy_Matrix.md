# 06 — UI Interaction, State, and Copy Matrix

## Header control posture

### Overall layout

```text
Adobe Sign
Action Queue    Completed
```

### Active pending

```text
Action Queue    Completed
^^^^^^^^^^^^
selected / larger / stronger
```

### Active completed

```text
Action Queue    Completed
                ^^^^^^^^^
                selected / larger / stronger
```

## Header-toggle requirements

- Must occupy the existing card title/sub-head region.
- Must not add a separate body-level tabs row.
- Must not rename the card to `Agreements`.
- Must preserve the `Adobe Sign` eyebrow.
- Must expose stable data markers for tests.

## Required DOM markers

```text
data-adobe-sign-card-view-toggle
data-adobe-sign-card-view="action-queue"
data-adobe-sign-card-view="completed"
data-adobe-sign-card-view-selected="true|false"
data-adobe-sign-active-view="action-queue|completed"
data-adobe-sign-completed-panel-state="idle|loading|available-empty|available-items|partial|source-unavailable|backend-unavailable|authorization-required|configuration-required|principal-unresolved"
```

## Toggle visibility matrix

| Overall Adobe card state | Header toggle visible? | Reason |
|---|---:|---|
| loading | No | Whole card unresolved |
| authorization-required | No | Connection required first |
| configuration-required | No | Admin config required first |
| principal-unresolved | No | Identity problem first |
| source-unavailable | No | Source cannot be queried |
| backend-unavailable | No | Backend cannot be queried |
| partial | Yes | Data-capable, but warning applies |
| available-empty | Yes | Pending empty but completed may contain rows |
| available-items | Yes | Both views relevant |

## Default view matrix

| Page state | Active view |
|---|---|
| Fresh page load | `action-queue` |
| Toggle `Completed` | `completed` |
| Toggle back | `action-queue` |
| Browser refresh | `action-queue` |

## Completed fetch matrix

| Event | Completed request behavior |
|---|---|
| Page load | No completed request |
| First `Completed` click | Fetch |
| Return to `Action Queue` | No completed refetch |
| Second `Completed` click | Reuse in-memory envelope |
| Page refresh | reset, no completed data retained |

## Action Queue view copy

Preserve existing pending copy.

### Empty

```text
No Adobe Sign agreements currently need your action.
```

## Completed view copy

### Empty

```text
No completed Adobe Sign agreements were found in the last 30 days.
```

### Scoped unavailable

```text
Recently completed Adobe Sign agreements are temporarily unavailable.
```

### Partial

```text
Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.
```

Use only when the completed envelope is explicitly partial.

## Metrics

### Action Queue selected

Show existing:

- Pending agreements
- Signature actions
- Review actions

### Completed selected

When populated:

- Completed in last 30 days

When empty:

- hide completed metric strip.

## Completed row display

Each row prioritizes:

1. agreement name;
2. truthful date label:
   - `Completed {date}` when completion timestamp exists;
   - `Updated {date}` when only modified timestamp exists;
3. sender label when available;
4. `Open in Adobe Sign` link only when supplied by read model.

## Prohibited row copy

Do not render:

- `You completed this`;
- `You signed this`;
- `Action completed by you`;
- `Completed approval`;
- any claim about actor-of-completion unless the provider contract directly proves it.
