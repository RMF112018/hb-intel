# White-Glove Package Standards and Governance UX

## Purpose

Document the SPFx operator console page for package template governance, code-baseline vs live-override visibility, standards bundle mapping, and version traceability.

## Page

### Package Standards (`/white-glove/standards`)

**Template browse:**
- All 6 package families displayed as selectable cards
- Each card shows: label, description, device count, version, source badge (code-default / live-override / merged)
- Click to select and view detail

**Template detail (selected family):**
- Source, version, effective date, creator attribution
- Per-device slot cards showing:
  - Platform and enrollment authority
  - Allowed manufacturers with badges
  - Autopilot pre-provisioning / ADE assignment / NinjaOne standardization flags
  - NinjaOne standards bundle mapping (policy, software, script, validation bundles per platform)

**Attribute governance table:**
- Each template attribute classified as:
  - **Code-defined** (locked, neutral badge) — packageFamily, platform, enrollmentAuthority
  - **Governed override** (editable, warning badge) — allowedManufacturers, label, requiresNinjaOneStandardization
  - **Derived at runtime** (computed, inProgress badge) — version, source, effectiveAt

**Version history:**
- Current version shown with source type
- Full version history tracking available when governed overrides are persisted

## Governance model

| Attribute | Classification | Editable by IT |
|-----------|---------------|----------------|
| Package family | Code-defined | No |
| Device platform | Code-defined | No |
| Enrollment authority | Code-defined | No |
| Allowed manufacturers | Governed override | Yes |
| Device label | Governed override | Yes |
| NinjaOne standardization flag | Governed override | Yes |
| Version | Derived | No (auto-incremented) |
| Source | Derived | No (computed) |
| Effective date | Derived | No (set at publish) |

## No second source of truth

- `WHITE_GLOVE_PACKAGE_CATALOG` is the single code-default baseline
- Governed overrides layer on top through the backend configuration system
- The frontend displays the merged effective state, not a separate copy
- Version tracking ensures traceability of all changes

## Routing

| Lane ID | Path | Label | Order |
|---------|------|-------|-------|
| `white-glove-standards` | `/white-glove/standards` | WG Standards | 14 |

## Hook

| Hook | File | Purpose |
|------|------|---------|
| `useWhiteGloveTemplateGovernance` | `apps/admin/src/hooks/useWhiteGloveTemplateGovernance.ts` | Template catalog, governance classification, bundle resolution |

## Cross-references

- [Domain model](../../../../../reference/white-glove/white-glove-domain-model.md) — template types
- [NinjaOne adapter](../../../../../reference/white-glove/white-glove-ninjaone-adapter.md) — bundle mapping
- [Connector governance](../../../../../reference/configuration/white-glove-connector-governance.md) — configuration versioning pattern
