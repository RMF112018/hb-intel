# 01 — Missing Info Canonical Checklist

Use this checklist to confirm the Wave 16 documentation / pending implementation package is developer-ready.

## Runtime Contracts

- [ ] `ControlCenterSettingsReadModel` or upgraded `PccSettingsReadModel` documented.
- [ ] DTOs cover all wireframe slices.
- [ ] Each DTO has required/optional/read-only/redacted fields documented.
- [ ] Schema-to-DTO map exists.
- [ ] Route response examples exist for known project, unknown project, backend unavailable, and partial/degraded data.
- [ ] Read-model envelope warning semantics are defined.

## Fixture Data

- [ ] Known-project fixture exists.
- [ ] Unknown-project fixture exists.
- [ ] Backend-unavailable fixture exists.
- [ ] Missing-config fixture exists.
- [ ] Expired override fixture exists.
- [ ] Blocked override fixture exists.
- [ ] Secret-reference fixture exists.
- [ ] Validation-warning and validation-blocked fixtures exist.
- [ ] HBI allowed/refused fixture examples exist.
- [ ] Audit event fixture examples exist.

## Governance

- [ ] Role/action/redaction matrix exists.
- [ ] Disabled-reason catalog exists.
- [ ] Self-approval prevention is explicit.
- [ ] Admin-verification routing is explicit.
- [ ] Secret-reference display rules are explicit.
- [ ] No raw secrets rule is testable.

## Algorithms

- [ ] Effective-value resolution algorithm exists.
- [ ] Override expiration/future/effective/conflict/block rules exist.
- [ ] Source-derived value rules exist.
- [ ] Missing-default and conflicting-policy rules exist.
- [ ] Pure helper function expectations exist.

## Workflow / Cross-Surface

- [ ] Change request lifecycle statuses exist.
- [ ] Future command payload shape exists.
- [ ] Wave 14 handoff payload exists.
- [ ] Priority Actions candidate/severity/dedupe/suppress/resolve rules exist.
- [ ] Project Home / Readiness / Site Health / Admin Review seams exist.

## UX / A11y

- [ ] Component tree exists.
- [ ] State ownership map exists.
- [ ] Table behavior defined.
- [ ] Drawer/dialog behavior defined.
- [ ] Mobile table-to-card behavior defined.
- [ ] Copy catalog exists.
- [ ] `data-pcc-settings-*` test-hook map exists.
- [ ] Dialog focus trap / Escape / return-focus behavior defined.

## HBI / Audit / Tests

- [ ] HBI allowed/refused examples exist.
- [ ] Citation/source-lineage shape exists.
- [ ] Business audit event vocabulary exists.
- [ ] M365/Purview/Entra audit separation is explicit.
- [ ] Full acceptance criteria exist.
- [ ] Test matrix maps behavior to test files.
