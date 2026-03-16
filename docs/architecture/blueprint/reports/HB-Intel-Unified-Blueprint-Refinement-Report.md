# HB Intel — Unified Blueprint Refinement Report

> **Doc Classification:** Historical Foundational — audit trail and process record for the v1.1 refinement of `HB-Intel-Unified-Blueprint.md`; created 2026-03-14 by the HB Intel Unified Blueprint Refinement Agent.

**Version:** 1.0
**Date:** 2026-03-14
**Task:** HB Intel Unified Blueprint Refinement Agent
**Refines:** `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` (v1.0 → v1.1)

---

## Executive Summary

This report documents the v1.1 refinement of `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md`, which was created at v1.0 earlier on 2026-03-14 by the HB Intel Unified Blueprint Authoring Agent.

The refinement addressed six mandatory targets identified in the authoring task scope review:

1. **Status-language precision** — The v1.0 document contained present-tense assertions about what the repository "currently contains" and what phases are "complete" or "in progress." Because this document is a Canonical Normative Plan (not a Tier 1 Canonical Current-State document), such language risked agents or readers treating it as an authority on present-state truth — a role reserved exclusively for `current-state-map.md`. All status language was qualified with explicit attribution to `current-state-map.md`.

2. **Governance clarity on classification** — The v1.0 banner and footer were ambiguous about the document's authority tier. The phrase "Tier 1 banner applied" in the footer could be read as claiming Tier 1 source-of-truth status. The banner description was sharpened and the footer and §3 were augmented with an explicit "Authority note."

3. **Explicit non-goals / out-of-scope section** — The v1.0 document lacked any structured statement of what is intentionally out of MVP scope, what architectural bets have not yet been committed, and what constitutes a "future direction" signal vs. a binding target. §17 was added to provide this clarity.

4. **Stronger telemetry and KPI doctrine** — The v1.0 §15 (renumbered in v1.1 to §16) provided a light instrumentation reference. For a product with lean post-handoff staffing, this was insufficient: adoption signals, reliability thresholds, support-burden indicators, and HBI feedback loops all require explicit doctrine. §16 was fully rewritten with seven structured subcategories and named KPI targets.

5. **Support and observability model for lean staffing** — The v1.0 document had no dedicated section documenting what operational visibility IT and admins need to self-serve after handoff. §9.2 (Operational Observability Doctrine) was added to address this, specifying what must be visible from the Admin workspace, what must be diagnosable from logs/audit trail, and what workflows require retry/escalation/takeover surfaces.

6. **Sharper implementation-trust / explainability doctrine** — The v1.0 §7.2 covered explainability in ~8 lines with high-level principles. The v1.1 expansion turned this into a full doctrine covering visible failure states, permission clarity, sync-state indicators, reasoning explainability, ownership visibility, user-facing recovery summaries, admin-facing diagnostic surfaces, and a prohibition on opaque automation in core workflows.

**Primary artifact refined:** `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` (v1.0 → v1.1)
**Secondary artifact:** This report (`HB-Intel-Unified-Blueprint-Refinement-Report.md`)

---

## Status-Language Adjustments

The following changes were made across the document to ensure every status assertion is explicitly attributed to `current-state-map.md` rather than stated as blueprint-internal fact.

