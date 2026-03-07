# Provider/Adapter Behavior and Runtime Mode Contracts

- **Status:** Canonical reference
- **Date:** 2026-03-06

## Runtime Mode Model

Canonical runtime modes:

- `pwa-msal`
- `spfx-context`
- `mock`
- `dev-override`

Legacy aliases are supported for compatibility (`msal`, `spfx`) but normalized to canonical modes.

## Runtime Detection and Override Rules

Detection priority:

1. Explicit override in non-production (`HBC_AUTH_MODE_OVERRIDE`)
2. SPFx host context detection
3. Browser runtime default (`pwa-msal`)
4. Mock fallback for non-browser contexts

Override is intentionally blocked in production.

## Adapter Behavior Summary

- `MsalAdapter`: PWA Microsoft identity acquisition, normalized to shared session.
- `SpfxAdapter`: SPFx identity bridge input, normalized to shared session.
- `MockAdapter`: deterministic test/dev identity path.

All adapters expose a common contract for:

- acquire identity
- normalize session
- restore session within policy

## Session Restore Policy

Restore policy enforces:

- session presence
- expiration window validity
- safe restore window validity

Outcomes:

- restored
- reauth-required
- invalid-expired
- fatal

## Provider/Adapter Boundary Guarantees

- Provider-specific context stays behind adapter seam.
- Downstream guards/shell consume only normalized auth/session contracts.
- Runtime differences do not fragment shell composition behavior.

## SPFx Host Input Constraints

SPFx identity mode accepts only approved host bridge inputs:

- `pageContext`
- host container metadata
- host context reference
- narrow optional host signals

No shell layout/composition authority is accepted from SPFx host payloads.

## Traceability

- Plans: PH5.2, PH5.14
- ADRs: ADR-0055, ADR-0067
- Blueprint anchors: §§2b, 2c
