# Prompt-04 — Admin Domain Taxonomy and Release-Scope Map

## Objective

Define the canonical **admin domain taxonomy** and **release-scope map** for the Admin SPFx IT Control Center so Phase 1 clearly states what the product domains are and what belongs in early active scope versus later expansion.

## Important execution rules

- Do **not** re-read files already in current context unless needed.
- Use the Phase 1 baseline and boundary matrix as authoritative inputs.
- Keep the taxonomy practical and implementation-facing.
- Prevent phase bleed by making in-scope / out-of-scope lines explicit.

## Inputs

Use:
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-phase-1-architecture-baseline.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-boundary-matrix.md`
- `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-phase-1-repo-truth-verification.md`

## Create

1. `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-domain-taxonomy.md`
2. `docs/architecture/plans/MASTER/spfx/admin/phase-1/admin-spfx-release-scope-map.md`

## Required domain taxonomy content

The taxonomy doc must define major domains and sub-capabilities for at least:

- Operator Console Shell
- Setup / Install
- Validation / Readiness
- Runs / History / Status
- Audit / Logs / Evidence
- SharePoint Control
- Entra Control
- Standards / Configuration Governance
- Health / Alerts / Probes
- Repair / Recovery Initiation

For each domain, include:
- purpose,
- example sub-capabilities,
- primary owner layer,
- current maturity in repo (`existing`, `partial`, or `not yet implemented`),
- and key later-phase dependencies where relevant.

## Required release-scope map content

The release-scope map must separate work into:
1. **Active first-wave scope**
2. **Advisory / visibility-only first-wave scope**
3. **Later expansion scope**
4. **Explicit Phase 1 non-goals**

Use the locked direction below:

### Active first-wave scope
- in-app backend bootstrap direction
- provisioning control-center integration
- HB Intel-managed SharePoint active control
- broad Entra administration
- standards/configuration governance
- risk-aware repair initiation
- run history / logs / auditability

### Advisory / visibility-first scope
- broader tenant-wide SharePoint visibility where active control is not yet approved
- broader tenant health visibility outside the HB Intel-managed boundary

### Later expansion scope
- wider Microsoft 365 admin domains
- broader tenant-wide SharePoint active governance
- wider enterprise control-center capabilities

## Deliverable quality bar

- Taxonomy terms must be stable and reusable.
- Scope mapping must be explicit enough to stop later prompt drift.
- Do not write vague categories like “miscellaneous admin.”

## Validation

Before finishing:
- verify taxonomy terms are consistent with the baseline and boundary matrix,
- verify release-scope categories do not overlap ambiguously,
- verify current maturity labels do not overstate repo reality.

## Completion condition

Stop after both docs are complete and cross-linked.
Do not write the decision log in this prompt.
