# HB Intel — Unified Blueprint

> **Doc Classification:** Canonical Normative Plan — program narrative and master summary architecture for HB Intel. This document summarizes target-state intent, operating doctrine, delivery history, and roadmap. It does **not** govern present-state truth; that role belongs exclusively to `current-state-map.md` (Tier 1). Status assertions in this document are narrative summaries — always verify implementation truth against `current-state-map.md` and package READMEs.

**Version:** 1.1 (Refined — 2026-03-14)
**Originally Created:** 2026-03-14
**Refined:** 2026-03-14
**Governed by:** `CLAUDE.md` v1.3 · ADR-0084 · `current-state-map.md` (Tier 1) · Blueprint V4 (Tier 2)

---

## Document Purpose and Governing Interpretation Model

This document is the **master summary architecture and program narrative** for HB Intel. It answers the question: "What is HB Intel, how does it work, what drives its decisions, and where is it going?" — as a structured synthesis of the source documents that each govern their own domain.

### What This Document Is

- The single place to understand HB Intel's product direction, operating principles, architecture intent, delivery history, and active roadmap.
- The authoritative home for interview-locked doctrine decisions — product operating principles that were previously absent from or scattered across the blueprint corpus.
- A navigation anchor directing readers to the right authoritative source for each category of question.

### What This Document Is NOT

**Do not treat this document as present-truth authority.** The following authoritative sources govern their own domains independently of this summary:

- **`current-state-map.md` (Tier 1)** governs present-state truth. When this document and current-state-map disagree about what currently exists, current-state-map governs.
- **Individual ADRs** are the authoritative record of specific architectural decisions. This document references ADRs but does not supersede them. See `docs/architecture/adr/` (111+ active, 6 archived).
- **Blueprint V4 (Tier 2)** is the locked target-state architecture reference. This document summarizes it; it does not replace it.
- **Task-level plans** contain implementation-level specification. This document describes what must be built; task plans describe how to build it.

### Reading Layers (ADR-0084)

| Layer | Question | Authoritative Source | Classification |
|-------|----------|---------------------|----------------|
| **1 — Present Truth** | What does the repo contain right now? | `current-state-map.md` + package READMEs | Canonical Current-State |
| **2 — Target Architecture** | What must HB Intel become? | `HB-Intel-Blueprint-V4.md` | Canonical Normative Plan |
| **3 — Program Narrative** | What is HB Intel, why, and where is it going? | **This document** | Canonical Normative Plan (summary layer) |
| **4 — Historical Baseline** | How did we get here? | `hb-intel-foundation-plan.md`, PH2–PH6 plans | Historical Foundational |
| **5 — Locked Decisions** | Why was each architecture choice made? | `docs/architecture/adr/` | Permanent Decision Rationale |
| **6 — Active Execution** | What is being built now? | PH7 plans, MVP plans, SF22 plans | Canonical Normative Plan |

---

## §1. Product Thesis and Operating Principles

### 1.1 What HB Intel Is (Locked Doctrine — Interview Decision 1)

HB Intel is a **cross-departmental project lifecycle management application** for H&B Construction. In its early stages it breaks silos by replacing fragmented and unreliable legacy methods and filling workflow gaps that fall between departments, teams, and third-party tools.

Over time, HB Intel will grow into a **unified overlay across third-party systems** — improving collaboration, visibility, analytics, team performance, operational efficiency, and leadership decision-making. It does not aim to replace all third-party systems in the near term; instead it provides the coordination, operating, and experience layer on top of those systems.

### 1.2 Product Definition (Target State — Blueprint V4)

*Per Blueprint V4 (Tier 2 — target-state intent). Present build status is governed by `current-state-map.md`.*

HB Intel's target architecture delivers three integrated delivery surfaces:

- **Standalone PWA** — the primary, Procore-like experience for fluent use outside SharePoint. Full workspace-switching experience across all 14 project and departmental workspaces.
- **11 Dedicated Breakout SPFx Webparts** — focused departmental and project-specific views embedded inside SharePoint sites. Simplified headers; each webpart serves one domain.
- **HB Site Control** — a separate mobile-first connected application for field construction personnel. Replicates Procore Observations functionality plus safety monitoring and job-site visibility.

### 1.3 Core Operating Principles (Locked Doctrine — Interview Decisions 5, 6, 8, 11, 12)

**Clarity and trust over raw automation or flexibility.** When a design decision pits automation speed against user understanding, HB Intel defaults to the choice that is easier to understand and audit. Users must be able to see why something happened, why they can or cannot act, and what comes next.

**Balanced standardization.** Important core rules are enforced (e.g., required project fields, step sequencing in setup flows). Practical variation is permitted where it creates clear value and does not undermine data quality or accountability. This is not "configure everything" nor "enforce everything."

**Adoption and trust first.** The primary success metric at launch is whether people adopt the product and trust it with their real work. Efficiency and workflow improvement are secondary outcomes that follow from adoption. A fast, polished, but mistrusted tool has failed.

**Unified work and accountability as the primary long-term advantage.** HB Intel's durable competitive position comes from being the single system where everyone can see who owns what, what has changed, and what is expected next — across departments and projects. Strategic intelligence (BD scoring, health indicators, post-bid analysis) and modern lifecycle management are secondary competitive extensions.

---

## §2. Target Architecture Summary

*Source: Blueprint V4 (Tier 2 — target-state intent). Present implementation truth is governed by `current-state-map.md §3` and package READMEs. Statements in this section describe the architectural target, not a certification of current build status.*

### 2.1 Monorepo Structure

The monorepo uses **pnpm workspaces + Turborepo**. All workspace members live under one of four scopes:

| Scope | Content |
|-------|---------|
| `packages/` | Core platform packages, shared-feature primitives, feature packages |
| `apps/` | SPFx webparts, standalone applications (PWA, dev-harness, HB Site Control) |
| `backend/` | Azure Functions serverless backend |
| `tools/` | Build and governance tooling |

Per `current-state-map.md §3`, the workspace contains 50+ members across six categories. See that document for the complete, authoritative inventory.

### 2.2 Core Architecture Decisions (All Locked — Blueprint §2)

**Dual-mode hosting and deployment**
- PWA: Vercel for MVP (static hosting with edge functions); migrate-ready for Azure Static Web Apps.
- 11 Breakout SPFx Webparts: SPFx 1.18+; deployed via SharePoint App Catalog.
- HB Site Control: Dedicated Vite app (mobile-first, responsive); future-proof for React Native migration.
- Backend: Azure Functions (serverless, Node.js); thin proxy for all PWA data operations.

