# 01 — Target State Decision Lock  
## My Projects Flagship UI/UX Rebuild

This file exists to prevent design drift during implementation. Do not reopen these decisions unless the operator explicitly changes them.

---

## 1. Locked card posture

- The card eyebrow becomes `My Portfolio`.
- The card title remains `My Projects`.
- The description becomes `Open assigned projects in SharePoint or Procore.`
- The KPI strip is removed entirely.
- The `Launch List` heading is removed entirely.
- The card retains a refined partial/degraded-state notice when needed.
- The card retains the same home surface card order and span choreography.

---

## 2. Locked project-item posture

Each project item becomes a compact tile.

### Must render

- project name;
- project number;
- project stage when available;
- primary role chip, with `+N` role overflow if multiple roles exist;
- single `Open` action trigger.

### Must not render in the tile

- `Legacy Folder`
- `Site + Legacy`
- `Project Site`
- any source/provenance pill or equivalent visible source classification

### Important exception

SharePoint Site vs SharePoint Folder wording must remain available **inside the launch menu action label**, because that reflects the actual destination type.

---

## 3. Locked hierarchy

### Primary
1. Project name
2. Project number

### Secondary
3. `Open` trigger
4. Project stage

### Tertiary
5. Role chip(s)

This hierarchy is binding. Do not allow badges, stage labels, or action furniture to visually dominate the name/number recognition block.

---

## 4. Locked action model

- Do **not** keep persistent dual action buttons on the tile.
- Use one explicit `Open` menu trigger.
- Menu options:
  - SharePoint label from the row model;
  - Procore label from the row model or fixed `Open Procore` when available.
- Unavailable destinations:
  - no fake links;
  - disabled or non-linking menu item;
  - accessible reason available.

---

## 5. Locked overflow model

- Do **not** use unlimited inline card expansion as the final pattern.
- Use a responsive modal portfolio browser overlay for all projects beyond the resting visible-count limit.
- The browser supports search by project name and project number.
- The browser must support the same launch action model as the resting card.

---

## 6. Locked display ordering

The UI presentation layer sorts items by:

1. project name;
2. project number;
3. record key.

Do not modify backend provider sorting in this UI package.

---

## 7. Locked responsive visible counts

| Mode | Visible projects |
|---|---:|
| phone | 3 |
| tabletPortrait | 4 |
| tabletLandscape | 4 |
| smallLaptop | 4 |
| standardLaptop | 6 |
| largeLaptop | 6 |
| desktop | 6 |
| ultrawide | 6 |

---

## 8. Locked full portfolio browser posture

### Desktop / standard laptop / large laptop / ultrawide / tablet landscape
- right-side drawer/panel presentation;
- overlay/backdrop;
- accessible modal dialog semantics.

### Tablet portrait / phone / short-height
- full-screen modal sheet;
- top title/search/close area;
- scrollable results body.

---

## 9. Locked premium-stack posture

Use the following where materially specified by the implementation plan:

- `@floating-ui/react`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
- `class-variance-authority`
- `clsx`
- `lucide-react`
- `motion`

Do not add unrelated dependencies or use packages symbolically.

---

## 10. Locked non-goals

- No backend/auth/data remediation.
- No Adobe Sign redesign.
- No card-span reshuffle.
- No homepage shell redesign.
- No provider/data-contract rewrite.
- No generic dashboard KPI replacement.
- No source-provenance relabeling in the tile.
