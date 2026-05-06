---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# Wireframe — Shell Operating Frame

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ SharePoint chrome / page context                                            │
│ Project number visible in SharePoint chrome — NOT repeated in PCC hero      │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ PCC HERO                                                                    │
│ Eyebrow: Project Control Center                                             │
│ Primary title: Project Control Center                                       │
│ Secondary title: <Active Surface Name>                                      │
│                                                                             │
│ Mandatory project facts:                                                    │
│ [Location]  [Estimated Value]  [Scheduled Completion]  [Project Stage]       │
│                                                                             │
│ Utility: [Command Search — Preview] Search unavailable in preview            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ TEXT-ONLY TAB RAIL                                                          │
│ Project Home | Team | Documents | Project Readiness | Approvals |           │
│ External Platforms | Settings | Site Health                                 │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ ACTIVE SURFACE CANVAS                                                       │
│ role="tabpanel" aria-labelledby="pcc-tab-<activeSurfaceId>"                 │
│                                                                             │
│ ┌───────────────────────────────┐ ┌───────────────────────────────────────┐ │
│ │ Operational first-view card   │ │ Secondary content / status / actions  │ │
│ └───────────────────────────────┘ └───────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```
