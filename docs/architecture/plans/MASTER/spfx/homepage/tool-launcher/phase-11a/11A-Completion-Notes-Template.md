# Phase 11A Completion Notes

## Files Created

- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-readme.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-change-boundaries.md`
- `docs/architecture/reviews/tool-launcher/phase-11a-tool-launcher-rebuild-validation-checklist.md`
- `docs/architecture/plans/MASTER/spfx/homepage/tool-launcher/phase-11a/README.md`

## Repo Areas Inspected

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/` — all 14 component/utility files
- `apps/hb-webparts/src/mount.tsx` — mount seam and GUID registration
- `apps/hb-webparts/src/homepage/data/toolLauncherNormalization.ts` — normalization pipeline
- `apps/hb-webparts/src/homepage/data/toolLauncherListSource.ts` — SharePoint REST fetcher
- `apps/hb-webparts/src/homepage/data/useToolLauncherData.ts` — caching hook
- `apps/hb-webparts/src/homepage/webparts/toolLauncherContracts.ts` — 3-layer type contracts
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` — primary governing doctrine
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md` — homepage-specific overlay
- `docs/architecture/blueprint/sharepoint-shell/Hedrick_Brothers_SharePoint_Homepage_Design_Brief.md` — design brief
- `docs/architecture/blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md` — shell blueprint

## Preserve vs Replace Summary

### Preserve
- **Data pipeline** (contracts, normalization, list source, caching hook) — well-typed, production-tested, architecturally sound
- **Search contract** — pre-computed searchable records with multi-field matching
- **Icon/asset resolution** — 5-step logo cascade, category/platform icon mapping (manifest may need externalization)
- **Mount seam** — GUID registration, SPFx context injection, site URL storage
- **Composition concepts** — 4-region model (command band, flagship stage, workflow shelves, utility rail) and 3-tier card hierarchy (flagship/shelf/index)
- **Notice/support model** — priority ordering, auto-expiry, section suppression, action categorization
- **Audience filtering** — with no-restriction fallthrough

### Transitional / Replace
- **All visual components** — composition shell, 3 card types, command band, utility rail, overlay, index row
- **Inline style system** — 100% inline `React.CSSProperties` dictionaries throughout; must be replaced with CVA + clsx
- **Legacy fallback** (`HbcLauncherSurface`) — parallel rendering path that duplicates logic
- **Search UI** — functional but not using @floating-ui/react or @radix-ui/react-scroll-area
- **Asset manifest** — 9-platform inline manifest should be externalized

## Doctrine Conclusion

The Tool Launcher is a **structural rebuild candidate**. The current surface produces the exact outcomes the SPFx Governing Standard explicitly prohibits:

- Generic enterprise card-grid visual language (§4.1, §4.2)
- Timid hierarchy without zone differentiation (§4.2)
- Minimal premium stack adoption (§5.1 — only motion and lucide of 9 approved packages used)
- Inline style architecture incompatible with CVA variant systems (§5.2)
- Safe enterprise hover states where premium motion is expected (§6.2)

The doctrine binding position is clear: "Do not preserve a weak system simply because it is already compiling" (§4.3). Decorative polish is not sufficient. Structural replacement of the visual layer is required while preserving the strong data pipeline.

## Recommended Next Phase

- **Phase 11B** — Composition Re-Architecture

## Open Questions / Residual Uncertainty

1. **Asset manifest externalization** — The inline 9-platform manifest works now but doesn't scale. Phase 11H should decide whether to load from SharePoint list or a managed manifest file. Not a rebuild blocker.
2. **Logo preference field** — `LauncherLogoPreference` is parsed but never consulted during resolution. Later phases should use it or remove it.
3. **Legacy fallback decision** — `HbcLauncherSurface` in `mount.tsx` creates a parallel path. Phase 11H must decide: modernize or deprecate.
4. **Platform key enforcement** — Some records may lack explicit `PlatformKey` values. List governance should enforce this, but it's an administrative action, not a code change.
