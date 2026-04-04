# White-Glove Device Deployment — No-Go List

## Purpose

Define implementation constraints that must not be violated during white-glove feature development. These constraints are derived from the [architecture baseline](white-glove-architecture-baseline.md), the [end-state plan locked decisions](../admin-spfx-it-control-center-end-state-plan.md), and the [Phase 1 locked decisions](../phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md).

Violation of any item below requires explicit architectural review and user authorization before proceeding.

---

## No-go constraints

### NG-1: No privileged execution in SPFx

All privileged API calls to Microsoft, Apple, and NinjaOne must flow through the backend control plane. SPFx initiates actions through backend API endpoints. It does not call external platform APIs directly, store credentials, or resolve secrets.

**Why:** The operator-console / privileged-backend split is a locked architectural decision from Phase 1. Moving privileged execution into SPFx would violate the security model, break the adapter isolation pattern, and create credential exposure risk in the browser context.

### NG-2: No flattened device workflows

Windows, macOS, iPhone, and iPad must remain distinct operational lanes with platform-specific enrollment paths, readiness rules, checkpoint types, and evidence models.

**Why:** Each device platform has fundamentally different enrollment authorities, management APIs, and operational characteristics. Flattening them into a single generic workflow would produce incorrect behavior for every platform and would not represent the actual operational reality.

### NG-3: No flattened adapters

Microsoft, Apple, and NinjaOne must remain distinct adapter families. There is no generic device-management adapter.

**Why:** Each platform has different authentication models, API contracts, error semantics, and operational boundaries. A generic adapter would hide critical platform-specific behavior and make failure diagnosis, retry logic, and evidence collection unreliable.

### NG-4: No connector handling without governance

All connector configurations must be:
- versioned and durable
- testable through the UI
- health-tracked with probe results
- subject to governed change (not ad-hoc edits without audit trail)

**Why:** Ungoverned connector handling leads to silent configuration drift, untraceable failures, and inability to reproduce or diagnose run issues. The IT department must be able to trust that connector state is known and auditable.

### NG-5: No duplicate admin architecture docs

When existing authoritative documents cover a topic, update the existing document. Do not create a parallel document that restates the same boundaries or decisions.

**Why:** Duplicate documents drift independently, creating contradictory guidance. The admin architecture already has an established doc hierarchy (end-state plan, target architecture, Phase 1 baseline, boundary matrix). White-glove docs extend that hierarchy — they do not replace or shadow it.

### NG-6: No NinjaOne as enrollment authority

NinjaOne handles post-enrollment standardization, software deployment, scripting, and validation. It is not the enrollment authority for any device platform.

- Windows enrollment authority: Microsoft Autopilot + Intune + Entra ID
- Apple enrollment authority: Apple Business Manager + ADE + Intune MDM
- NinjaOne: post-enrollment only

**Why:** Conflating enrollment with post-enrollment standardization would misrepresent the actual device lifecycle, create incorrect dependency chains, and produce unreliable enrollment evidence.

### NG-7: No implementation before baseline freeze

No white-glove code (domain model, adapters, backend endpoints, SPFx pages) should be started until the architecture baseline, boundary matrix, and reuse map are complete and internally consistent.

**Why:** Building without a frozen baseline leads to rework when ownership and boundaries are discovered mid-implementation. The baseline freeze ensures all subsequent prompts execute against a stable architectural contract.

---

## Enforcement

These constraints apply to all prompts in the Phase 9.1 white-glove prompt package. If a future prompt appears to conflict with a constraint, the constraint takes precedence unless the user explicitly authorizes a deviation with documented rationale.

---

## Cross-references

- [Architecture baseline](white-glove-architecture-baseline.md) — full layer ownership definitions
- [Boundary matrix](white-glove-boundary-matrix.md) — operational concern ownership table
- [Repo-truth reuse map](white-glove-repo-truth-reuse-map.md) — existing foundations, extensions, and new build areas
