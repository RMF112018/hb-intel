# Phase 9 — Setup and Readiness Ripple Notes

## 1. Purpose

Document corrections applied to upstream Phases 5–7 so their operator-console, setup, connection, preflight, and provisioning dependency guidance correctly accounts for hybrid identity readiness and the no-code IT handoff gate.

## 2. Inputs actually used

| Source | Purpose |
|--------|---------|
| `admin-spfx-phase-9-program-ripple-map.md` | Canonical correction list |
| `admin-spfx-phase-9-upstream-corrections.md` | Upstream Phase 1–5 corrections already applied |
| Phase 5 summary plan | Lane naming (already corrected in P9-13) |
| Phase 6 summary plan | Verified — defers identity explicitly |
| Phase 6A summary/reconciliation | Verified — uses "hybrid" correctly |
| Phase 7 summary plan | 6 "Entra readiness/setup" references corrected |

## 3. Phase 5 corrections

**Already completed in P9-13.** The Phase 5 summary plan lane list was updated from "Entra Control" to "Identity (Hybrid Identity)" in both occurrences. The implemented code (`lane-registry.ts`) already uses label "Identity" with route ID `entra` and status `active`.

No further Phase 5 corrections needed.

## 4. Phase 6 / 6A corrections

**No corrections needed.**

- **Phase 6**: Explicitly defers "broad Entra admin workflow completion" as a non-goal (line 122). The install wizard and provisioning-era install flow do not assume Entra-only identity. No identity-specific setup surfaces exist in Phase 6.
- **Phase 6A**: Already uses "hybrid" terminology correctly. The app-binding model is domain-agnostic and was designed as an extension point. The upstream reconciliation doc (`admin-spfx-phase-6a-upstream-reconciliation.md`) already notes that Phase 10 generalizes binding, hybrid-identity connection, and device-package configuration slices.

## 5. Phase 7 corrections

Phase 7 (provisioning hardening) had 6 references to "Entra readiness" or "Entra setup" as provisioning dependencies. These were broadened to "identity/connection readiness" or "identity/connection setup" to account for:

- hybrid identity connector health as a provisioning dependency signal,
- AD DS connectivity readiness alongside Graph/Entra readiness,
- connection registry health as a preflight input,
- and the broader identity readiness surface beyond Entra-only.

**Corrections applied:**

| Line | Before | After |
|------|--------|-------|
| 13 | "Entra readiness work" | "identity/connection readiness work" |
| 26 | "Entra setup" | "identity/connection setup" |
| 49 | "Entra setup prerequisites" | "identity/connection setup prerequisites" |
| 96 | "Entra readiness" | "identity/connection readiness" |
| 111 | "Entra setup conditions" | "identity/connection setup conditions" |
| 125 | "Entra/setup dependencies" | "identity/connection setup dependencies" |

**What Phase 7 readiness now includes:**

When Phase 7 validates provisioning readiness, the readiness surface should account for:

| Readiness dimension | Signal | Source |
|--------------------|--------|--------|
| App-binding readiness | Binding published and verified | Phase 6A binding store |
| SharePoint/platform readiness | App catalog, hub site, permissions | SharePoint service |
| Graph identity readiness | Managed Identity configured, Graph permissions consented | Connection registry health |
| AD DS identity readiness | AD DS connector configured and tested | Connection registry health |
| Connection registry health | Both connectors healthy or appropriately degraded | `GET /api/admin/connections` |

Phase 7 implementation should validate connector health as part of preflight if provisioning workflows depend on identity operations. If provisioning does not directly depend on identity connectors, connector health is informational rather than blocking.

## 6. No-code IT setup gate propagation

The following upstream expectations now apply as program-level doctrine:

| Rule | Scope | Rationale |
|------|-------|-----------|
| After `.sppkg` delivery, IT completes setup without code edits | All phases with IT-facing setup | Phase 9 hard gate |
| Connection credentials are UI-managed, backend-stored | All connectors | No secret custody in SPFx |
| External admin approvals are surfaced as admin-portal steps | Graph consent, AD DS delegation | Not hidden engineering work |
| Preflight checks validate connector presence and health | Identity-dependent operations | Blocked actions show clear guidance |
| Connection rotation and re-verification are UI-driven | Ongoing maintenance | No code edits for credential rotation |

These rules are already implemented in Phase 9's connection management UI and backend. Upstream phases should not introduce setup patterns that contradict them.

## 7. Minimal repo/code alignment notes

No additional code changes were needed for Prompt-14. The repo is already correctly aligned:

| Surface | Current state | Status |
|---------|-------------|--------|
| Lane registry | Label "Identity", status "active" | Correct (P9-08) |
| Setup wizard (`SetupWizardPage`) | Does not reference identity setup | Correct — identity setup is in the Connections tab |
| App-binding pages | Domain-agnostic | Correct |
| Provisioning oversight | Does not assume identity connector state | Correct |
| Connection management routes | `GET/POST /api/admin/connections`, `POST .../test` | Correct (P9-09) |
| Preflight banners | Users/Groups tabs show connector health warnings | Correct (P9-09) |

## 8. Explicit non-goals

- Do not implement provisioning-to-identity-connector integration logic — that belongs to Phase 7 implementation, not this ripple note
- Do not add identity readiness checks to the setup wizard — the Connections tab is the designated setup surface
- Do not build a cross-lane readiness dashboard — that belongs to Phase 12 observability
- Do not update downstream phases (10–12) — those are handled by Prompt 15
- Do not add configuration governance for identity connectors — that belongs to Phase 10
- Do not move secret handling into SPFx under any circumstances
