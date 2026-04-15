# Publisher Wave-01 — Project selection & bound-identity closure

**Prompt:** `docs/architecture/plans/MASTER/spfx/publisher/phase-14/Prompt-03-Structural-redesign-project-selection-and-bound-identity-surface.md`
**Scope:** `ProjectPicker` selected/search/empty/loading/no-results/error/unavailable states, `MetadataPanel` bound-project fallback chip.
**Manifest:** hb-publisher Feature 1.0.0.31.

## What project-binding structures were redesigned

- The selected-project chip was rebuilt around an **editorial two-tier hierarchy**. A new `SelectedProjectChip` component renders the project name as the dominant typographic object (16 px, −0.005 em letter-spacing, brand-accented left bar on the chip), with project number and location composed into a subordinate meta line. The chip is now an editorial card (subtle border + 3 px HBC presentation-blue accent) rather than a utilitarian admin pill with a muted grey background.
- The chip foregrounds the same `SelectedProjectChip` component in both the live picker state and the lookup-unavailable fallback inside `MetadataPanel`, so the two surfaces read as the same editorial selection instead of two bespoke renderings.
- The combobox input placeholder now reads as a subject-selection invitation ("Search by project number, name, or location…") rather than the prior operational "Search projects by name or number…" framing.
- When the combobox is open and the query is empty, a new inline editorial hint explains *why* the selection matters (drives team heading, hero category, promotion eligibility) — the prior experience left the empty state blank.
- The loading state surfaces an accessible spinner paired with a contextual "Searching HBCentral for …" message instead of the prior text-only "Searching…".
- The error state now renders with a bold lead ("Project lookup is temporarily unavailable.") plus the same dev-diagnostic detail in parentheses, and picks up an error-bg/border treatment so it reads as a real alert, not an inline note.
- The search-result option rows collapse `projectNumber · projectLocation` into a clean meta line and no longer lead with `ID <projectId>`. When a row has neither number nor location, it now falls back to "No number or location on file" rather than a lone ID line.

## Identity residue removed or demoted

- The raw internal `projectId` no longer appears on the editorial surface of the selected chip. It has been moved into a collapsed `<details>` block labelled **"System identifiers"** on the chip itself. It remains keyboard-discoverable and available for diagnostics (and to any screen-reader or test that inspects `textContent`), but it no longer competes with the editorial framing.
- The raw `ID <projectId>` line has been removed from the option rows entirely. The meta line on search results now carries project-number and location only, matching how authors actually think about projects.
- The lookup-unavailable fallback no longer inlines a makeshift chip that foregrounds the ID. Instead it composes the shared `SelectedProjectChip` (which keeps the ID behind the details block) plus a subordinate helper paragraph explaining why change is blocked.

## Interaction states exercised

- **Selected**: project name + optional number/location meta + collapsed system-identifier details + Change button.
- **Lookup unavailable**: identical chip layout, no Change button, quiet subordinate hint.
- **Empty (open, no query)**: editorial hint explains what the selection drives.
- **Loading**: accessible spinner + "Searching HBCentral for …" live-region status.
- **Ready with results**: option rows with editorial name + meta; keyboard navigation via ArrowUp/Down + Enter unchanged.
- **Ready with no results**: product-grade "No projects match …" guidance.
- **Error**: role="alert" block with bold lead, contextual explanation, and bracketed diagnostic detail.

## Semantics preserved

- WAI-ARIA editable-combobox contract: `role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- Debounced 300 ms remote search with `AbortController` cancellation.
- ArrowUp / ArrowDown / Enter / Escape keyboard flow.
- Outside-click dismissal.
- No manual `ProjectId` / `ProjectName` text entry is offered — authoritative lookup remains the only path.
- The `project-picker-chip` and `project-picker-readonly` `data-testid` hooks, the `ProjectPickerValue` public contract, and the `ProjectLookupSearchFn` signature are unchanged.
- The `handleProjectChange` path in `MetadataPanel` — including opportunistic team-heading seeding via `defaultTeamHeading(entry.projectName)` — is untouched.

## Verification

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 614 passing (including the `metadataPanel.test.tsx` project-binding suite that asserts on chip contents, lookup error messaging, and the lookup-unavailable fallback — all continue to pass because the demoted `ID <projectId>` remains in `textContent` inside the collapsed details block); 6 failures all pre-existing in `publisherAdapter/__tests__/publisherEndToEnd.test.ts`, unrelated to this change.
- Manifest bumped: `config/package-solution.json` 1.0.0.30 → 1.0.0.31.
