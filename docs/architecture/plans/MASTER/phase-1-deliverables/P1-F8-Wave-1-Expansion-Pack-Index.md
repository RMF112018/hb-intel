# P1-F8: Wave 1 Expansion-Pack Index

## Purpose

Wave 1 expansion packs deepen the three base Wave 1 connectors without reopening the `P1-F1` umbrella architecture or bypassing the published read-model boundary.

## Family Inventory

| Family | Extends | Status |
|---|---|---|
| [P1-F17-Procore-Expansion-Pack-Family.md](P1-F17-Procore-Expansion-Pack-Family.md) | [P1-F5](P1-F5-Procore-Connector-Family.md) | Deferred second-stage deepening |
| [P1-F18-Sage-Intacct-Expansion-Pack-Family.md](P1-F18-Sage-Intacct-Expansion-Pack-Family.md) | [P1-F6](P1-F6-Sage-Intacct-Connector-Family.md) | Deferred second-stage deepening |
| [P1-F19-BambooHR-Expansion-Pack-Family.md](P1-F19-BambooHR-Expansion-Pack-Family.md) | [P1-F7](P1-F7-BambooHR-Connector-Family.md) | Deferred second-stage deepening |

## Source-Sufficiency Matrix

| Expansion pack | Source posture | Planning implication |
|---|---|---|
| Procore | Base source set still introduction-only | Additional route-level scoping is gated on stronger official docs |
| Sage Intacct | Base authoritative URLs exist; accessible contract capture is still required | Expansion scope must not outrun verified object inventory |
| BambooHR | Base docs verify employee and webhook capabilities | Expansion can stage further HR surfaces while preserving auth and permission constraints |

## Dependency Map

- Expansion packs depend on acceptance of their parent connector family.
- Expansion packs inherit the `P1-F1` raw custody, normalized source-aligned records, thin canonical core, replay, and reconciliation model.
- Expansion packs cannot introduce direct feature-package connector reads.

## Sequencing and Readiness Gates

1. Base Wave 1 connector families are accepted.
2. Parent raw custody and published read models are stable.
3. Additional official source evidence is sufficient for the deeper scope being proposed.
