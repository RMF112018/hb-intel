# 03 — Comprehensive Target UI Posture

## 1. Product Identity

### My Dashboard

`My Dashboard` is the user's personal operating layer within HB Intel.

### My Work

`My Work` is the primary quick-action surface that resolves two immediate employee needs:

1. opening assigned project workspaces quickly;
2. understanding and acting on Adobe Sign work requiring attention.

The page must feel like a **personal launch pad**, not an integration-state console.

---

## 2. Required End-User Reading Order

A user should visually parse the page in this order:

1. **Compact page identity**
   - My Dashboard
   - My Work
   - one sentence clarifying purpose

2. **My Projects**
   - what projects are available;
   - where to launch them.

3. **Adobe Sign Action Queue**
   - whether there is work waiting;
   - what must be connected or resolved;
   - where to continue in Adobe Sign.

---

## 3. Target Header Posture

### Exact target text

```text
My Dashboard
My Work
Your personal launch pad for project access and work requiring attention.
```

### Design intent

The header should:

- be visually restrained;
- provide a clean transition from SharePoint chrome to dashboard cards;
- consume materially less vertical space than the current hero;
- avoid repeating module state that appears below.

### Explicit exclusions

Do not render:

- page-level actionable item count;
- source health indicator;
- last refresh strip;
- route-dependent Adobe focused hero;
- governance microcopy lane.

---

## 4. Target Primary Page Composition

### Desktop / large laptop / ultrawide

```text
┌────────────────────────────────────────────────────────────┐
│ Compact My Dashboard / My Work header                      │
└────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────┬─────────────────┐
│ My Projects                              │ Adobe Sign      │
│ 7 columns                                │ 5 columns       │
└──────────────────────────────────────────┴─────────────────┘
```

### Standard laptop

```text
┌────────────────────────────────────┬──────────────────────┐
│ My Projects — 6 cols               │ Adobe Sign — 4 cols  │
└────────────────────────────────────┴──────────────────────┘
```

### Small laptop and below

```text
┌────────────────────────────────────┐
│ My Projects — full width           │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ Adobe Sign — full width            │
└────────────────────────────────────┘
```

---

## 5. One-Card-Per-Module Doctrine

### Meaning

Each module card is the user-facing owner of:

- identity;
- state;
- CTA;
- empty state;
- populated state;
- partial/unavailable guidance.

No generic card outside the module may exist solely to explain that module's readiness.

### Why this is required

The user thinks:
- “My Projects”
- “Adobe Sign queue”

They do not think:
- “source readiness”
- “queue state surface”
- “focused module route”
- “work summary roll-up card”

---

## 6. Adobe Sign Target UI Posture

The Adobe card must feel compact but materially useful.

### Header

- eyebrow: `Adobe Sign`
- title: `Action Queue`
- state badge aligned to card header
- optional source-system handoff action where status and data make it useful

### Body states

#### Authorization required
- concise explanation;
- `Connect Adobe Sign` CTA;
- no metrics placeholders;
- no separate queue-state card.

#### Configuration required
- concise explanation that configuration is pending/admin-dependent;
- no connect CTA;
- no separate configuration panel.

#### Account/principal unresolved
- concise explanation;
- no misleading retry button;
- guidance remains within the card.

#### Source/backend unavailable
- concise explanation;
- no filler metrics;
- no separate page-level warning card.

#### Partial data
- compact warning line;
- still show available metrics and items;
- avoid alarming or oversized state copy.

#### Available with zero items
- ready state chip;
- positive empty state;
- optional subtle source handoff copy only if helpful.

#### Available with items
- compact metric strip;
- top five items;
- item text prioritizes:
  1. agreement name;
  2. required action;
  3. sender when available;
  4. expiration when available.
- source handoff action:
  - `Open in Adobe Sign`
  - `View all in Adobe Sign` when pagination indicates additional items.

---

## 7. My Projects Target UI Posture

The Projects card must feel like a daily launch panel, not a reporting tile.

### Header

- eyebrow: `My Work`
- title: `My Projects`
- supporting sentence:
  `Open the projects you are assigned to in SharePoint or Procore.`

### Body states

#### Loading
- card remains visible;
- show compact skeleton launch rows or equivalent polished loading placeholders;
- no zero metrics placeholders.

#### Empty
- concise empty state;
- no giant empty launch region;
- no row of zero-value metrics.

#### Populated
- compact metrics strip;
- top five project rows;
- each row retains:
  - source badge;
  - project number;
  - project name;
  - optional stage;
  - role chips;
  - SharePoint launch;
  - Procore launch.
- disclosure to expand beyond five.

#### Partial
- preserve populated list;
- show compact inline alert;
- do not collapse into a failure surface if usable records exist.

#### Unavailable / principal unresolved
- concise, specific state explanation;
- hide meaningless metrics/list sections when no usable rows exist.

---

## 8. Copy Hierarchy

### Page copy

Must answer:
- What is this page?

### Module copy

Must answer:
- What can I do here?
- What is blocked?
- What do I do next?

### Avoid

- architecture explanation;
- implementation labels;
- source-health terminology;
- page-level governance declarations.

---

## 9. Visual Weight Rules

### My Projects

Visually primary but disciplined:
- wider than Adobe on desktop;
- not full-row;
- list density balanced;
- metrics condensed.

### Adobe Sign

Visually secondary in width but primary in action importance:
- dense enough to be useful;
- clear CTA in disconnected state;
- clear queue visibility in connected state.

### Header

Informational, not dominant.

---

## 10. Extensibility

Future modules must enter as peer cards in the same grid model.

The architecture must not reintroduce:

- hidden module menu dependency;
- tab-based discovery requirement;
- focused-route-first product structure.

If deeper detail experiences become necessary in a later batch, they must be additive and must not be required for the primary dashboard to communicate a module's state and main action.
