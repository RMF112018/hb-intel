# Auth/Shell Architecture Contracts (Phase 5)

- **Status:** Canonical reference
- **Date:** 2026-03-06
- **Packages:** `@hbc/auth`, `@hbc/shell`

## Auth and Shell Ownership Boundary

`@hbc/auth` owns identity normalization, auth lifecycle state, permission evaluation,
protected-access governance workflows, and structured audit traces.

`@hbc/shell` owns shell composition, shell-status arbitration, degraded/recovery shell
experience orchestration, startup budget diagnostics, and SPFx host seam enforcement.

## Core Cross-Package Contracts

- Auth input/output contracts:
  - canonical runtime modes
  - normalized session contract
  - structured auth failure model
  - feature permission registration shape
- Shell input/output contracts:
  - shell environment adapter contract
  - shell status snapshot/state hierarchy
  - degraded/recovery policy contracts
  - startup timing budget/snapshot contracts

## Provider/Adapter Boundary Contract

- Auth provider specifics are adapter-bound (`MsalAdapter`, `SpfxAdapter`, `MockAdapter`).
- Adapter outputs are normalized to one session contract before guard/store usage.
- Shell never consumes provider-specific raw auth context directly.

## SPFx Host Boundary Contract

Approved SPFx host seams are intentionally narrow:

- host container metadata
- identity context handoff reference
- host signals (`theme`, `resize`, `location`)

Disallowed by design:

- host-driven shell composition truth
- host-provided shell mode/layout overrides
- feature-level auth policy mutation via host context

## Protected Feature Registration Contract

All protected features must register through shell-owned contracts before permission
and visibility evaluation. Default behavior for missing registration is explicit deny.

Protected feature contract requires:

- feature id
- route metadata
- navigation metadata
- required feature/action grants
- visibility mode (`hidden` or `discoverable-locked`)

## Role Mapping and Permission Model

Role mapping converts provider identity/context to app roles in one centralized layer.
Permission resolution combines:

1. base role grants
2. default feature grants
3. explicit overrides (grant/deny + expiry)
4. emergency grants (bounded and audited)

Evaluation remains deterministic and auditable across runtime modes.

## Traceability

- Plans: PH5.2, PH5.3, PH5.4, PH5.5, PH5.9, PH5.14
- ADRs: ADR-0055, ADR-0056, ADR-0057, ADR-0058, ADR-0062, ADR-0067
- Blueprint: HB Intel Blueprint V4 §§1e, 1f, 2b, 2c, 2e
