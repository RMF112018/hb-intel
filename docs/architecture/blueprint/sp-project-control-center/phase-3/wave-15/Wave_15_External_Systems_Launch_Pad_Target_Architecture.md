# 01 — Complete Target Architecture

## Feature Definition

**External Systems Launch Pad** is the PCC-native project hub for governed external-system access, project-specific launcher links, mapping visibility, source-health posture, and external access review. It allows approved project roles to configure project-level launch links while preserving PCC's no-writeback, no-sync, no-mirror, and backend-mediated integration posture.

## Architecture Principles

1. Launch first, integrate later.
2. PCC owns mappings and launcher records; source systems own source records.
3. Project-specific records belong to project sites.
4. Global non-secret configuration belongs in HB Central.
5. No secrets in SharePoint, fixtures, SPFx, docs, logs, or URL payloads.
6. Custom links are approval-gated by PM or PX.
7. Progress-camera embed/current-image support is TODO/future-gated.
8. Wave 14 owns checkpoint semantics for mapping-correction approvals.
9. Priority Actions owns action rendering/dedupe, not source ownership.
10. HBI can summarize/cite/refuse; HBI cannot approve, mutate, or decide.

## MVP Capabilities

- Render project-specific launch links grouped by type.
- Multiple permitting links per project: AHJ, private provider, inspection request/status, plan review.
- Progress camera links for TrueLook, EarthCam, OxBlue, Sensera/SiteCloud, Evercam, OpenSpace, DroneDeploy, Cupix, and other approved providers.
- Custom links with PM/PX approval.
- Source-system mapping posture and source-health posture.
- Mapping/access/review queues and Priority Action candidates.
- Handoff checkpoint-required decisions to Wave 14.
- Fixture/mock read models.

## Future-Gated Capabilities

- Live Procore/Sage/Graph/ACC/Adobe/DocuSign/Document Crunch/camera APIs.
- Webhooks, background polling, iframe/current-image rendering, API token/secret management, automated writeback, sync/mirror behavior, cross-site production aggregation.
