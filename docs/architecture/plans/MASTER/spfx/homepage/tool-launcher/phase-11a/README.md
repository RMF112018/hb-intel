# Phase 11A — Tool Launcher Rebuild README / Implementation Brief

## Phase Summary

Phase 11A is the documentation and governance phase for the Tool Launcher / Work Hub rebuild workstream. It examines the current launcher implementation against repo truth and the governing SPFx doctrine, then produces the implementation brief that will govern Phases 11B–11H.

**Phase type:** Documentation only — no runtime code changes.

**Phase mapping:** 11A = prior Phase 00 (blueprint / implementation brief)

## Governing Doctrine

- [UI Doctrine — SPFx Governing Standard](../../../../../reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md)
- [UI Doctrine — SPFx Homepage Overlay](../../../../../reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md)
- [SharePoint Homepage Design Brief](../../../../blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md)
- [Tenant Shell Implementation Blueprint](../../../../blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md)

## Deliverables

| Deliverable | Path |
|------------|------|
| Implementation Brief | `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md` |
| Change Boundaries | `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md` |
| Validation Checklist | `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md` |

## Key Conclusions

### Preserve
- Data pipeline: contracts, normalization, list source, caching hook
- Search contract: pre-computed searchable records, matching logic
- Icon/asset resolution: cascade logic (manifest may need externalization)
- Mount seam: GUID registration, SPFx context injection
- Composition concepts: 4-region model, 3-tier card hierarchy

### Replace (structural rebuild)
- All visual components: composition shell, card family, command band, utility rail, overlay
- Inline style system: replace with CVA + clsx class composition
- Premium stack adoption: @floating-ui, @radix-ui/*, CVA, clsx

### Doctrine Position
The current launcher is a **structural rebuild candidate**. The surface produces generic enterprise card-grid outcomes prohibited by SPFx doctrine §4.1, §4.2, and §4.3. Decorative polish is insufficient — the composition model, card primitives, and style system must be replaced.

## Prompt Package Contents

| File | Purpose |
|------|---------|
| `11A-README.md` | Prompt package overview |
| `11A-Prompt-01-Tool-Launcher-Rebuild-README-and-Implementation-Brief.md` | Execution prompt |
| `11A-Completion-Notes-Template.md` | Completion notes (filled) |
| `README.md` | This file — phase summary and deliverable index |

## Next Phase

**Phase 11B** — Composition Re-Architecture