**Dual-mode authentication (locked)**
- PWA: MSAL.js with enterprise Microsoft credentials (Azure AD app registration).
- SPFx Webparts and HB Site Control: Native SharePoint context (`this.context.pageContext.user`). No separate login; permissions via SharePoint groups.
- `@hbc/auth` wraps both modes behind a unified interface with automatic mode detection.

**Ports/adapters data access (not a god-interface)**
- The existing `IDataService` (250 methods, tight domain coupling) is replaced by ~15 domain-scoped repository interfaces (e.g., `ILeadRepository`, `IEstimatingRepository`).
- Concrete adapters swap per runtime mode: PnPjs for SPFx, Azure proxy for PWA, in-memory mock for dev/test.
- The mode-aware factory resolves the correct adapter from the environment automatically.

**State management**
- `@hbc/auth` and `@hbc/shell` use **Zustand** for all client state — no React Context cascades.
- Server state (data fetching, caching, mutations) is managed via **TanStack Query v5**.
- Routing uses **TanStack Router v1** with isolated per-app instances and type-safe route guards.

**UI ownership**
- `@hbc/ui-kit` owns all reusable visual components (Fluent UI v9 + Griffel + HB Intel Design System).
- No package outside `@hbc/ui-kit` may introduce new standalone presentational components or visual primitives.
- Feature packages compose `@hbc/ui-kit` components; they do not define their own visual layers.

**Navigation and shell (Procore-aligned)**
- Procore-style header: ProjectPicker (left, visible only in Project Hub workspace) + workspace-specific tool picker (center).
- M365 waffle app launcher (top right): opens grid of 14 workspaces.
- Global project persistence via Zustand `projectStore` — persists the active project across workspace navigation.
- In non-Project-Hub workspaces, the tool picker contains an emphasized "Back to Project Hub — {Project Name}" entry.
- Breakout SPFx webparts use the simplified shell: no project picker, no app launcher.

### 2.3 Tech Stack (Locked — Blueprint §8)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Hosting | PWA (Vercel → Azure) + 11 SPFx webparts | Focused dual-mode use |
| Monorepo | pnpm + Turborepo | Fast, incremental builds |
| Framework | React 18 | Established |
| UI Library | Fluent UI v9 + Griffel + HB Intel Design System | SharePoint consistency + premium branding |
| Routing | TanStack Router v1 | Type-safe, isolated per-app instances |
| Server State | TanStack Query v5 | Caching, optimistic updates, invalidation |
| Client State | Zustand | No context cascades |
| Tables | TanStack Table + virtualization | Large datasets (10k+ rows) |
| Charts | ECharts (lazy-loaded) | Construction metrics |
| Data Access | Ports/adapters + Azure Functions proxy | Swappable, mode-aware |
| Backend | Azure Functions (Node.js v4, serverless) | Scalable, secure |
| Testing | Vitest + Playwright + Storybook | Comprehensive |
| Linting/CI | ESLint + Turborepo + GitHub Actions | Enforcement + caching |
| Dev Experience | Vite dev-harness (all apps, mocked backend) | HMR, isolated domain iteration |

---

## §3. Current-State Summary

> **Authority note:** This section is a narrative orientation only. All statements in §3 summarize `current-state-map.md` as of 2026-03-14. For authoritative present-state truth, always read `current-state-map.md` directly — it governs when any discrepancy exists.

### 3.1 Implementation Maturity (Narrative Summary — as of 2026-03-14)

Per `current-state-map.md §3–§4`, Phases 0 through 6F are recorded as complete. The monorepo has a working foundation:

- Core platform packages (models, data-access, query-hooks, auth, shell, app-shell, ui-kit, provisioning) are at v0.0.1 or above per package READMEs.
- `@hbc/provisioning` supports the provisioning lifecycle with SignalR real-time feedback (Phase 6 deliverable).
- Per `current-state-map.md §2`, shared-feature primitive families SF04–SF21 are largely complete; SF06 and SF09 are at scaffold stage; SF16 and SF22 are in planning.
- 11 feature packages exist as scaffolds under `packages/features/`.
- Phase 7 stabilization (PH7.1–PH7.11) is recorded as complete in `current-state-map.md`; PH7.12 and PH7.13 are active.

### 3.2 What Is Not Yet Built (Per current-state-map.md)

- Feature-level business logic in the 11 SPFx webpart applications (awaiting PH7.12 sign-off + ADR-0090).
- MVP provisioning flow (next concrete increment, awaiting plan refinement and ADR-0090 on disk).
- Full PWA build (Phase 9A — post PH7 expansion).
- HB Site Control application (Phase 11).
- SF16 Search, SF22 Post-Bid Learning Loop (planning stage only per current-state-map §2).

---

## §4. Role / Device / Connectivity Model

### 4.1 Primary MVP Users (Locked Doctrine — Interview Decision 4)

The first users of HB Intel at launch are **project management and project operations staff**. These are the people who set up new projects, track project readiness, own cross-departmental handoffs, and chase information between departments. Estimating, Accounting, and Project Hub users are explicitly the initial target.

Departmental users (Business Development, Safety, Risk Management, etc.) are in the MVP rollout but are secondary to the core PM/operations audience.

### 4.2 Role Inventory

Per the auth system architecture (`@hbc/auth`, `@hbc/auth-core`), seven roles span the 14 workspace surfaces:

- **Project Management / Project Operations** — Primary users; full Project Hub access; initiate and track provisioning requests.
- **Estimating** — Department-site webpart; pursuit tracking, bid readiness, kickoff management; project setup status page ownership.
- **Accounting** — Department-site webpart; project setup controller; triggers "Save + Provision Site"; Controller Inbox.
- **Business Development** — Department-site webpart; lead tracking, score benchmarking, heritage intelligence.
- **Leadership** — Leadership workspace; portfolio dashboards, health indicators.
- **Admin** — Admin workspace; provisioning failures, error logging, user management, feature flags, support escalation surface.
- **Safety / QC / Risk / OE / HR** — Department-specific webparts; scoped to their domains; post-MVP rollout priorities.

### 4.3 Device Rule (Locked Doctrine — Interview Decision 10)

Device requirements are **context-driven**:

- Workflows that happen at a desk (project setup, estimating, accounting entry, leadership dashboards) may remain desktop-rich in design. They are optimized for productivity over mobile simplicity.
- Workflows that happen in the field or are reasonably expected on a tablet must be **intentionally simplified for tablet/mobile from the start**. This includes HB Site Control, field observations, safety monitoring, and any checklist-style approval that a project manager might complete from a site visit.

The desktop-first default does not mean mobile is an afterthought — it means mobile simplicity is a deliberate first-class design decision for field-intended surfaces. The Complexity Dial (`@hbc/complexity`) supports this by adapting UI density per context.

