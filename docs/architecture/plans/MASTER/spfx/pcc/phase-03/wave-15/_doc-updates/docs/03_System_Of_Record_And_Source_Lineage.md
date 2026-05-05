# 03 — System of Record and Source Lineage

## System of Record Rules

| Domain | System of Record | PCC Role |
|---|---|---|
| Project identity | PCC / HB Central Projects / provisioning contract | route, identify, map |
| SharePoint project site | PCC provisioning contract / SharePoint | host project lists and launch records |
| Project launcher links | PCC | create, approve, audit, render |
| Custom project links | PCC | draft/review/approve/archive |
| Procore-native records | Procore | read/reference/launch only |
| Sage accounting records | Sage Intacct | launch/reference only; Sage remains accounting book of record |
| AHJ permit portal status | AHJ portal | launch/reference only |
| Private provider portal status | private provider | launch/reference only |
| Camera service media | camera provider | launch/reference; embed TODO |
| PCC mapping records | PCC | create/maintain/audit mapping posture |
| PCC source-health snapshots | PCC-derived | derive/display health posture |
| PCC audit events | PCC | record Launch Pad events |
| HBI summaries | PCC-derived with citations | summarize/refuse, never decide |

## Source Lineage Minimum

Every external object reference must carry project ID, system key, object type, external object ID or normalized target key, display label, source URL where permitted, source owner, record authority, timestamps, permission/redaction state, evidence references, and audit references.
