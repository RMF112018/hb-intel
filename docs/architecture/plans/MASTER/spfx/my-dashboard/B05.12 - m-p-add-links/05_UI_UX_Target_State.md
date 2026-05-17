# UI / UX Target State

## Objective

Integrate custom links into the My Projects module in a way that preserves the compact portfolio-tile posture and avoids crowding the existing fixed system launch actions.

---

# 1. Tile-level disclosure/menu

Each project tile must include a collapsed control:

```text
More Project Resources
```

This control sits outside the fixed `ProjectLaunchActions` system destinations.

Recommended tile composition:

1. project identity
2. stage/meta
3. fixed system launch actions
4. `More Project Resources` disclosure
5. assignment role chip row

---

# 2. Disclosure behavior

Collapsed state:
- button visible,
- no custom resources listed.

Expanded state:
- panel appears inline in the tile or anchored directly to it,
- list of custom links rendered,
- shared/private badges displayed,
- `Add project link` CTA visible at panel footer.

If there are no links:
```text
No additional project resources have been added yet.
```

Then:
```text
Add project link
```

---

# 3. Custom link row presentation

For each custom link:

- title as anchor text,
- external-link behavior:
  - new tab
  - `rel="noopener noreferrer"`
- visibility badge:
  - `Shared`
  - `Only me`
- if `canEdit`:
  - `Edit`
- if `canDelete`:
  - `Remove`

Use discreet, compact row styling; this is a secondary resource lane, not the primary project identity.

---

# 4. Add project link CTA

Exact CTA:

```text
Add project link
```

The CTA opens a modal dialog.

---

# 5. Modal title

```text
Add project link
```

---

# 6. Modal helper text

Use exact helper text:

```text
Use this to add trusted project resources such as additional SharePoint sites, permitting sites, private provider portals, and other project-specific destinations.
```

---

# 7. Modal fields

1. Link title
2. Link address
3. Visibility radio group:
   - Only me
   - Everyone with this project

Helper copy:

### Only me
```text
Visible only in your My Projects panel.
```

### Everyone with this project
```text
Visible to anyone whose My Projects panel includes this project.
```

---

# 8. Modal validation

Inline validation required for:

- missing title,
- title > 80 chars,
- missing URL,
- URL > 2048 chars,
- invalid / non-HTTPS URL.

---

# 9. Modal buttons

Primary:
```text
Add link
```

Secondary:
```text
Cancel
```

Edit modal may reuse the same component with:
- title: `Edit project link`
- primary button: `Save changes`

---

# 10. Loading and errors

Create/update/delete commands need visible UI states:

- submit disabled while saving,
- inline error banner or status message for:
  - invalid input,
  - permission denied,
  - project access denied,
  - source unavailable,
  - custom-link limit reached.

Use user-facing copy that is direct, non-technical, and does not reveal backend internals.

---

# 11. Optimistic updates

Recommended v1 behavior:
- no optimistic mutation before backend confirms success.
- after success:
  - update local item state if the command client returns the saved link, or
  - refresh the My Projects read model if that is the existing surface pattern.

Choose one deterministic path based on current repo UI data ownership.

---

# 12. Accessibility

Required:
- disclosure button with `aria-expanded`,
- modal with dialog semantics and focus trap pattern aligned to current app conventions,
- link rows keyboard reachable,
- edit/remove buttons explicit,
- screen-reader-visible status for save failures.

---

# 13. Mobile posture

On phone:
- disclosure remains accessible inside the project tile,
- modal must remain usable within viewport,
- do not bury custom links inside the existing system launch drawer.

---

# 14. Browser / View All parity

If the My Projects browser/view-all surface reuses the same `ProjectPortfolioTile`, custom resources should appear there automatically.

No separate browser-only feature fork.
