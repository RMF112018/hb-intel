# Supporting 04 — Exact Copy Library and DOM Markers

## Header labels

```text
Action Queue
Completed
```

## Completed empty copy

```text
No completed Adobe Sign agreements were found in the last 30 days.
```

## Completed unavailable copy

```text
Recently completed Adobe Sign agreements are temporarily unavailable.
```

## Completed partial copy

```text
Some completed agreement details may be incomplete. Showing the latest available Adobe Sign results.
```

Use only when completed source status is `partial`.

## Completed metric label

```text
Completed in last 30 days
```

## Completed row date labels

```text
Completed {formatted-date}
Updated {formatted-date}
```

## DOM markers

### Header toggle root

```text
data-adobe-sign-card-view-toggle=""
```

### Each view control

```text
data-adobe-sign-card-view="action-queue"
data-adobe-sign-card-view="completed"
```

### Selected state

```text
data-adobe-sign-card-view-selected="true"
data-adobe-sign-card-view-selected="false"
```

### Card root active view

```text
data-adobe-sign-active-view="action-queue"
data-adobe-sign-active-view="completed"
```

### Completed panel state

```text
data-adobe-sign-completed-panel-state="idle"
data-adobe-sign-completed-panel-state="loading"
data-adobe-sign-completed-panel-state="available-empty"
data-adobe-sign-completed-panel-state="available-items"
data-adobe-sign-completed-panel-state="partial"
data-adobe-sign-completed-panel-state="source-unavailable"
data-adobe-sign-completed-panel-state="backend-unavailable"
data-adobe-sign-completed-panel-state="authorization-required"
data-adobe-sign-completed-panel-state="configuration-required"
data-adobe-sign-completed-panel-state="principal-unresolved"
```
