# Wave 0 — Group 5: Hosted PWA Requester Surfaces

Plan package for the hosted PWA requester-facing surfaces in Wave 0.

## Files in This Directory

| File | Purpose |
|---|---|
| `W0-G5-Hosted-PWA-Requester-Surfaces-Plan.md` | Master plan: purpose, locked decisions, surface map, dependency doctrine, shared feature no-go summary, task sequencing, acceptance gate |
| `W0-G5-T01-Hosted-Requester-Guided-Setup-Surface.md` | Implement `/project-setup` route and Step Wizard guided entry surface |
| `W0-G5-T02-Requester-Parity-Contract-and-Lighter-Presentation-Rules.md` | Lock the workflow parity contract between SPFx and PWA; define lighter presentation rules |
| `W0-G5-T03-Draft-Save-Resume-and-Clarification-Return-Behavior.md` | Draft persistence, save/resume, and clarification-return using `@hbc/session-state` |
| `W0-G5-T04-Interruption-Reconnecting-and-Trust-State-Behavior.md` | Connectivity status, offline/degraded indicators, pending operations count, reconnect sync |
| `W0-G5-T05-Completion-Summary-and-Optional-Project-Hub-Handoff.md` | Completion summary surface and optional new-tab Project Hub handoff |
| `W0-G5-T06-Install-Ready-Browser-First-and-Mobile-Posture.md` | PWA manifest, service worker, tablet-safe layout, phone-friendly key actions |
| `W0-G5-T07-Hosted-Surface-Integration-Rules-Failure-Modes-and-Boundaries.md` | Surface boundaries, RBAC visibility, failure mode handling, coordinator deferral |
| `W0-G5-T08-Testing-and-Verification-for-Hosted-PWA-Requester-Surfaces.md` | Full verification plan, pilot-ready definition, test checklists |

## Governing Sources

- `CLAUDE.md` — authority hierarchy, working rules
- `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` — Wave 0 G5 sketch (G5.1–G5.4)
- `docs/architecture/blueprint/current-state-map.md` — present-state truth
- `docs/architecture/blueprint/package-relationship-map.md` — package dependency authority

## Key Packages

`@hbc/step-wizard` · `@hbc/session-state` · `@hbc/provisioning` · `@hbc/auth` · `@hbc/workflow-handoff` · `@hbc/ui-kit`

## Task Sequence

T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08
