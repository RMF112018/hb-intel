# 03 — Project Item Composition Specification  
## Final tile anatomy, hierarchy, spacing intent, and content treatment

---

## 1. Composition objective

Project items must become compact, scan-friendly portfolio tiles. The user should be able to find a project quickly by **name or number**, understand basic context, and access launch destinations without persistent control clutter.

---

## 2. Final tile anatomy

### Required tile content

```text
[Project name]
[Project number]

[Stage / contextual line]                     [Open ▾]

[Primary role chip]  [+N if needed]
```

### Important notes

- The project name and number form one identity block.
- The number sits directly beneath or immediately adjacent to the name.
- The number must be visually strong enough to support scanning by number.
- The `Open` trigger balances the tile composition without dominating it.
- Supporting metadata must not collapse into a top-left pile.

---

## 3. Visual hierarchy

| Priority | Content | Treatment |
|---|---|---|
| 1 | Project name | strongest weight, primary scan target |
| 2 | Project number | near-primary, slightly smaller/lighter than name |
| 3 | Open action trigger | compact, confident, clear |
| 4 | Stage | contextual, text-based |
| 5 | Role chip | tertiary label |

---

## 4. Source/provenance handling

### Remove from visible tile

- `Legacy Folder`
- `Site + Legacy`
- `Project Site`

### Preserve functionally

The SharePoint action label in the menu remains sourced from the action model:

- `Open SharePoint Site`
- `Open SharePoint Folder`

This preserves useful destination truth without forcing provenance badges into the tile.

---

## 5. Role handling

### Resting tile

- Render the top-priority role chip only.
- If additional roles exist, render a compact `+N` trigger.
- The trigger may open inline role details or a small tooltip/popover, but the default tile must stay compact.

### Browser overlay

- It may show the same compact role treatment.
- It should not become a verbose role matrix.

---

## 6. Stage handling

- Render stage as subtle supporting text.
- Do not convert stage into a heavy badge.
- If stage is absent, the layout must remain balanced without a placeholder gap.

---

## 7. Tile size and spacing intent

The tile should:

- feel compact but not cramped;
- use clear internal alignment zones;
- use a restrained surface treatment;
- avoid nested card clutter;
- maintain enough tap/focus space around action affordances.

Do not recreate the current tall row through excessive padding or oversized control placement.

---

## 8. Resting-card grid behavior

Desktop-capable widths use a two-column tile grid. Narrower contexts use one column when that is the premium stable outcome.

The grid must remain visually balanced with:
- short project names;
- long project names;
- project items with and without stage;
- project items with one or multiple roles.

---

## 9. Tile hover and focus behavior

- Hover is additive, not necessary for meaning.
- Focus-visible treatment must be explicit.
- Motion should be subtle and reduced-motion aware.
- Tile interaction itself should not become ambiguous; the primary action remains the `Open` trigger.

---

## 10. Recommended DOM hooks

New hooks should include:

- `data-my-projects-grid`
- `data-my-projects-tile`
- `data-my-projects-identity`
- `data-my-projects-project-name`
- `data-my-projects-project-number`
- `data-my-projects-project-stage`
- `data-my-projects-primary-role`
- `data-my-projects-role-overflow`
- `data-my-projects-launch-trigger`

Retire hooks that only exist to support obsolete badge/dual-button structure unless tests still need a compatibility alias during migration.
