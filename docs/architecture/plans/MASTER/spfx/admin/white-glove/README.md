# White-Glove Device Deployment — Architecture Index

## Overview

This directory contains the architecture and design documentation for the white-glove employee device deployment feature in the Admin SPFx IT Control Center.

The white-glove feature enables governed deployment of six employee device package families across Microsoft (Intune/Autopilot/Entra), Apple (ABM/ADE/APNs/Intune MDM), and NinjaOne (post-enrollment standardization) platforms.

## Architecture baseline

| Document | Purpose |
|----------|---------|
| [Architecture Baseline](white-glove-architecture-baseline.md) | Layer ownership, interaction model, run hierarchy, package families |
| [Boundary Matrix](white-glove-boundary-matrix.md) | Operational concern ownership (SPFx / Backend / Adapter / Platform / NinjaOne) |
| [Repo-Truth Reuse Map](white-glove-repo-truth-reuse-map.md) | Existing foundations, extensions, new build areas |
| [No-Go List](white-glove-no-go-list.md) | 7 implementation constraints |

## Domain model and governance

| Document | Purpose |
|----------|---------|
| [Domain Model Architecture](white-glove-domain-model-architecture.md) | Composition vs inheritance, checkpoint taxonomy, template governance |
| [Connector Governance Architecture](white-glove-connector-governance-architecture.md) | Registry extension, secret resolution, versioning, policy toggles |
| [Run Spine Architecture](white-glove-run-spine-architecture.md) | Parent/child orchestration, status aggregation, provisioning compatibility |

## Adapter lanes

| Document | Purpose |
|----------|---------|
| [Microsoft Adapter Architecture](white-glove-microsoft-adapter-architecture.md) | Intune/Autopilot/Entra identity services, technician pre-provisioning |
| [Apple Adapter Architecture](white-glove-apple-adapter-architecture.md) | ABM/ADE/MDM services, platform differentiation, supervised state |
| [NinjaOne Adapter Architecture](white-glove-ninjaone-adapter-architecture.md) | Post-enrollment standardization, bundle mapping, idempotent operations |

## SPFx UX

| Document | Purpose |
|----------|---------|
| [Connections and Readiness UX](white-glove-connections-readiness-ux.md) | Connector configuration, health, readiness summary |
| [Launch and Checkpoint UX](white-glove-launch-checkpoint-ux.md) | 5-step launch workflow, checkpoint management |
| [Run History and Recovery UX](white-glove-run-history-recovery-ux.md) | Run history, device detail, evidence, guided recovery |
| [Package Standards UX](white-glove-package-standards-ux.md) | Template governance, attribute classification, bundle mapping |

## Reference docs

Located in `docs/reference/`:

| Document | Location |
|----------|----------|
| [Domain Model Reference](../../../../reference/white-glove/white-glove-domain-model.md) | `docs/reference/white-glove/` |
| [Microsoft Adapter Reference](../../../../reference/white-glove/white-glove-microsoft-adapter.md) | `docs/reference/white-glove/` |
| [Apple Adapter Reference](../../../../reference/white-glove/white-glove-apple-adapter.md) | `docs/reference/white-glove/` |
| [NinjaOne Adapter Reference](../../../../reference/white-glove/white-glove-ninjaone-adapter.md) | `docs/reference/white-glove/` |
| [Run Spine Reference](../../../../reference/white-glove/white-glove-run-spine.md) | `docs/reference/white-glove/` |
| [Connector Governance Reference](../../../../reference/configuration/white-glove-connector-governance.md) | `docs/reference/configuration/` |

## Reviews

| Document | Location |
|----------|----------|
| [Architecture Baseline Review](../../../../architecture/reviews/phase-9.1-white-glove-architecture-baseline-review.md) | `docs/architecture/reviews/` |
| [Hardening Review](../../../../architecture/reviews/phase-9.1-white-glove-hardening-review.md) | `docs/architecture/reviews/` |
| [Final Closeout Audit](../../../../architecture/reviews/phase-9.1-white-glove-final-closeout.md) | `docs/architecture/reviews/` |

## Operational docs

| Document | Location |
|----------|----------|
| [IT Tenant Prerequisites](../../../../maintenance/white-glove-tenant-prerequisites.md) | `docs/maintenance/` |
| [Developer Guide](../../../../how-to/developer/white-glove-development-guide.md) | `docs/how-to/developer/` |

## Key boundaries

- **SPFx** = operator console (input, display, launch initiation, checkpoint approval)
- **Backend** = privileged execution (orchestration, adapter calls, persistence, audit)
- **Microsoft** = Entra identity, Intune enrollment, Autopilot registration
- **Apple** = ABM assignment, ADE enrollment, supervised state
- **NinjaOne** = post-enrollment standardization and validation only (not enrollment authority)
