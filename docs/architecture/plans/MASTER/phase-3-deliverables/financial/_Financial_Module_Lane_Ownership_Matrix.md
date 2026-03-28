# Financial Module — Lane Ownership Matrix

## Purpose
This matrix maps core Financial module capabilities to the appropriate runtime lane. It is intentionally capability-based rather than file-based. Tool-specific doctrine already locked elsewhere should remain authoritative where more detailed than this matrix.

## Lane definitions
- **PWA owner** = deep, workflow-rich, route-durable operating surface
- **SPFx owner** = SharePoint-native launch, lightweight contextual visibility, web-part or extension entry surfaces
- **Launch-to-PWA** = user starts from SPFx or SharePoint context but is routed into PWA for full work
- **Native lane** = capability is fully supported in that lane without mandatory redirect

| Capability | PWA owner | SPFx owner | Expected behavior |
|---|---|---|---|
| Project-scoped Financial home / command center | Yes | Limited | SPFx may expose summary tiles or entry web parts; deep module home belongs in PWA |
| Budget Import deep workflow | Yes | Limited | SPFx can launch or expose status; import preparation, validation, and resolution belong in PWA |
| Forecast Summary operational editing / review prep | Yes | No meaningful deep ownership | Full runtime surface in PWA |
| Forecast Checklist action workflow | Yes | Limited | SPFx may show readiness summary or blocker counts; resolution workflow in PWA |
| GC-GR Forecast deep workflow | Yes | No meaningful deep ownership | Full action surface in PWA |
| Cash Flow Forecast deep workflow | Yes | No meaningful deep ownership | Full action surface in PWA |
| Buyout Log actionable operating surface | Yes | Limited | SPFx can expose context cards, shortcuts, or list-linked entry points; deep workflow in PWA |
| Review / PER workflow | Yes | Limited | SPFx may expose lightweight approval entry or queue awareness if doctrine allows; full review surface in PWA |
| Publication / Export release workflow | Yes | Limited | SPFx may show publication posture and latest release; publication-safe validation and release belong in PWA |
| History / Audit investigation workflow | Yes | Limited | SPFx may expose audit summary / recent events / open cases; full case handling belongs in PWA |
| Lightweight status web parts inside project SharePoint surfaces | No | Yes | Native SPFx ownership |
| Project document or list contextual launch into a financial artifact | Shared | Shared | SPFx hosts entry point; PWA owns the deep linked destination |
| Notification summary / attention tiles | Shared consumption | Shared consumption | Use shared spines; display in both lanes based on context |
| Related-items lineage visualization (lightweight) | Yes | Limited | SPFx can preview related state; authoritative interactive graphing should remain PWA-first if complex |
| Deep version lineage drilldown | Yes | No | PWA-owned |
| Approval queue with full context and evidence | Yes | Limited | SPFx may present lightweight entry cards; decision-grade workflow remains in PWA |
| Read-only historical snapshot view | Yes | Possible | SPFx can host lightweight read-only summaries where beneficial, but source of navigation truth remains PWA |
| Route-safe project / period / version context switching | Yes | No | PWA-owned |
| Source-tool remediation launched from audit case | Yes | No | Always Launch-to-PWA unless the source tool has an explicitly supported native SharePoint microflow |
| SharePoint-hosted "open in Financial module" entry points | No | Yes | Native SPFx ownership with Launch-to-PWA behavior |
| Full command-rail, split-view, or canvas-first operating surfaces | Yes | No | PWA-owned |
| Home page canvas tiles for financial blockers / next moves | Yes | Limited | SPFx may show a shallow web part; authoritative tile logic should come from PWA/project-canvas contracts |

## Lightweight vs deep workflow guidance
### Lightweight native SharePoint behavior is appropriate for:
- recent status summaries
- blocker counts
- latest publication indicator
- quick launch actions
- contextual project entry points
- read-only snippets tied to documents or lists

### Deep workflow must route to PWA for:
- multi-step validation or remediation
- review / approval with evidence
- version-aware edits
- publication-safe release
- investigation case handling
- cross-tool lineage inspection
- durable project / period context continuity

## Boundary guardrails
1. SPFx should not become a parallel deep workflow implementation.
2. PWA should remain the authoritative command surface for work that requires stateful navigation, multi-step decisioning, or cross-tool continuity.
3. When a SharePoint-native experience is provided, it must either be fully supportable in-place or visibly launch to the PWA with preserved context.