### 4.4 Offline / Degraded-Use Standard (Locked Doctrine — Interview Decision 9)

**MVP requirement:** Recent information and user effort must be protected in degraded network conditions. Users must not lose work they have already entered. Users must have access to recently loaded data even when connectivity is interrupted.

**Architectural requirement:** The architecture must keep the door open for stronger future offline-first behavior without requiring a rebuild. `@hbc/session-state` provides the offline-safe persistence primitive for this posture.

**MVP posture is defensive:** Full offline-first operation (where all workflows can complete without network) is not an MVP requirement. Protect existing effort and recent reads; block writes that require connectivity with a clear, explicit error rather than a silent failure.

**Degraded-state UX requirements:**
- Users must always know they are in a degraded/offline state — the system must indicate this explicitly, not silently.
- Any action that cannot be completed offline must surface a clear explanation, not a generic error.
- Data that was loaded before connection loss must remain accessible and clearly labeled as "last synced [time]."

**Field note:** HB Site Control will require stronger offline posture than the PWA or webparts. This is an explicit future design requirement that must be addressed before HB Site Control enters active development.

---

## §5. Source-of-Truth and Overlay Doctrine

### 5.1 HB Intel's Role in the Data Ecosystem (Locked Doctrine — Interview Decision 17)

In early production, **HB Intel is primarily the coordination, operating, and experience layer**. Many connected platforms (Procore, Sage Intacct, Building Connected, SharePoint) remain the official source of truth for their own domain data until HB Intel intentionally replaces a specific workflow.

This means:
- A project's schedule of values lives in Sage Intacct until HB Intel takes over that specific workflow.
- A project's RFIs and submittals live in Procore until HB Intel provides a direct replacement.
- SharePoint document libraries remain the authoritative store for project documents; `@hbc/sharepoint-docs` wraps them but does not duplicate them.

HB Intel owns its own workflow data: project setup state, provisioning status, estimating tracking tables, scorecard/PMP data, BD pipeline, and any workflow that has no other authoritative home.

**Important implication:** HB Intel surfaces data it does not own. When that source changes, HB Intel's view may be stale. Features that aggregate external-source data must be designed with explicit staleness indicators and clear sync provenance — not presented as authoritative facts.

### 5.2 Third-Party Overlap Posture (Locked Doctrine — Interview Decision 7)

**Near term:** HB Intel functions as a combination of **front door** (starting point for construction lifecycle events, e.g., "Save + Provision Site") and **aggregation layer** (surfacing key data from multiple systems without owning the underlying records).

**Longer term:** HB Intel will selectively replace third-party workflows where it creates clear, demonstrable value. This replacement is always intentional and governed — not organic drift. Each replacement requires an explicit product decision and data ownership transfer.

**Integration reference points:** Building Connected (BD pipeline deeplinking), Procore (future API integration), Sage Intacct (financial data aggregation). These are Phase 8+ integrations — not current commitments.

---

## §6. Accountability and Next-Move Doctrine

At all times, every outstanding action in HB Intel must have a clear owner and a clear next step. This is the **ball-in-court principle**, implemented as a platform primitive via `@hbc/bic-next-move`.

Rules:
- Every workflow, approval, or handoff surface must surface the current owner and the action required.
- Users must be able to see, at a glance, what they need to do and what is waiting on others.
- The system must explain why an action is or is not available to the current user (see §7.2 Implementation Trust).
- "Waiting on someone else" must be visible and attributable, not a black box.

This doctrine governs the design of:
- Provisioning status checklists (each step shows owner, status, and what comes next).
- Estimating tracking tables (ball-in-court column per pursuit).
- BD lead pipeline (current stage owner and next required action).
- Scorecard and PMP workflows (`@hbc/acknowledgment` for sign-off steps).
- Controller Inbox (Accounting side of project setup).

---

## §7. UX System Contract

### 7.1 Primary UX Orientation (Locked Doctrine — Interview Decision 3)

HB Intel is organized around two UX layers:

- **Primary layer: Personal Work Hub.** The first thing a user sees when opening HB Intel is oriented around their own work — what they need to do today, what is waiting on them, and what they last worked on. This is the "My Work" paradigm and is the dominant UX metaphor.
- **Secondary layer: Project Command Center.** The Project Hub workspace is the central per-project view. It surfaces project health, outstanding actions across all departments, key dates, and the status of major workflows for a given project.

This ordering matters for design priority: when a feature could live in either layer, preference is the personal work hub.

### 7.2 Implementation Trust and System Explainability (Locked Doctrine — Interview Decision 8)

HB Intel must be **highly visible and self-explaining**. This is not just a UX aspiration — it is an architectural requirement. Users and admins must be able to reason about the system without engineering assistance for routine operations.

**Required visibility categories:**