| Location | v1.0 Text (representative) | v1.1 Change |
|----------|-----------------------------|-------------|
| Inline `Doc Classification` banner | "master summary architecture and program narrative for HB Intel; reconciles Blueprint V4..." | Changed to: "program narrative and master summary architecture for HB Intel. This document summarizes target-state intent, operating doctrine, delivery history, and roadmap. It does **not** govern present-state truth; that role belongs exclusively to `current-state-map.md` (Tier 1)." |
| §2.1 package inventory | "The workspace currently contains..." | Changed to: "Per `current-state-map.md §3`, the workspace contains..." |
| §2.1 section note | Generic advisory to check current-state-map | Expanded with explicit language: "This document does not maintain an independent current-state inventory. `current-state-map.md` is the Tier 1 authority..." |
| §3 (document's own role) | Described document as "authoritative reference" without qualification | Added explicit "Authority note" paragraph: "This document is a Canonical Normative Plan — it describes what HB Intel must become and how it must operate. It is NOT the source of truth for what currently exists..." |
| §17/§18 phase history table | Column header "Status" with values like "Complete", "In Progress" | Column header changed to "Per current-state-map"; all values prefixed "Per CSM:" to make attribution unambiguous |
| §16 primitive table | Header "Status" | Changed to "Status per current-state-map" |
| All phase delivery sections | Tense-ambiguous constructions ("Phase 1 is complete") | Prefixed with "Per `current-state-map.md`..." throughout |

---

## Governance / Classification Adjustments

### Banner Description

The inline `Doc Classification` banner — which ADR-0084 §3 requires on all Tier 1/2 high-risk documents — was made governance-precise in two ways:

1. The phrase "master summary architecture" (first in the description) was demoted to a secondary descriptor. The leading phrase was changed to "program narrative" to signal that the document's primary role is synthesizing intent, not recording present-state truth.
2. The explicit disavowal of present-state authority ("does **not** govern present-state truth; that role belongs exclusively to `current-state-map.md` (Tier 1)") was added directly to the banner so it appears immediately on document open.

### Footer Metadata

The v1.0 footer contained the line:

```
Tier 1 banner applied (see top of file)
```

This was misleading because "Tier 1" in the governance model refers to the document tier (i.e., `current-state-map.md`), not the banner format. An agent or developer reading "Tier 1 banner applied" could incorrectly conclude this document carries Tier 1 authority.

Changed to:

```
Inline banner applied (program narrative layer — does not govern present-state truth)
```

Additionally, a stale line was removed:

```
Row in current-state-map.md §2: To be added at creation.
```

This line was accurate at v1.0 creation time but became stale immediately after Task 2 completed (the row had already been added). It was removed and replaced with accurate version metadata:

```
Version: 1.1 (refined 2026-03-14 — see HB-Intel-Unified-Blueprint-Refinement-Report.md)
```

### Authority Note in §3

A dedicated "Authority note" paragraph was added to §3 (This Document's Role) to make the governance relationship explicit for any reader who does not closely read the banner:

> This document is a **Canonical Normative Plan** — it describes what HB Intel must become and how it must operate. It is NOT the source of truth for what currently exists in the repository, what phases are currently complete, or what the current package manifest is. Those roles belong exclusively to `current-state-map.md` (Tier 1). When this document's status descriptions conflict with `current-state-map.md`, `current-state-map.md` governs.

---

## New Sections Added

### §7.2 — Implementation Trust and Explainability (expanded)

**v1.0 coverage:** Approximately 8 lines covering high-level principles (no silent failures, explain why actions are unavailable, indicate degraded state).

**v1.1 expansion:** Full doctrine with eight named requirements:

1. **Visible failure states** — No silent failures; every failure surfaces what failed, why, and what to do next. Error messages must never expose raw stack traces to non-admin users but must provide enough detail to file an IT ticket.
2. **Permission clarity** — When an action is unavailable, explain why (role, provisioning state, feature flag) rather than hiding the control silently. Users should never wonder whether a feature exists.
3. **Sync-state clarity** — Always indicate degraded or stale state. Any data surface that could be cached or delayed must carry a "last synced [time]" indicator. Stale data must be labeled, not served silently as fresh.
4. **System reasoning** — When HBI or background automation takes an action (routing, filtering, prioritizing), the outcome must be explainable after the fact from in-app history or audit log without requiring server log access.
5. **Ownership and handoff visibility** — Every workflow item must have a visible current owner, a visible due state, and a visible next step. Dead-end workflow states (no owner, no next action) are a defect.
6. **User-facing recovery summaries** — When a background saga fails and recovers (provisioning rollback, retry), users with visibility into that workflow must receive a human-readable summary of what happened and what the current state is.
7. **Admin-facing diagnostic surfaces** — The Admin workspace must expose enough structured diagnostic information that an IT admin can identify the root cause of common issues (failed provisioning, permission denial, sync failure) without needing to access server logs or the Azure portal.
8. **No opaque automation in core workflows** — No background automation that directly affects core workflow state (provisioning, role assignment, notification routing) may operate without a corresponding audit entry visible from the Admin workspace.

### §9.2 — Operational Observability Doctrine (new)

Added as a subsection of §9 (SharePoint Provisioning Architecture), because provisioning is the highest-complexity background automation in the system and the primary operational support burden post-handoff.

Doctrine covers four areas:

1. **What must be visible to admins without engineering help:** Provisioning saga state (all 7 lifecycle states), error logs with human-readable descriptions, role assignments by user and site, feature flag status, active session counts.
2. **What must be diagnosable from logs/audit trail:** Provisioning failure root cause (which saga step failed and why), permission denial reasoning (which rule and which role), background automation outcomes (what ran, what changed, what the final state is).
3. **Workflows requiring observable retry/escalation/takeover surfaces:** Provisioning saga retry; stuck saga manual-advance; failed role assignment re-trigger; notification routing override.
4. **IT help-desk handoff requirements:** The Admin workspace is the primary IT support tool — IT staff must be able to resolve tier-1 support issues from Admin workspace UI alone. IT-readable runbooks must reference Admin workspace screens, not direct DB/log queries. Escalation path to engineering must be documented with specific signal thresholds.

### §14.2 — Architecture Guardrail for External Collaboration (new binding design rule)

Added as a subsection of §14 (External Collaboration Rule), which in v1.0 documented only the policy ("no MVP decision may make external collaboration structurally impossible later"). §14.2 converts this policy into concrete architectural constraints:

1. **Identity model** — The identity and principal model must support a future "external" principal type that carries limited permissions. External principals must be first-class in the data model — not implemented as a hack on internal roles.
2. **Data visibility model** — Records intended for potential future external visibility must not be hard-coded as `internal-only` at the data layer. Visibility flags must be a runtime property.
3. **Workflow routing** — `@hbc/workflow-handoff` must support future handoffs to external recipients. The handoff recipient model must not assume `internal principal` at the schema level.
4. **API surface** — The Azure Functions proxy must be designed with the possibility of authenticated external callers. API contracts must not assume SharePoint identity as the only valid auth context.
5. **Violation rule** — Any MVP decision that violates these constraints requires an explicit ADR documenting the trade-off and the remediation path before the decision may be locked.

### §16 — Telemetry, KPI, and Adoption Doctrine (fully rewritten)

The v1.0 §15 (renumbered §16 in v1.1 due to §17 insertion) was replaced in full. The v1.1 version has seven structured subcategories:

- **§16.1 Telemetry philosophy** — Lean post-handoff staffing makes instrumentation non-optional; data-driven diagnosis is required when there is no dedicated support engineer.
- **§16.2 Adoption and trust metrics** — Daily active usage rate target ≥60% of provisioned users; return rate (weekly recurrence); task completion rate target ≥85%; trust signal target ≥70% (users who complete a workflow without abandonment or error).
- **§16.3 Workflow efficiency metrics** — Status-chasing reduction (reduction in Slack/email status queries post-launch); provisioning cycle time; handoff wait time; form completion time.
- **§16.4 Operational reliability metrics** — Provisioning success rate target ≥95%; error recovery rate; unhandled error rate (must be 0 for core workflows); saga compensation accuracy target ≥99%.
- **§16.5 Support burden metrics** — IT escalation rate (target: trend to 0 for known issue types); admin self-resolve rate target ≥80%; help-desk ticket volume (target: downward trend); time-to-diagnose target ≤5 min for documented issue types.
- **§16.6 HBI accuracy and feedback** — Suggestion acceptance rate; correction rate (user overrides HBI recommendation); feedback signal volume (required minimum for each HBI surface); non-degradation check (no HBI surface may degrade week-over-week without a P1 investigation).
- **§16.7 Business value trend** — Lagging indicators, post-stabilization. Not instrumented at MVP but framework must support their addition.
- **§16.8 Instrumentation reference** — PH9b (Telemetry and Analytics) is the implementation phase; these KPI targets are the doctrine inputs to that phase.

### §17 — Non-Goals, Deferred Items, and Future Directions (new)

Added as a full new section between former §16 (Platform Primitives) and former §17 (Phase Delivery History). Contains four subsections:

- **§17.1 MVP Non-Goals (explicit)** — Ten named items that are intentionally out of MVP scope: external collaboration (future direction, not MVP), offline-first architecture, third-party ERP/Procore integrations, AI-generated draft content, HB Site Control mobile support, full PWA (service worker, app installation), Review Mode, My Work Feed / PH9b analytics surfaces, SF16 semantic search, SF22 T08–T09 (advanced estimating features).
- **§17.2 Architectural bets not yet committed** — Items where the direction is documented but no ADR has locked the implementation: Procore API integration model, Azure Monitor Workbooks for KPI dashboards, SharePoint archival strategy, Review Mode workflow model, external collaboration portal design, B2B federation identity approach.
- **§17.3 Intentionally deferred technical scope** — PH7-RM-* plans (classified Deferred Scope; activation requires reclassification + named phase milestone), PH9b (telemetry/analytics), SF16, SF22 T08–T09.
- **§17.4 Definition of "future direction" language** — Clarifies that any phrase in this document using "future," "will eventually," "planned," or similar forward-looking language is a signal of direction, not a commitment or instruction. Only ADRs and Canonical Normative Plan phase assignments constitute binding commitments.

---

## Telemetry / Support / Trust Improvements

Summary of the three doctrine areas materially strengthened in v1.1:

| Area | v1.0 State | v1.1 State |
|------|-----------|-----------|
| **Telemetry and KPI** | 1 subsection with light instrumentation reference; no named KPI targets; no structured adoption/reliability/support breakdown | 7 subcategories; named KPI targets for adoption (≥60% DAU rate), reliability (≥95% provisioning success, ≥99% saga compensation), support (≤5 min time-to-diagnose), HBI (acceptance rate + non-degradation check) |
| **Operational observability** | No dedicated section; implicit in provisioning and admin model | §9.2 added: explicit doctrine on what admins must see, what must be diagnosable, which workflows need retry/takeover surfaces, how IT help-desk handoff works |
| **Implementation trust** | ~8 lines of high-level principles (no silent failures, explain why unavailable, indicate stale state) | §7.2 expanded to 8 named requirements: visible failure states, permission clarity, sync-state indicators, system reasoning, ownership visibility, user-facing recovery summaries, admin diagnostic surfaces, prohibition on opaque automation |

---

## Companion File Updates

| File | Change Made | Reason |
|------|-------------|--------|
| `docs/architecture/blueprint/current-state-map.md §2` | Matrix row for unified blueprint updated to reflect v1.1 refinements; refinement report row added | Classification requirement — every new document must have a matrix row; unified blueprint row description must reflect current version |
| `CLAUDE.md` | Progress note under `<!-- IMPLEMENTATION PROGRESS & NOTES -->` updated to reflect v1.1 refinements and refinement report | Agent session anchor awareness; comment-only per locked-document policy |

### current-state-map.md §2 final matrix rows (v1.1 era)

| Document | Class | Note |
|----------|-------|------|
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` | **Canonical Normative Plan** | Inline banner applied (program narrative layer — does not govern present-state truth); incorporates all 20 interview-locked doctrine decisions; v1.1 refined 2026-03-14 with governance-safe status language, non-goals section (§17), structured telemetry (§16), support/observability doctrine (§9.2), external-collaboration guardrail (§14.2), and sharpened implementation-trust doctrine (§7.2) |
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint-Authoring-Report.md` | **Historical Foundational** | Tier 2 — matrix classification only; audit trail for unified blueprint v1.0 creation; created 2026-03-14 |
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint-Refinement-Report.md` | **Historical Foundational** | Tier 2 — matrix classification only; audit trail for unified blueprint v1.1 refinement pass; created 2026-03-14 |

---

## Remaining Follow-Up Notes

1. **§16 KPI targets are aspirational at this stage.** The named targets (≥60% DAU rate, ≥95% provisioning success, etc.) are doctrine inputs for PH9b instrumentation planning. They have not been validated against baseline data (no baseline exists pre-launch). These targets should be reviewed by product stakeholders before pilot launch and adjusted if evidence warrants.

2. **§9.2 observability requirements have no implementation plan yet.** The doctrine is now documented but the specific Admin workspace UI features required to satisfy it (structured saga state viewer, human-readable error log browser, role assignment surface) are not yet in any active task plan. These requirements should be incorporated into the Admin workspace design phase (PH7-RM-* activation or equivalent).

3. **§14.2 external collaboration guardrail requires a future compliance audit.** At MVP design review time (before MVP branch lock), each of the four architectural constraints in §14.2 should be verified against the in-flight design. Any constraint that cannot be satisfied at MVP without a disproportionate cost should trigger an ADR.

4. **§17.2 architectural bets (Procore, Azure Monitor, etc.) are unresolved.** These are documented as directions, not commitments. Each will require an ADR before implementation. No action is required now.

5. **ADR-0090 remains the gate for all feature-expansion work.** This report documents v1.1 doctrine refinements only. The PH7.12 stabilization gate is not affected by this pass. ADR-0090 must still be created and accepted before any feature-expansion phase begins.

6. **SF22 T08–T09 remain undefined.** Both this document (§17.3) and the authoring report note this gap. The tasks remain in Deferred Scope status.

---

## Link Validation Summary

All relative links in `HB-Intel-Unified-Blueprint.md` v1.1 were verified for structural correctness (unchanged from v1.0 plus new references added in this pass):

| Link Target | Exists? | Notes |
|-------------|---------|-------|
| `docs/architecture/blueprint/current-state-map.md` | ✅ | Tier 1 document — present |
| `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` | ✅ | Tier 2 document — present |
| `docs/architecture/plans/hb-intel-foundation-plan.md` | ✅ | Tier 3 document — present |
| `docs/architecture/adr/` (directory) | ✅ | Active ADR series confirmed |
| `docs/reference/platform-primitives.md` | ✅ | Platform primitives registry — present |
| `docs/architecture/plans/ph7-remediation/PH7.12-Final-Verification-and-Sign-Off.md` | ✅ | PH7.12 gate plan — present |
| `docs/architecture/plans/PH7-Estimating-Features.md` | ✅ | PH7 expansion master plan — present |
| `docs/architecture/plans/MVP/MVP-Project-Setup-Plan.md` | ✅ | MVP master plan — present |
| `docs/architecture/plans/MVP/MVP-Plan-Review-2026-03-13.md` | ✅ | Plan review — present |
| `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md` | ✅ | Crosswalk — present |
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint-Authoring-Report.md` | ✅ | Authoring report — present |
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint-Refinement-Report.md` | ✅ | This file — present (created 2026-03-14) |
| `CLAUDE.md` | ✅ | Governance file — present |

All companion file references added in this refinement pass (refinement report path in blueprint footer, CLAUDE.md progress note, current-state-map matrix row) use consistent relative paths matching repository structure.

---

_End of HB Intel Unified Blueprint Refinement Report_
_Refines: `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` (v1.0 → v1.1)_
_Created: 2026-03-14_
