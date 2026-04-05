# Phase C-01 — Utility / Discovery Ownership Split

## Decision

Phase C utility/discovery premiumization reuses existing shared primitives from `@hbc/ui-kit/homepage` and local homepage composition shells. No new `@hbc/ui-kit` exports are warranted.

---

## What Already Exists and Should Be Reused

### Shared primitives (`@hbc/ui-kit/homepage`) — reuse as-is

| Primitive | Role in Phase C |
|---|---|
| `HbcHomepageActionRow` | Primary row pattern for actions, destinations, and resource items across all three surfaces |
| `HbcHomepageIconFrame` | Branded icon container for tool launcher items and discovery resources |
| `HbcHomepageSurfaceCard` | Surface-class-aware card for utility (`surface="utility"`) and discovery (`surface="discovery"`) |
| `HbcHomepageSectionShell` | Section wrapper with accessible heading structure |
| `HbcHomepageCta` | Quick-path links in discovery surface |
| `HbcStatusBadge` | Badge treatment for priority actions and tool launcher items |
| `HbcHomepageMetadataRow` | Metadata display (available if needed for enhanced status rows) |

### Local homepage shells — reuse as-is

| Component | Location | Role |
|---|---|---|
| `HomepageRailShell` | `shared/HomepageRailShell.tsx` | Flex rail layout for side-by-side utility groups |
| `HomepageUtilityDenseGroup` | `shared/HomepageUtilityDenseGroup.tsx` | Compact group container with sub-heading and tight grid |
| `HomepageDiscoveryCluster` | `shared/HomepageDiscoveryCluster.tsx` | Discovery zone composition (search + quick paths + promoted + categories) |

---

## What Is New or Extended for Phase C

### Centralized icon resolver (`helpers/iconResolver.ts`) — new local helper

Both `ToolLauncherWorkHub` and `HomepageDiscoveryCluster` independently implemented weak iconKey-to-text mapping (`ICON_MAP` and `iconInitials`). Phase C centralizes this into a single shared helper at `apps/hb-webparts/src/homepage/helpers/iconResolver.ts`.

This remains local because:
- icon resolution logic is specific to homepage utility/discovery authoring contracts
- no consumer outside the homepage package needs this capability
- the promotion rule requires 2+ meaningful consumers outside homepage before moving to `@hbc/ui-kit`

---

## What Stays Local and Why

All composition shells, config normalization, authoring contracts, and icon resolution stay local in `apps/hb-webparts/src/homepage/`:

- **Composition shells** (`shared/`) — homepage-specific layout choreography
- **Config normalization** (`helpers/`) — homepage authoring contract logic
- **Authoring contracts** (`webparts/`) — homepage webpart property schemas
- **Icon resolution** (`helpers/iconResolver.ts`) — homepage-specific iconKey mapping
- **Tokens** (`tokens.ts`) — homepage zone-level design tokens

This split is correct because:
1. These patterns are tightly coupled to homepage authoring contracts and zone architecture
2. They have no consumers outside the homepage package
3. The Phase A shared primitives already provide the reusable visual building blocks
4. Promoting composition-level choreography to `@hbc/ui-kit` would violate the doctrine overlay's territory map

---

## What Was Removed

- `HomepageUtilityTile` — dead code with no consumers, superseded by `HbcHomepageActionRow` during Phase A migration

---

## Assumptions Carried into Prompts 02-04

1. `HbcHomepageActionRow` is the primary row pattern for all three surfaces — Prompts 02-04 compose it, not replace it
2. `HbcHomepageIconFrame` provides the icon container — Prompts 02-04 improve what goes inside it via the centralized icon resolver
3. `HomepageUtilityDenseGroup` remains the group container for utility surfaces — Prompts 02-03 may enhance its density/rhythm
4. `HomepageDiscoveryCluster` remains the discovery composition — Prompt 04 enhances its internal presentation
5. No new `@hbc/ui-kit/homepage` exports are needed unless a Prompt discovers a clear multi-surface reuse case
6. Token discipline, import guardrails, and accessibility policy remain unchanged