**Visible failure states.** Every failure must be surfaced explicitly. No silent failures. Failed operations must surface: what failed, why it failed (in layman's language), and what the user can do next. Generic "something went wrong" messages are not acceptable in core workflows.

**Permission clarity.** When a user cannot take an action, the system must explain why — not just hide the button. If an action is role-restricted, the explanation names the constraint. If an action requires a prerequisite step, the explanation names that step and where to complete it.

**Sync-state clarity.** When data is not current (degraded connectivity, background sync in progress, known lag), the system must indicate this explicitly. Users must never be misled into thinking they are seeing live data when they are not. Every cached or stale view must carry a "last synced [time]" or equivalent indicator.

**System reasoning for hidden or blocked actions.** Automation that runs without user input (e.g., bifurcated provisioning timer trigger, background sync) must be explainable after the fact. Users who ask "why did this happen?" must be able to find an answer in the UI — not just in server logs.

**Understandable ownership and handoff visibility.** Every workflow that moves between departments or roles must surface who sent it, when, and what is expected from the recipient. Handoffs must not be invisible.

**User-facing recovery summaries.** When a complex operation fails and recovery occurs (e.g., provisioning rollback), the user must see a human-readable summary of what was attempted, what failed, and what was restored — not a log dump.

**Admin-facing diagnostic surfaces.** Admins must be able to diagnose common issues from the Admin workspace UI without accessing server logs or contacting engineering. This requires: error history with structured context (step, input, output), retry history, and workflow audit trails accessible from the Admin dashboard.

**No opaque automation in core workflows.** The provisioning saga, background sync, and any automated recovery must leave human-readable traces. A user or admin encountering the aftermath of automation must be able to reconstruct what happened from in-app history alone.

### 7.3 HB Intel Design System

The UI must be **instantly recognizable as HB Intel** — professional, premium, and visually distinctive. The design system (in `@hbc/ui-kit`) includes:
- Signature color palette, typography scale, and elevation system.
- Custom semantic design tokens and Griffel-based theming.
- Smooth micro-interactions and guided eye-flow transitions.
- Distinctive dashboard cards, status badges, command bars, and data-table styling.

---

## §8. SharePoint Provisioning and Workspace Doctrine

### 8.1 Why Provisioning Is the MVP's Critical Feature

Provisioning is the first workflow HB Intel owns end-to-end. It establishes that the platform can:
- Reliably execute a complex, multi-step workflow without data loss.
- Make the Accounting → Estimating handoff work in practice.
- Deliver real-time SignalR feedback to end users.
- Enable the Admin workspace to recover from failures without engineering involvement.

Everything else in the MVP — tracking tables, dashboards, BD pipeline — depends on projects being properly set up. Provisioning is the data backbone of all downstream project workflows.

### 8.2 Provisioning Flow (Locked Architecture — Blueprint §2i, §2j)

**Trigger:** Accounting Manager clicks "Save + Provision Site" in the Accounting webpart. This fires the Azure Functions endpoint and redirects (or links) the user to the Estimating Project Setup page.

**Status ownership:** The Estimating Project Setup page is the single source of truth for provisioning status, feedback, and actions.

**Real-time checklist (SignalR):** Seven steps — site creation, document library setup, template files, data lists, site layout and web parts, permissions, hub association — each labeled with status (Completed / In Progress / Failed), timestamp, and count. Layman's language only.

**State model:** Persisted in a ProvisioningStatus SharePoint list + Azure Table Storage. The 7-state lifecycle (`Requested → InProgress → BasicComplete → DeferredPending → FullyComplete → RolledBack → Failed`) ensures no data loss at any failure point.

**Bifurcated execution:** Immediate basic site runs synchronously. Full-spec template application runs at 1:00 AM EST via timer trigger — no data loss between steps.

**Recovery:** Automatic rollback to the last successfully completed step on failure. "Retry" button re-attempts only remaining steps. On final failure: prominent "Escalate to Admin" button copies full context to Admin workspace.

**Admin experience:** Dedicated Provisioning Failures dashboard. Guided troubleshooting cards per failure type. One-click "Retry from Admin" and "Mark Resolved" actions. Full audit trail visible without engineering access.

---

## §9. Reliability, Recovery, and Operational Observability

### 9.1 Recovery Posture (Locked Doctrine — Interview Decision 14)

HB Intel uses **limited self-service recovery**:
- Users can retry simple actions once (e.g., re-submit a failed provisioning attempt, resubmit a form).
- Users can report issues through a visible escalation path (one-click "Escalate to Admin").
- Deeper recovery, state investigation, and manual resolution belong to **admin roles** — not end users.

### 9.2 Operational Observability Doctrine

The application will not have dedicated permanent development or support staff after handoff. Day-to-day support will be handled by IT. This constraint shapes several mandatory design requirements:

**What must be visible to admins without engineering help:**
- All provisioning saga state: current step, last error, compensation history, audit trail for each project.
- All error log entries: structured, human-readable, with context (who, what, when, what failed, what was attempted).
- User role assignments and permission state.
- Feature flag status (enabled/disabled per flag, per environment).
- Active sessions and recent activity per user (for support triage).

**What must be diagnosable from logs, audit history, and user-facing signals:**
- Why a provisioning attempt failed (which step, what error, what rollback occurred).
- Why a user cannot access a feature or action (role check, feature flag, or prerequisite state).
- Whether a background sync or timer trigger ran and whether it succeeded.

**What workflows require observable retry, escalation, or takeover surfaces:**
- Provisioning failures: retry-from-admin, mark-resolved, full audit trail.
- Any admin-recoverable workflow must have a UI surface for the recovery action — not just a log entry.
- Admin takeover paths must be tested before launch; they are not a fallback — they are a first-class production feature.

**IT help-desk handoff requirements (post-launch):**
- IT must be able to resolve common issues (user role problems, access errors, stale sessions) without application code knowledge.
- The Admin workspace UI must be the primary IT support tool, not direct database or log access.
- Known failure modes must be documented in IT-readable runbooks that reference specific Admin workspace screens.

**How automation reduces operational burden:**
- Notification-intelligence routing handles escalation paths automatically for users, reducing manual IT triage.
- Feature flags allow disabling problematic features without a deployment.
- Guided troubleshooting cards in the Admin workspace reduce the need for engineering intervention on known failure types.

### 9.3 Admin Role in the Recovery Model

The Admin workspace is the dedicated recovery surface:
- Provisioning Failures dashboard (guided troubleshooting, retry, mark-resolved).
- Error log viewer (all saga step failures, compensation actions, error details — human-readable).
- Feature flag management.
- User role and permission administration.
- Audit history viewer.

Admin is not a read-only observer. Admin users take recovery actions through the UI — not through direct database manipulation. This is a design requirement, not a preference.

---

## §10. Notification Attention-Governance

### 10.1 Notification Posture (Locked Doctrine — Interview Decision 13)

HB Intel uses **selective, intelligence-based notifications** — not broadcast alerts. Every notification sent must be actionable and relevant to the recipient. The system must not be noisy.

This doctrine is implemented through `@hbc/notification-intelligence` (SF10) using a tiered model:
- **Tier 1 — Mandatory action required:** The user cannot proceed without this. Delivered prominently, in-context.
- **Tier 2 — Awaited completion:** Something the user was waiting for has finished or changed. Delivered as a banner or badge.
- **Tier 3 — Awareness:** Useful context, not blocking. Delivered via feed or subtle indicator.
- **Suppressed:** Notifications that would generate noise without value are suppressed by default.

Role-gated notification visibility: Admin sees full provisioning logs for all projects; submitter sees full log for their own project; other eligible roles see start/finish banners only.

### 10.2 Non-Duplication Rule

All new notification surfaces must integrate with `@hbc/notification-intelligence` rather than building custom notification plumbing. This is a **Tier-1 Platform Primitive** — mandatory when notification concerns are present in a feature. Custom notification stacks in feature packages are a Zero-Deviation Rule violation.

---

## §11. HBI Assistive-First Doctrine and Measurement Model

### 11.1 HBI Doctrine (Locked Doctrine — Interview Decision 18)

HB Intel Intelligence (HBI) is **assistive-first in early stages**. This means:
- Summarize information that would otherwise require manual aggregation.
- Guide users through multi-step processes with smart defaults and context-aware suggestions.
- Suggest next steps based on workflow state.
- Explain changes and flag anomalies in human language.
- Improve speed and clarity without replacing user judgment.

HBI does not make binding decisions autonomously in early stages. It presents information and suggestions; users act on them.

**Future direction:** More robust HBI — predictive models, anomaly detection, contract risk scanning, bid success probability — as usage data accumulates. This evolution requires the measurement infrastructure in §11.2 and is not a current commitment.

### 11.2 HBI Measurement Requirements (Required Before Expanding HBI)

Before expanding HBI capabilities, the following must be in place:
- **Usage analytics:** What HBI features are used, how often, by which roles.
- **Accuracy tracking:** When HBI makes a suggestion, how often does the user accept it without modification? How often does it require significant correction?
- **User feedback loops:** In-context thumbs-up/thumbs-down on HBI suggestions; optional short commentary.
- **Non-degradation requirement:** HBI suggestions must never increase the time required to complete a core workflow. If measurement shows a suggestion is consistently ignored or overridden, it must be revised or removed.

This measurement gate is a hard prerequisite for expanded HBI scope — not a nice-to-have.

### 11.3 Implementation Reference

`@hbc/ai-assist` (SF15) is the platform primitive for HBI surface integration. It wraps Azure AI Foundry and provides consistent integration patterns for summarization, suggestion, and explanation surfaces.

---

## §12. Customization Boundaries

### 12.1 Customization Posture (Locked Doctrine — Interview Decision 19)

HB Intel allows **moderate customization within a governed structure**:
- Users and role groups can configure views, dashboard layouts, and column visibility within predefined bounds.
- The underlying data model, required fields, workflow sequences, and governance rules are not user-configurable.
- Administrators can configure feature flags, role assignments, and some notification thresholds.

### 12.2 Implementation Reference

`@hbc/project-canvas` (SF13) is the platform primitive for role-aware configurable dashboard surfaces. It implements drag-and-drop canvas configuration within governed widget boundaries. Feature packages compose project-canvas surfaces rather than building their own layout configuration systems.

---

## §13. Training / Self-Teaching Posture

### 13.1 Training Philosophy (Locked Doctrine — Interview Decision 16)

HB Intel should **teach itself as much as possible**. Formal training documentation exists, but the product reduces the need for it through:
- **Guided setup flows** (`@hbc/step-wizard`): Multi-step wizards that explain each step in context, not in a manual.
- **Smart defaults:** The system pre-populates fields intelligently based on role, project context, and past behavior.
- **Clear empty states** (`@hbc/smart-empty-state`): When a list or section is empty, the empty state explains why and offers the relevant action — not a generic "no data" message.
- **Contextual help:** Tooltips, annotations (`@hbc/field-annotations`), and inline guidance at the point of confusion.
- **Progressive coaching:** Role-aware coaching sequences that guide users through the first use of a new feature (UX Enhancement Layer, PH9b — currently Deferred Scope).

### 13.2 Design Readiness Gate

Every new feature must pass the question: "Can a new user figure out what to do on their first encounter without consulting external documentation?" If not, the feature is not ready for production.

---

## §14. External Collaboration Guardrail

### 14.1 MVP Scope (Locked Doctrine — Interview Decision 15)

The MVP is **internal-only**. External collaboration (sharing information, receiving input, or routing actions to parties outside H&B Construction) is not in MVP scope.

**Future production stages:** External collaboration is a **core expectation**, not an optional extension. This includes:
- External subcontractor or owner portal access to relevant project data.
- Bid submission acknowledgment and tracking visible to external estimating partners.
- Client-facing project health summaries for owner-managed projects.

### 14.2 Architecture Guardrail (Binding Design Rule)

No MVP identity, permission, data model, or workflow decision may make future external collaboration **structurally impossible to add**. This is an active design constraint, not a roadmap note. Specifically:

**Identity model:** The user and permission model must support a future "external" principal type without requiring a fundamental rebuild. Azure AD external guests, B2B federation, or explicit external-role concepts must not be architecturally excluded by MVP permission decisions.

**Data visibility model:** Records that will eventually need external visibility (project status, bid submissions, document packages) must not be hard-coded as internal-only at the data layer. Feature flags or role guards that restrict visibility today must be designed to be removed or extended — not as permanent hard stops.

**Workflow routing:** The `@hbc/workflow-handoff` routing model must support future handoffs to external recipients. Do not design handoff primitives that only ever resolve to internal H&B roles.

**API surface:** The Azure Functions proxy layer must be designed with the possibility that authenticated external callers will need to reach subset API endpoints in the future. Do not build backend security assumptions that can only ever work with internal Azure AD.

Violations of this guardrail require an explicit ADR documenting the trade-off and the future remediation path.

---

## §15. MVP Stream Definition and Launch Model

### 15.1 MVP Proof Criteria (Locked Doctrine — Interview Decision 2)

The MVP must prove **both** of the following — not just one:

1. **Reliable, standardized project setup.** The provisioning flow works end-to-end without data loss. Projects are set up consistently, correctly, and with minimal friction for the Accounting Manager and Estimating team.

2. **A better day-to-day work experience with clearer ownership and less chasing.** The day-to-day workflows for project management and operations staff are measurably improved. People can see what they need to do, who owns what is blocked, and what has changed — without sending emails or opening multiple systems.

An MVP that achieves provisioning without improving daily work experience has only proven half the value proposition. An MVP that improves daily experience without reliable project setup has no data backbone. Both must ship.

### 15.2 MVP Rollout Priority (Locked — CLAUDE.md §2)

Accounting → Estimating → Project Hub → Leadership → Business Development

### 15.3 Launch Success Hierarchy (Locked Doctrine — Interview Decision 11)

1. **Adoption and trust.** Users choose to use HB Intel for their real work.
2. **Efficiency and workflow improvement.** Measured time savings, fewer status-chasing emails, fewer missed handoffs.
3. **Leadership visibility.** Portfolio dashboards and health indicators are used in real decisions.

Success measures must be defined before pilot launch. See §16 for the telemetry doctrine.

### 15.4 Rollout / Support Posture (Locked Doctrine — Interview Decision 20)

The MVP launch uses a **high-touch pilot**:
- A small, selected group of users (PM, Estimating, and Accounting) pilots the product with a real project.
- The implementation team is available for rapid response during the pilot period.
- Automation handles as much onboarding and support routing as practical.
- After handoff, **IT handles day-to-day help-desk support**. There is no dedicated permanent application development or support staff.
- The product must be stable and self-serviceable enough for IT to support without deep application knowledge.

### 15.5 MVP Gate

**ADR-0090** (Phase 7 Final Verification and Sign-Off) must exist on disk before any MVP coding phase begins.

### 15.6 MVP Plan Branch Reference

The MVP plans live at `docs/architecture/plans/MVP/` (10 files: master plan + T01–T09). The MVP Plan Review (2026-03-13) identified corrections required before coding. See `MVP-Plan-Review-2026-03-13.md` for the full correction list.

---

## §16. Telemetry, KPI, and Adoption Model

*This section defines telemetry doctrine — what must be measured, when, and why. Specific threshold targets require stakeholder alignment before pilot launch. This section governs the measurement framework, not final numeric commitments.*

### 16.1 Telemetry Philosophy

HB Intel will operate with lean development and support staffing permanently. Data-driven diagnosis is not optional — it is the only way to understand platform health without dedicated on-call engineering. Every category below must have at least one instrument in place before the pilot launch.

### 16.2 Adoption and Trust Metrics (Primary — Gate for Expansion)

These metrics determine whether adoption is succeeding. They gate any decision to expand scope or add new features.

| Metric | Description | Target Maturity |
|--------|-------------|----------------|
| Daily active usage rate | % of target user group using the product daily within 30 days of pilot launch | ≥ 60% of pilot group |
| Return rate | Users who returned to HB Intel voluntarily after first use | Trending upward week-over-week |
| Task completion rate | % of users who complete their first provisioning trigger or project setup request without abandoning | ≥ 85% |
| In-product trust signal | Aggregate positive response on in-product feedback prompts at key workflow completion points | ≥ 70% positive |

### 16.3 Workflow Efficiency Metrics (Secondary — Evidence of Value)

| Metric | Description |
|--------|-------------|
| Status-chasing reduction | Measurable reduction in cross-departmental email or Teams messages about project setup status (baseline vs. post-pilot) |
| Provisioning cycle time | Time from Accounting trigger to BasicComplete and FullyComplete, per project |
| Handoff wait time | Time from workflow handoff event to recipient acknowledgment, per workflow type |
| Form completion time | Time to complete key multi-step forms (e.g., project setup request) on first attempt vs. repeat |

### 16.4 Operational Reliability Metrics (Required Before Pilot)

| Metric | Description | Threshold |
|--------|-------------|-----------|
| Provisioning success rate | Complete / partially complete / failed / rolled back per project | ≥ 95% complete without admin intervention |
| Provisioning error recovery rate | % of escalated provisioning failures resolved by Admin within 24 hours without engineering | Target: 100% for known failure types |
| Unhandled error rate | Application errors that surfaced no user-visible explanation | Must be 0 for core workflows at pilot launch |
| Saga compensation accuracy | % of failed provisioning attempts where rollback completed successfully | ≥ 99% |

### 16.5 Support Burden Metrics (Required — Lean Staffing Posture)

| Metric | Description | Target |
|--------|-------------|--------|
| IT escalation rate | % of user-reported issues that required IT to contact engineering | Must trend to zero for known issue types within 60 days of pilot |
| Admin self-resolve rate | % of provisioning/workflow failures resolved by Admin role without engineering | ≥ 80% for known failure types |
| Help-desk ticket volume | Volume of HB Intel-related IT tickets per user per month | Trending downward month-over-month post-pilot |
| Time-to-diagnose | Time for an Admin to identify root cause of a provisioning failure from Admin workspace alone | ≤ 5 minutes for known failure types |

### 16.6 HBI Accuracy and Feedback Metrics (Required Before HBI Expansion)

Per §11.2, HBI capabilities may not expand without this measurement infrastructure in place:

| Metric | Description |
|--------|-------------|
| Suggestion acceptance rate | % of HBI suggestions accepted without modification, per feature and per role |
| Suggestion correction rate | % requiring significant user correction |
| Feedback signal volume | Number of in-product thumbs-up/down events per HBI surface per week |
| Non-degradation check | Average task completion time with and without HBI active for a given workflow |

### 16.7 Business Value Trend Metrics (Lagging — Post-Stabilization)

These are tracked after the pilot stabilizes and are not launch blockers:

- BD pipeline velocity change (leads progressed per quarter, pre- vs. post-pilot).
- Project setup error rate (incomplete or incorrectly provisioned projects requiring manual correction).
- Leadership dashboard usage frequency (how often leadership-facing features are opened per leadership role per week).

### 16.8 Instrumentation Reference

The UX instrumentation layer (`useUXInstrumentation`, `HbcCESPrompt`) defined in the PH9b UX Enhancement Plan provides task flow timing and satisfaction signal infrastructure. PH9b is currently **Deferred Scope** — it must be prioritized and activated before any pilot where KPI measurement of task flows is required.

---

## §17. MVP Non-Goals, Deferred Items, and Future Directions

*This section documents what HB Intel is explicitly not committing to in the MVP or near-term phases. Its purpose is to prevent scope creep, protect launch focus, and prevent developers from treating future ideas as active requirements.*

### 17.1 MVP Non-Goals (Explicitly Out of Scope for Launch)

The following are not MVP requirements. Including them in MVP scope or coding them prematurely is a scope violation:

- External collaboration of any kind (external user access, external API, guest portal).
- Offline-first operation (full workflow completion without network connectivity).
- Integration with Sage Intacct, Procore API, or Building Connected (beyond existing manual cross-references).
- AI/HBI-generated drafts or autonomous decisions in any workflow.
- Mobile-native HB Site Control application.
- Full PWA feature set across all 14 workspaces.
- Review Mode (PH7-ReviewMode-Plan + PH7-RM-1 through PH7-RM-9 — Deferred Scope).
- My Work Feed / PH9b UX enhancements (requires Phase 7 modules live first).
- Advanced search (SF16 — planning stage only, pending ADR-0090).
- Post-bid autopsy workflow (SF22 T08–T09 — not yet defined).

### 17.2 Architectural Bets That Are Not Yet Committed

The following are expected future directions but carry no current implementation commitment. They must not be pre-built or scaffolded without an explicit active phase assignment:

- Procore API integration.
- Azure Monitor Workbooks operational observability layer.
- SharePoint site archival workflow.
- Review Mode collaborative annotation layer.
- External collaboration portal.
- B2B federated identity for external guests.

### 17.3 Intentionally Deferred Technical Scope

The following are deferred per formal classification in `current-state-map.md §2` as Deferred Scope. They may not be activated without reclassification to Canonical Normative Plan and assignment to a named phase:

- All PH7-RM-* plans (SF-layer Review Mode).
- PH9b UX Enhancement Plan.
- SF16 Search implementation.
- SF22 Post-Bid Learning Loop T08–T09.

### 17.4 What "Future Direction" Language Means in This Document

When this document uses phrases like "over time," "future production stages," "longer term," or "future direction," it signals an anticipated evolution without a current implementation commitment. These items should not be assigned to an active phase without a new planning artifact and formal classification.

---

## §18. Shared-Feature Primitives Landscape (SF01–SF22)

*Status labels in this section reflect the classification in `current-state-map.md §2` as of 2026-03-14. Verify current maturity in current-state-map before making implementation decisions.*

As of PH7.4, all Category C packages are **Tier-1 Platform Primitives** — mandatory use when their concern area is present in a feature. Duplicating a primitive's capability in a feature package is a Zero-Deviation Rule violation per CLAUDE.md §1 Directive 6.

### 18.1 Primitive Registry (Summary — Verify Against current-state-map)

| Family | Package | Status per current-state-map | Concern Area |
|--------|---------|------------------------------|-------------|
| SF01 | `@hbc/bic-next-move` | Complete v0.1.0 | Ball-in-court, ownership, next-action |
| SF02 | `@hbc/complexity` | Complete v0.1.0 | UI density / Complexity Dial |
| SF03 | `@hbc/sharepoint-docs` | Complete v0.1.0 | Document lifecycle management |
| SF04 | `@hbc/acknowledgment` | Complete v0.1.0 | Sign-off and acknowledgment flows |
| SF05 | `@hbc/step-wizard` | Complete v0.1.0 | Multi-step guided workflows |
| SF06 | `@hbc/versioned-record` | Scaffold v0.0.1 | Immutable versioned record management |
| SF07 | `@hbc/field-annotations` | Complete v0.1.0 | Inline field-level annotation and comment threads |
| SF08 | `@hbc/workflow-handoff` | Complete v0.1.0 | Cross-module workflow handoff and routing |
| SF09 | `@hbc/data-seeding` | Scaffold v0.0.1 | Development and demo data seeding |
| SF10 | `@hbc/notification-intelligence` | Complete v0.0.1 | Tiered, selective notification model |
| SF11 | `@hbc/smart-empty-state` | Complete v0.0.1 | Contextual empty states with guidance |
| SF12 | `@hbc/session-state` | Complete v0.0.1 | Offline-safe session persistence and sync |
| SF13 | `@hbc/project-canvas` | Complete v0.0.1 | Role-based configurable dashboard canvas |
| SF14 | `@hbc/related-items` | Complete | Unified work graph (cross-entity relationships) |
| SF15 | `@hbc/ai-assist` | Complete | HBI / Azure AI Foundry integration |
| SF16 | `@hbc/search` | Planning only — implementation deferred | Azure Cognitive Search integration |
| SF17 | `@hbc/features-admin` | Complete | Admin intelligence layer |
| SF18 | `@hbc/features-estimating` over `@hbc/health-indicator` | Complete | Estimating bid-readiness signal |
| SF19 | `@hbc/features-business-development` over `@hbc/score-benchmark` | Complete | BD score benchmark and ghost overlay |
| SF20 | `@hbc/features-business-development` over `@hbc/strategic-intelligence` | Complete | BD heritage and living strategic intelligence |
| SF21 | `@hbc/features-project-hub` | Complete | Project health pulse (multi-dimension) |
| SF22 | `@hbc/post-bid-autopsy` | T01–T07 defined; T08–T09 not yet defined | Post-bid learning loop |

For the adoption matrix, decision tree, and non-duplication rules, see `docs/reference/platform-primitives.md`.

---

## §19. Phase Delivery History

> **Authority note:** This section is a narrative summary of delivery history. Authoritative implementation truth is governed by `current-state-map.md`. These labels reflect the documented classification in that file as of 2026-03-14.

### 19.1 Completed Phases (Per current-state-map.md)

| Phase | Major Deliverable | Per current-state-map |
|-------|------------------|-----------------------|
| Phase 0 | Prerequisites; repo setup; docs structure | Complete 2026-03-03 |
| Phase 1 | Monorepo root configuration (turbo.json, workspace, tsconfig.base, ESLint) | Complete 2026-03-03 |
| Phase 2 | Core shared packages: @hbc/models, @hbc/data-access, @hbc/query-hooks, @hbc/auth | Complete 2026-03-03 |
| Phase 3 | Dev harness (apps/dev-harness); Zustand stores | Complete |
| Phase 4 | UI Kit (HB Intel Design System, 30+ Hbc components); @hbc/shell | Complete |
| Phase 4B | UI Design Audit and Remediation | Complete |
| Phase 4C | UI Design Completion (a11y, shimmer, token enforcement, Storybook) | Complete |
| Phase 5 | Auth/Shell (dual-mode auth; Zustand; ShellCore; WorkspacePageShell) | Complete |
| Phase 5C | Auth/Shell hardening (DevToolbar, PersonaRegistry, 100% audit coverage) | Signed off 2026-03-07 |
| Phase 6 | Provisioning Modernization (@hbc/provisioning, SignalR, saga, 7-state engine, Estimating/Accounting surfaces, Admin dashboard) | Complete |
| Phase 6F | Dead-wiring cleanup | Complete |
| PH7.1–PH7.11 | P1 stabilization: current-state-map, auth boundary, shell decomposition, Tier-1 primitives, ESLint boundary rules, test governance, release taxonomy, documentation governance, ADR catalog rebuild | Complete 2026-03-09 through 2026-03-12 |
| SF04–SF21 | 18 shared-feature primitive families built in parallel with PH7 stabilization | Per current-state-map §2 (see §18.1 for maturity) |

### 19.2 Active Work (as of 2026-03-14)

| Stream | Entry Point | Gate/Prerequisite |
|--------|-------------|-------------------|
| PH7.12 Final Verification | `ph7-remediation/PH7.12-Final-Verification-and-Sign-Off.md` | Must complete before feature expansion; ADR-0090 required |
| PH7.13 Stub Detection Enforcement | `ph7-remediation/PH7.13-Stub-Detection-Enforcement.md` | Independent of PH7.12 (ADR-0095) |
| SF22 Post-Bid Learning Loop | `shared-features/SF22-Post-Bid-Learning-Loop.md` | T01–T07 defined; T08–T09 pending |
| SF16 Search | `shared-features/SF16-Search.md` | Planning complete; implementation deferred |

---

## §20. Active and Upcoming Delivery Streams

> **Delivery sequencing companion:** For the full wave structure (Foundation/Wave 0–3/Convergence), dual-stream SPFx/PWA doctrine, readiness gate definitions, and long-range SPFx sunset strategy, see `docs/architecture/blueprint/HB-Intel-Dev-Roadmap.md`. This section covers active phase streams; the roadmap covers staged delivery planning above the phase level.

### 20.1 PH7 Stabilization vs PH7 Expansion (Critical Distinction)

Phase 7 has two distinct branches that must not be confused:

**PH7 Stabilization (Remediation Series PH7.1–PH7.13)**
- Purpose: P1 technical debt, governance normalization, quality gates.
- Gate: PH7.12 Final Verification. ADR-0090 must exist on disk before any expansion begins.
- Status (per current-state-map): PH7.1–PH7.11 complete; PH7.12 and PH7.13 active.

**PH7 Expansion (Feature Build-Out Series)**
- Purpose: Building the 11 SPFx feature modules with full business logic, testing, and documentation.
- Files: PH7-Breakout-Webparts-Plan.md + BW-0 through BW-11; PH7-Estimating-Features.md + task files; PH7-ProjectHub-Features-Plan.md + task files; PH7-BD-Features.md + task files; PH7-Admin-Feature-Plan.md.
- Gate: **May not begin** until PH7.12 acceptance criteria are satisfied and ADR-0090 is on disk.
- Status: Plans authored; implementation pending ADR-0090.

### 20.2 MVP Stream

The MVP plan branch (`docs/architecture/plans/MVP/`) is the next concrete implementation increment after PH7.12 sign-off. It materializes the provisioning flow into a production-ready MVP delivery.

- **Master plan:** `MVP-Project-Setup-Plan.md` with T01–T09 task files.
- **Plan review status:** `MVP-Plan-Review-2026-03-13.md` identified four categories of corrections needed before coding. These corrections must be applied before any coding agent begins.
- **Gate:** ADR-0090 must exist on disk.

### 20.3 Deferred Streams (Must Not Begin Without Reclassification)

| Stream | Files | Classification | Activation Requirement |
|--------|-------|----------------|----------------------|
| Review Mode | PH7-ReviewMode-Plan.md + PH7-RM-1 through PH7-RM-9 | Deferred Scope | Reclassify to Canonical Normative Plan + assign to named phase |
| PH9b UX Enhancements | PH9b-UX-Enhancement-Plan.md | Deferred Scope | Requires Phase 7 modules live |
| SF16 Search | SF16-Search.md + planning files | Canonical Normative Plan (planning) | Pending ADR-0090 |
| SF22 Post-Bid Learning Loop T08–T09 | Not yet authored | N/A | Pending authoring |

### 20.4 Future Streams (Phase 8+ — No Current Commitment)

- Sage Intacct financial data integration.
- Procore API project-state sync.
- Azure Monitor Workbooks operational observability.
- SharePoint site archival workflow.
- External collaboration portal.

---

## §21. Blueprint-Level ADR Overlay

### 21.1 Governing ADRs (Binding — CLAUDE.md §6.3)

Any action that would reverse, weaken, or work around these decisions requires a superseding ADR with explicit rationale:

| ADR | Decision | Phase |
|-----|----------|-------|
| ADR-0001 | Monorepo bootstrap (pnpm + Turborepo v2 "tasks" syntax) | Phase 1 |
| ADR-0002 | Ports/adapters data access replacing IDataService | Phase 2 |
| ADR-0003 | Shell navigation with Zustand (no React Context) | Phase 2 |
| ADR-0083 | Release-readiness taxonomy (three-level: Code / Environment / Operations → Production-Ready) | PH7.9 |
| ADR-0084 | Current-state source-of-truth and documentation governance (six-class system, tier hierarchy) | PH7.10–PH7.11 |
| ADR-0085 | Test governance normalization (Vitest P1 workspace; branches: 95; CI job) | PH7.8 |
| ADR-0088 | hbc-theme-context renaming | PH7.11 |
| ADR-0089 | fluent-tokens renaming | PH7.11 |
| ADR-0090 | Phase 7 Final Verification and Sign-Off (gate ADR — must exist before expansion) | PH7.12 |
| ADR-0092 through ADR-0113 | SF04–SF21 platform primitive governance | PH7 concurrent |

**Next unreserved ADR number: ADR-0114.**

### 21.2 ADR Catalog Reference

The full ADR catalog (111+ active, 6 archived) is maintained at `docs/architecture/adr/`. The index is at `docs/architecture/adr/README.md`. Conflict resolution history is in `current-state-map.md §2.2`.

---

## §22. Master Document Crosswalk — Where to Go for Details

| Question | Document | Classification |
|----------|----------|----------------|
| What does the repo contain right now? | `docs/architecture/blueprint/current-state-map.md` | Canonical Current-State (Tier 1) |
| What is the complete target architecture? | `docs/architecture/blueprint/HB-Intel-Blueprint-V4.md` | Canonical Normative Plan |
| What are the numbered implementation instructions? | `docs/architecture/plans/hb-intel-foundation-plan.md` | Historical Foundational (locked) |
| Why was an architecture decision made? | `docs/architecture/adr/ADR-XXXX-*.md` | Permanent Decision Rationale |
| What is the PH7 stabilization gate plan? | `docs/architecture/plans/ph7-remediation/PH7.12-Final-Verification-and-Sign-Off.md` | Canonical Normative Plan |
| What are the PH7 feature expansion plans? | `docs/architecture/plans/PH7-Estimating-Features.md` (and domain siblings) | Canonical Normative Plan |
| What is the MVP plan? | `docs/architecture/plans/MVP/MVP-Project-Setup-Plan.md` | Canonical Normative Plan |
| What corrections are needed before MVP coding? | `docs/architecture/plans/MVP/MVP-Plan-Review-2026-03-13.md` | Canonical Current-State |
| What platform primitives exist and are mandatory? | `docs/reference/platform-primitives.md` | Living Reference |
| How does the document classification system work? | `docs/architecture/blueprint/current-state-map.md §2` + ADR-0084 | Canonical Current-State / ADR |
| How do I navigate the blueprint corpus? | `docs/architecture/blueprint/HB-Intel-Blueprint-Crosswalk.md` | Canonical Current-State |
| What is this agent's operating manual? | `CLAUDE.md` | Governance |

---

## Document Metadata and Classification

**Classification:** Canonical Normative Plan (program narrative layer — does not govern present-state truth)
**Classification Banner:** Applied (see top of file; banner format per ADR-0084 §2.1)
**Row in current-state-map.md §2:** Added 2026-03-14
**Version:** 1.1 (Refined 2026-03-14)
**Refinement scope:** Status-language precision; governance-safe classification; non-goals section added; telemetry doctrine expanded; support/operability model strengthened; external collaboration guardrail added; implementation-trust doctrine sharpened.
**Next review:** When ADR-0090 ships — update §20.1 PH7 stabilization status.

---

*End of HB Intel Unified Blueprint v1.1*
*Authoring report: `docs/architecture/blueprint/HB-Intel-Unified-Blueprint-Authoring-Report.md`*
*Refinement report: `docs/architecture/blueprint/HB-Intel-Unified-Blueprint-Refinement-Report.md`*
