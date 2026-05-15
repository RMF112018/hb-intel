# 06 — Target Copy Library

## Purpose

This file provides exact production copy to reduce implementation ambiguity and prevent developer-authored filler language from reintroducing the wrong posture.

---

# 1. Page Header Copy

```text
Eyebrow:
My Dashboard

Title:
My Work

Support line:
Your personal launch pad for project access and work requiring attention.
```

---

# 2. My Projects Copy

## Module identity

```text
Eyebrow:
My Work

Title:
My Projects

Support line:
Open the projects you are assigned to in SharePoint or Procore.
```

## Loading

```text
Loading your project links…
```

## Empty

```text
No assigned projects were found for your current project-role assignments.
```

## Partial / launch destination verification warning

```text
Some launch destinations could not be fully verified. Available project links are shown below.
```

## Principal unresolved

```text
We could not confirm your project assignment identity for this view.
```

## Source unavailable

```text
Project launch sources are temporarily unavailable. Try again shortly.
```

## Backend unavailable

```text
Project links are temporarily unavailable while the My Dashboard service is unreachable.
```

## Disclosure labels

```text
View all My Projects
Show fewer
```

## Action labels

Preserve the existing action labels where repo truth already owns them:
- SharePoint action label from the read model/action definition
- Procore label: `Open Procore`

Do not change source URLs or invent new launch destinations.

---

# 3. Adobe Sign Action Queue Copy

## Module identity

```text
Eyebrow:
Adobe Sign

Title:
Action Queue
```

## Loading

```text
Loading your Adobe Sign queue…
```

## Authorization required

```text
Connect Adobe Sign to load agreements that need your review, signature, approval, or other action.
```

CTA:

```text
Connect Adobe Sign
```

## Configuration required

```text
Adobe Sign must be configured before your action queue can load.
```

## Account unresolved

```text
Your HB account could not be matched to an Adobe Sign user for this queue.
```

Secondary line:

```text
Contact an administrator if this persists.
```

## Source unavailable

```text
Adobe Sign is temporarily unavailable. Your queue will resume once the source is reachable.
```

## Backend unavailable

```text
The My Dashboard service is not responding right now. Try again shortly.
```

## Partial data

```text
Some queue details may be incomplete. Showing the latest available Adobe Sign results.
```

## Ready + zero queue

```text
No Adobe Sign agreements currently need your action.
```

## Source handoff labels

```text
Open in Adobe Sign
View all in Adobe Sign
```

Use these only where current repo truth provides a truthful source handoff destination.

---

# 4. Badge Labels

## Adobe badge labels

```text
Loading
Connect required
Configuration required
Account needs attention
Temporarily unavailable
Partial data
Ready
```

## My Projects badges

A persistent status badge is not required for every state. Use a compact alert treatment inside the card where applicable rather than forcing badges onto the Projects card.

---

# 5. Copy Prohibitions

Do not render these concepts as prominent page copy in the target experience:

- `Read-only work visibility · Source actions remain in their governing systems.`
- `Queue visibility only · Agreement actions remain in Adobe Sign.`
- `Source health`
- `Action system`
- `Authorization required` as a page-level summary outside the owning Adobe card
- `Source readiness` as a standalone card title

Use source-of-record handoff clarity inside relevant module context instead.
