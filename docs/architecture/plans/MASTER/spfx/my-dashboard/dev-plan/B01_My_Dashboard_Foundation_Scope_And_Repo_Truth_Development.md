# B01 — HB Intel My Dashboard Foundation, Scope, and Repo-Truth Development

**Artifact status:** Batch 01 authoritative planning foundation  
**Prepared:** 2026-05-12  
**Target initiative:** HB Intel **My Dashboard** SPFx domain, **My Work** shell experience, and **Adobe Sign Action Queue** first module  
**Target SharePoint host named in source plan:** `https://hedrickbrotherscom.sharepoint.com/sites/MyDashboard`  
**Batch scope:** Detailed development of plan Sections **0–5** only; this artifact does not implement code and does not replace later detailed batches for shell specification, read models, backend integration, OAuth, packaging, or hosted evidence.

---

# Executive Verdict

## Final verdict

**Proceed with My Dashboard as a new standalone SPFx app/domain, not as a Project Control Center extension.**

That decision remains correct after repo-truth audit, but the rationale must be sharpened:

1. **My Dashboard is new as a runtime SPFx application domain**, but it is **not conceptually greenfield**. The repository already contains a substantial **My Work / Personal Work Hub** architecture in the PWA and a canonical shared package, `@hbc/my-work-feed`, for cross-module personal-work aggregation.
2. **Project Control Center (PCC)** is the right **shell-construction reference** for the proposed My Work shell, but it is the wrong **product-context owner**. PCC is project-centered; My Dashboard is user-centered.
3. **HB Homepage shell work** is a valid **communication-site hosting and shell-boundary reference**, but it must not become the My Work shell family or product grammar.
4. The proposed **Adobe Sign Action Queue** remains a valid first production-shaped My Dashboard module because PCC’s existing `adobe-sign` concept is project-contextual, Document Control-adjacent, and launch/reference oriented rather than an authenticated-user action queue.
5. The most important new Batch 01 planning constraint is this: **My Dashboard must not accidentally create a second, competing personal-work platform primitive beside `@hbc/my-work-feed`.** Later batches must either reuse, bridge to, or intentionally differentiate from that existing package with explicit rationale before implementation proceeds.

## Closed foundation decisions

| Decision | Batch 01 resolution |
|---|---|
| New app domain vs. PCC extension | **Closed:** new SPFx app/domain for My Dashboard |
| Relationship to PCC | **Closed:** inherit shell-construction principles; do not inherit project-context product semantics |
| Relationship to HB Homepage | **Closed:** use for communication-site host-fit and shell-boundary lessons only |
| Product taxonomy | **Closed:** My Dashboard = SPFx product/host; My Work = user-facing operating surface/shell; Adobe Sign Action Queue = first module |
| Repo status of initiative | **Closed:** planning documentation exists in repo; no `apps/my-dashboard` runtime scaffold found in audit |
| MVP scope | **Closed:** shell + Adobe user action queue + supporting backend/read-model boundaries; not a full unified personal-work suite |
| Downstream architectural guardrail | **Closed:** do not duplicate or silently conflict with existing `@hbc/my-work-feed` and Personal Work Hub architecture |

---

# 1. Repository Audit Method

## 1.1 Audit objective

The repository audit was designed to answer seven foundational questions:

1. Is **My Dashboard** already present in repo truth, and if so, in what form?
2. What **My Work / personal work** architecture already exists?
3. Which parts of the **PCC shell** are reusable conceptually for a My Work shell?
4. Which parts of **HB Homepage shell** are useful for communication-site hosting, and which are not?
5. What existing **navigation/module taxonomy** creates naming or conceptual collision risk?
6. How should the plan reconcile the proposed **Adobe Sign Action Queue** with PCC’s existing `adobe-sign` module?
7. What repo truth must later batches inherit as non-negotiable constraints?

## 1.2 Audit authority hierarchy

The audit used the following authority order:

1. **Current source code and package/runtime artifacts**
2. **Current architecture and accepted ADRs that match implementation truth**
3. **Current plan documents that describe intended direction**
4. **Older planning/reference documents**, treated as useful context only when they do not contradict current repo truth

This order matters because the repo contains at least one stale document regarding My Work implementation status.

## 1.3 Search terms used

The audit searched for terms and concepts including:

- `My Dashboard`
- `MyDashboard`
- `my-dashboard`
- `My Work`
- `my-work`
- `personal dashboard`
- `work queue`
- `action queue`
- `Action Center`
- `My Responsibilities`
- `operating layer`
- `priority rail`
- `work hub`
- `adobe-sign`

## 1.4 Inspection strategy

The audit used four inspection lanes:

### Lane A — Initiative existence and product-boundary truth
Focused on whether My Dashboard already exists as:
- runtime code,
- planning documentation,
- or adjacent architecture under a different name.

### Lane B — Shell architecture truth
Focused on:
- `PccShell`
- `PccSurfaceRouter`
- `usePccShellState`
- `PccApp`
- communication-site shell boundaries in HB Homepage

### Lane C — Existing personal-work platform truth
Focused on:
- `@hbc/my-work-feed`
- Personal Work Hub planning
- PWA My Work page implementation
- My Work API and architecture docs

### Lane D — Navigation/module taxonomy and collision risk
Focused on:
- PCC primary navigation registry
- modules such as `action-center`, `my-responsibilities`, `today-this-week`, and `adobe-sign`
- naming implications for My Dashboard

---

# 2. Repo Files and Documents Inspected

## 2.1 My Dashboard planning posture

| Path | Relevance |
|---|---|
| `docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/HB_Intel_My_Dashboard_Comprehensive_Development_Plan_Outline.md` | Confirms My Dashboard is already represented as repo planning documentation, not runtime implementation |
| Attached prompt: `01_Batch_01_Foundation_Scope_And_Repo_Truth_Audit.md` | Governs this artifact’s scope and required outputs |

## 2.2 PCC shell and application posture

| Path | Relevance |
|---|---|
| `apps/project-control-center/src/shell/PccShell.tsx` | Shell composition, command surface, tabs/hero order, semantic panel ownership, bento-canvas relationship |
| `apps/project-control-center/src/shell/PccSurfaceRouter.tsx` | Surface routing and distinction between primary dashboard surfaces and specialized documents surface |
| `apps/project-control-center/src/state/usePccShellState.ts` | In-memory active-tab/module state model and preview posture |
| `apps/project-control-center/src/PccApp.tsx` | App orchestration between shell, hero view model, shell state, and routed surface |
| `packages/models/src/pcc/PccPrimaryNavigation.ts` | PCC module registry and existing `adobe-sign`, `action-center`, `my-responsibilities`, `today-this-week` taxonomy |
| `apps/project-control-center/src/surfaces/documents/documentExplorerExternalReferences.ts` | Demonstrates PCC external reference handling for Adobe Sign as configured/not-launchable or inactive-for-project, not as a user action queue |

## 2.3 HB Homepage communication-site shell posture

| Path | Relevance |
|---|---|
| `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx` | Communication-site shell orchestration, wide-layout handling, zone composition, diagnostics |
| `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts` | Authoritative shell/wrapper ownership boundary; useful model for preventing shell overreach into module internals |

## 2.4 Existing My Work / Personal Work Hub truth

| Path | Relevance |
|---|---|
| `docs/architecture/adr/ADR-0115-my-work-feed-architecture.md` | Accepted ADR defining `@hbc/my-work-feed` as canonical owner for personal work aggregation |
| `docs/architecture/plans/shared-features/SF29-My-Work-Feed.md` | Normative plan for My Work Feed architecture and locked decisions |
| `packages/my-work-feed/README.md` | Current package purpose, source ownership boundaries, components, offline model, count semantics |
| `docs/reference/my-work-feed/api.md` | Current public API surface, types, adapters, hooks, components, telemetry |
| `apps/pwa/src/pages/my-work/MyWorkPage.tsx` | Implemented PWA My Work page orchestrator, including feed provider, role-aware secondary/tertiary zones, connectivity banner, team mode, master-detail layout |
| `docs/reference/work-hub/runway-definition.md` | Product-level Personal Work Hub runway and “own work first” orientation |
| `docs/reference/workflow-experience/my-work-alignment-contract.md` | Stale/conflicting document stating `@hbc/my-work-feed` does not exist; must not govern current truth |

## 2.5 Product doctrine / blueprint language inspected

| Path | Relevance |
|---|---|
| `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` | Confirms product doctrine: Personal Work Hub as primary UX layer; Project Command Center as secondary project layer; visual trust and explainability principles |

---

# 3. Repo-Truth Findings

## 3.1 My Dashboard is planning-present, runtime-absent

### Finding
My Dashboard is **already present in repository planning documentation** under:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/
```

However, the audit did **not** identify a current runtime implementation scaffold such as:

```text
apps/my-dashboard/
```

### Interpretation
The initiative should be classified as:

> **Documented and product-framed in repo plans, but not yet implemented as a standalone runtime SPFx app/domain.**

### Planning implication
The comprehensive development plan should not describe My Dashboard as wholly undiscovered or absent from repo context. It should say:

- **Planning architecture exists**
- **Runtime app/domain does not yet appear implemented**
- Batch 01 is expanding and hardening the existing outline, not inventing the product from scratch

---

## 3.2 “My Work” is already a mature HB Intel architecture, not a blank label

### Finding
The repo contains a mature My Work architecture:

- accepted ADR (`ADR-0115`) for My Work Feed architecture,
- normative plan (`SF29-My-Work-Feed`),
- implemented shared package (`@hbc/my-work-feed`),
- implemented PWA page (`apps/pwa/src/pages/my-work/MyWorkPage.tsx`),
- detailed API reference (`docs/reference/my-work-feed/api.md`),
- Personal Work Hub runway guidance (`docs/reference/work-hub/runway-definition.md`).

### Interpretation
The proposed **My Work shell** inside My Dashboard cannot be treated as a new independent personal-work doctrine. The repo has already established:

- personal-work aggregation concepts,
- canonical work-item contracts,
- deterministic ranking and dedupe philosophy,
- multi-surface count consistency,
- explainability requirements,
- offline/degraded handling principles.

### Planning implication
My Dashboard must be positioned as a **SharePoint-hosted personal operating surface** that is compatible with the broader My Work doctrine. Later batches must explicitly decide whether the first My Dashboard module:

1. consumes or adapts existing `@hbc/my-work-feed` semantics,
2. uses a narrow module-specific read model while preserving alignment, or
3. intentionally diverges for justified reasons.

What is **not acceptable** is silently creating a second personal-work platform vocabulary.

---

## 3.3 A stale My Work reference document conflicts with current repo truth

### Finding
`docs/reference/workflow-experience/my-work-alignment-contract.md` states that `@hbc/my-work-feed` does not exist and remains research-stage only. Current code and current docs contradict that statement.

### Interpretation
That document is stale relative to present repository truth and should not be used as an implementation authority.

### Planning implication
Later planning and implementation sessions should:

- use `ADR-0115`, the package README, the API reference, and current runtime code as the authority,
- treat the older alignment contract as archival drift unless it is updated separately,
- avoid reintroducing “future only” language for My Work Feed.

---

## 3.4 PCC is the correct shell-construction reference, but not the product-context owner

### What PCC contributes conceptually
PCC current runtime code establishes a mature shell construction pattern:

- **command surface** containing tabs and hero,
- **hero band** within a shell-owned command region,
- **single semantic active panel owner** via `role="tabpanel"`, `aria-labelledby`, and `data-pcc-active-surface-panel`,
- **bento-grid canvas** inside the active panel,
- **container-aware breakpoint mode** measured by shell width,
- **in-memory shell state** for active primary tab and active module,
- **router separation** between shell-level navigation and routed content surfaces.

### What PCC must not contribute directly
PCC is explicitly **project-contextual**:

- shell hero view models derive from project profile context,
- surfaces revolve around project tabs and project modules,
- navigation semantics are tied to the Project Control Center operating model.

### Planning implication
The My Dashboard plan should reuse PCC as a **construction template**, not as a parent product. The correct framing is:

> **My Dashboard should be a sibling SPFx application that borrows PCC shell grammar, not a child feature embedded inside PCC.**

---

## 3.5 HB Homepage provides communication-site shell lessons, not My Work taxonomy

### Useful lessons from HB Homepage
The HB Homepage shell and contract architecture are useful because they show:

- communication-site shell composition discipline,
- wide-layout and container-fit considerations,
- explicit ownership boundaries between outer wrapper/shell and occupant modules,
- fallback and diagnostic treatment when shell composition or content-state assumptions fail.

### What must not drift from HB Homepage into My Work
HB Homepage should **not** govern:

- My Work navigation grammar,
- module-selection patterns,
- active-surface semantics,
- card taxonomy,
- product identity.

### Planning implication
Use HB Homepage as a **host-environment precedent**, not as the shell product family. Later My Dashboard shell batches should remain PCC-aligned in construction while adopting HB Homepage host-fit lessons where SharePoint communication-site realities matter.

---

## 3.6 PCC navigation already uses “personal-work-adjacent” language

### Finding
`PccPrimaryNavigation.ts` includes modules such as:

- `action-center`
- `my-responsibilities`
- `today-this-week`

These modules are nested under PCC’s `project-home` primary tab and are therefore **project-contextual projections**, not an enterprise-wide personal dashboard.

### Planning implication
My Dashboard cannot reuse these labels casually without boundary clarification. The same words may be valid in both systems, but the product semantics differ:

| Concept | PCC meaning | My Dashboard meaning |
|---|---|---|
| Action Center | Action center for the active project | Personal authenticated-user queue across connected work sources, if introduced in a future phase |
| My Responsibilities | Project-linked responsibilities within PCC | Broader user-context responsibilities, if supported later |
| Today / This Week | Near-term project emphasis | Personal time horizon and queue triage, if used later |

Batch 01 does **not** require those future My Dashboard modules. It only requires that later taxonomy avoid accidental collision.

---

## 3.7 PCC’s existing `adobe-sign` module is not the proposed Adobe Sign Action Queue

### Finding
PCC already contains an `adobe-sign` module under the Document Control navigation cluster. Current surrounding logic treats Adobe Sign as an external reference/launch concept within project document control, including states such as configured-but-not-launchable or inactive-for-project.

### Proposed My Dashboard concept
The My Dashboard module is:

```text
adobe-sign-action-queue
```

and it is:

- authenticated-user contextual,
- action-oriented,
- read-model-driven,
- focused on agreements requiring the current user’s action.

### Planning implication
The module identities must remain explicitly separate:

| PCC | My Dashboard |
|---|---|
| `adobe-sign` | `adobe-sign-action-queue` |
| Project-context launch/reference | User-context action queue |
| Document Control adjacency | My Work queue adjacency |
| External source cue | Personalized actionable work surface |

This distinction must be preserved in naming, routing, documentation, and code-agent prompts.

---

## 3.8 HB Intel doctrine already supports “personal work first”

### Finding
The Unified Blueprint and Work Hub runway documents establish a clear doctrine:

- **Personal Work Hub** is the primary UX layer.
- **Project Command Center** is the secondary project layer.
- Users should be oriented first around “what do I need to do right now?”
- Trust, explainability, and clarity are prioritized over opaque automation or over-flexibility.

### Planning implication
My Dashboard is not a deviation from HB Intel architecture; it is a **SharePoint-hosted realization of an already documented product direction**. The main planning task is not to justify the idea, but to implement it without conflicting with existing My Work platform doctrine.

---

# 4. Subject-Matter Research Findings with Citations

## 4.1 Research source legend

| ID | Source |
|---|---|
| **R1** | Microsoft Support — *Plan your SharePoint communication site* |
| **R2** | Microsoft Support — *Target navigation, news, files, links, and web parts to specific audiences* |
| **R3** | Microsoft Learn — *Use web parts with the full-width column* |
| **R4** | Microsoft Learn — *Empty states for web parts* |
| **R5** | Microsoft Learn — *Create and edit a Viva Connections dashboard* |
| **R6** | Microsoft Learn — *Available dashboard cards in Viva Connections* |
| **R7** | Sorapure (2023) — *User Perceptions of Actionability in Data Dashboards* |
| **R8** | Verhulsdonck & Shah (2022) — *Making Actionable Metrics “Actionable”* |
| **R9** | *Effect of information load and cognitive style on cognitive load of visualized dashboards for construction-related activities* (Automation in Construction, 2023) |
| **R10** | *Business intelligence and cognitive loads: Proposition of a dashboard adoption model* (Data & Knowledge Engineering, 2024) |
| **R11** | *Organizational decision making and analytics: An experimental study on dashboard visualizations* (Information & Management, 2024) |

## 4.2 Research synthesis

### Finding A — A personal dashboard must be job-oriented, not merely information-dense
Microsoft’s guidance for SharePoint communication sites warns that viewers are trying to get a job done and that overloaded pages make it harder to find relevant information. The same guidance recommends progressive disclosure and grouping detailed information into natural categories. Dashboard research also shows that “actionability” depends on whether users can connect displayed information to concrete decisions and next steps. [R1] [R7] [R8]

**Implication for My Dashboard:**
- The landing experience should emphasize **what requires the current user’s attention**, not a broad corporate portal aesthetic.
- The MVP home should remain concise: summary, Adobe Sign queue state, and only the support state needed to explain source readiness.
- “More data” is not automatically “more value.”

### Finding B — SharePoint-hosted personal experiences should use relevance and audience focus, not one-size-fits-all page sprawl
Microsoft supports audience targeting for navigation, content, web parts, and Viva Connections dashboard cards to improve relevance for distinct groups. Viva Connections dashboards are designed around cards that enable quick task completion and role-relevant access to tools. [R2] [R5] [R6]

**Implication for My Dashboard:**
- My Dashboard should be architected for **future role-aware module curation**, even if the first MVP exposes only Adobe Sign.
- The UX should be personal without requiring immediate end-user customization in MVP.
- Later batches can consider role-aware module targeting, but MVP must not pre-render empty speculative modules.

### Finding C — Full-width communication-site hosting is a real SPFx constraint, not a cosmetic choice
Microsoft documents that communication sites support a full-width section layout and that SPFx web parts must explicitly enable support for that host posture. [R3]

**Implication for My Dashboard:**
- A future implementation plan must explicitly account for communication-site full-width rendering.
- Hosted proof on the actual SharePoint page is required; local workbench or generic width assumptions are insufficient.
- Shell choreography and overflow testing are architectural acceptance criteria, not polish tasks.

### Finding D — Empty and degraded states should explain purpose, state, and user expectation
Microsoft’s SharePoint empty-state guidance distinguishes empty states from placeholders and notes that empty-state behavior can differ by permission level and view/edit context. [R4]

**Implication for My Dashboard:**
- Empty Adobe queue states must be meaningful end-user states, not blank cards.
- Authorization-required, source-unavailable, configuration-required, and no-pending-work states must be distinct and non-alarming.
- The surface should tell users whether the queue is current, degraded, or simply empty.

### Finding E — Cognitive load increases when dashboards carry too much or poorly structured information
Construction-dashboard research found that information load meaningfully affects cognitive load, with implications for project managers’ speed and error risk. BI dashboard research similarly identifies informational, representational, and non-informational loads as adoption factors. [R9] [R10]

**Implication for My Dashboard:**
- The landing page should remain **summary-first**, not list-first.
- The queue should expose prioritization cues such as action type, freshness, and source-defined urgency only where justified.
- Avoid dense multitier KPIs that do not change what the user should do next.

### Finding F — Information quality, freshness, and completeness affect decision quality
A 2024 experimental study found that the format, currency, and completeness of dashboard information influence decision quality by changing perceived task complexity and information satisfaction. [R11]

**Implication for My Dashboard:**
- Read models should retain refresh timestamps and source-state indicators.
- Degraded or partial source responses must be surfaced explicitly.
- The UI should never imply completeness where the backend cannot establish it.

---

# 5. Detailed Development of Plan Sections 0–5

# 0. Document Control

## 0.1 Document title

**HB Intel My Dashboard — My Work Shell and Adobe Sign Action Queue Comprehensive Development Plan**

## 0.2 Batch 01 document purpose

This Batch 01 artifact serves as the **authoritative foundation** for the remainder of the My Dashboard development plan. It closes the product-boundary, terminology, repo-truth, and UX-intent decisions that later batches must inherit.

It is **not**:
- an implementation prompt package,
- a coding sequence,
- a final specification for all backend/auth concerns,
- or a replacement for later detailed batches.

## 0.3 Initiative scope statement

The My Dashboard initiative governs:

1. A new standalone **My Dashboard** SPFx application/domain for SharePoint communication-site hosting.
2. A shell experience labeled **My Work** that presents authenticated-user work context.
3. A first production-shaped user-specific module: **Adobe Sign Action Queue**.
4. The architectural foundation needed to support personal-work modules without conflicting with current HB Intel doctrine.
5. Hosted-validation, packaging, and evidence expectations that later batches will elaborate.

## 0.4 Authority and source posture

### Current implementation truth
The following are treated as present-state authority:
- runtime source code,
- package READMEs,
- accepted ADRs aligned with code,
- current API references that match implementation posture.

### Planning authority
The My Dashboard plan outline is a valid starting point, but it must be corrected where current repo truth reveals additional context or collision risk.

### Known document-truth discrepancy
The old My Work alignment contract states that `@hbc/my-work-feed` does not exist. It is superseded in practice by current implementation and current architecture docs and should not govern this workstream.

## 0.5 Foundational plan classification

This Batch 01 artifact should be classified as:

> **Canonical planning foundation for My Dashboard Sections 0–5, subordinate to live repo truth and later superseded only by an explicit newer Batch 01 revision or a final approved comprehensive My Dashboard plan.**

---

# 1. Executive Summary

## 1.1 Strategic purpose

**My Dashboard** should become HB Intel’s SharePoint-hosted personal operating layer: a user-centered command surface that presents work requiring the authenticated employee’s attention, beginning with Adobe Sign agreements that require action.

The first release should do more than mount a queue card. It should establish:
- the new app/domain boundary,
- the shell/product taxonomy,
- the source-authority posture,
- and the pattern by which future personal-work modules can be introduced.

## 1.2 Product positioning

| Product surface | Product role |
|---|---|
| **My Dashboard** | SharePoint-hosted personal dashboard product/domain |
| **My Work** | Internal personal operating surface/shell inside My Dashboard |
| **Adobe Sign Action Queue** | First user-context module within My Work |
| **Project Control Center** | Project-context operating layer and shell-construction precedent |
| **Personal Work Hub / `@hbc/my-work-feed`** | Existing cross-app personal-work architecture and shared aggregation doctrine that My Dashboard must not duplicate or contradict |

## 1.3 Why a new app/domain is still correct

Even though My Work architecture already exists elsewhere in the repo, the new SPFx My Dashboard domain is still warranted because:

- the target host is a dedicated SharePoint communication site,
- the page experience is a self-contained SPFx-hosted dashboard,
- PCC is project-contextual and cannot cleanly own a user-context landing surface,
- app packaging, hosted proof, and operational release cadence should remain separable,
- the first module is a user-specific external queue, not a project card or PCC document utility.

## 1.4 MVP outcome

At MVP completion, an authenticated HB employee should be able to:

1. open the My Dashboard communication site,
2. encounter a polished My Work shell experience,
3. understand whether Adobe Sign requires their attention,
4. distinguish no-work, not-configured, authorization-required, source-unavailable, and ready states,
5. inspect a concise queue preview or focused module state,
6. open source agreements in Adobe Sign where validated source-open links are available,
7. trust that HB Intel is surfacing the queue, not falsely claiming to complete Adobe actions internally.

## 1.5 Architecture objective

The MVP should prove a reusable, trustworthy pattern for personal work surfaces:

- **hosted in SharePoint,**
- **backend-mediated for external-system reads,**
- **source-authority explicit,**
- **stateful enough to guide the user,**
- **narrow enough to avoid premature platform duplication.**

## 1.6 Research-backed UX posture

The MVP should follow three UX principles reinforced by external research:

1. **Task first:** personal dashboards succeed when they help users act, not merely observe. [R1] [R7] [R8]
2. **Progressive disclosure:** summary first, focused module second, detail only when it changes user action. [R1]
3. **Trust through state clarity:** freshness, empty states, and degraded states must be explicit. [R4] [R11]

---

# 2. Repo-Truth Audit and Architectural Basis

## 2.1 My Dashboard repo posture

### Current truth
My Dashboard currently exists as **planning documentation** in the repository, including a comprehensive development plan outline under the SPFx planning tree.

### Current absence
The audit did not identify a current runtime implementation app scaffold such as:

```text
apps/my-dashboard/
```

### Plan correction
The plan should say:

> “My Dashboard is already product-framed in repo planning documents but remains unimplemented as a runtime SPFx app/domain at the time of this Batch 01 audit.”

This is more accurate than either “entirely new” or “already partially scaffolded” without qualification.

---

## 2.2 PCC shell construction: what to inherit

### Inherit conceptually
The My Work shell should inherit these PCC construction principles:

- shell-level command surface above the active panel,
- horizontal navigation/launcher pattern where appropriate,
- shell-level hero band that provides orientation and summary context,
- one semantic active panel owner,
- bento-style dashboard canvas beneath the shell command surface,
- container-aware responsive modes,
- in-memory active surface/module state,
- router separation between shell shell-state and content rendering.

### Why this matters
PCC already solved several hard UX/platform problems that My Dashboard should not relearn from scratch:
- command area vs. content area separation,
- semantic active tab/panel structure,
- controlled dashboard shell state,
- responsive dashboard composition.

### Do not inherit literally
The My Work shell must not inherit:
- project profile hero facts,
- PCC project surface labels,
- project-specific navigation modules,
- project-level read-model assumptions,
- PCC’s release and evidence posture as a direct app dependency.

The correct pattern is **conceptual reuse through sibling architecture**, not codebase conflation by default.

---

## 2.3 HB Homepage: what to inherit and what to reject

### Use HB Homepage for
- communication-site fit and hosting posture,
- full-page composition awareness,
- shell/wrapper ownership boundary discipline,
- diagnostics/fallback mindset,
- proof that shell-level orchestration and child-surface ownership must be kept distinct.

### Do not use HB Homepage for
- My Work navigation taxonomy,
- My Work product positioning,
- active-module routing semantics,
- card choreography doctrine for a personal action queue.

### Planning rule
Later batches should treat HB Homepage as:

> **A host-compatibility and composition precedent, not the My Work shell’s governing design family.**

---

## 2.4 Existing My Work Feed architecture: unavoidable planning constraint

### Current truth
`@hbc/my-work-feed` already owns canonical cross-module personal-work aggregation semantics, including:

- item contracts,
- source adapters,
- ranking,
- dedupe and supersession,
- explainability,
- count consistency,
- offline/degraded posture,
- UI surfaces such as badges, tiles, panels, and full feeds.

### Why Batch 01 must acknowledge this
The proposed My Dashboard is also framed around personal work. Without an explicit boundary decision, later implementation work could:
- build a competing work-item model,
- use incompatible terminology,
- duplicate queue-health concepts,
- diverge from the canonical My Work doctrine.

### Closed Batch 01 rule
**My Dashboard may introduce an SPFx-specific My Work shell, but it may not establish a conflicting personal-work platform primitive.**

### Required downstream planning action
Before implementation begins, later batches must explicitly close one of the following:

1. **Reuse route:** My Dashboard consumes `@hbc/my-work-feed` contracts/components where feasible.
2. **Bridge route:** My Dashboard uses a narrow read-model client for Adobe Sign while intentionally aligning concepts and future adapter seams with `@hbc/my-work-feed`.
3. **Constrained divergence route:** My Dashboard differs for a documented reason, with explicit non-overlap rules.

Batch 01 strongly favors **Route 2** for the first release unless Batch 02–03 can prove clean direct reuse without distorting the SPFx/read-model plan.

---

## 2.5 PCC `adobe-sign` vs. My Dashboard `adobe-sign-action-queue`

### PCC current meaning
PCC `adobe-sign` is:
- project-contextual,
- adjacent to Document Control,
- external-source oriented,
- not a personalized user queue.

### My Dashboard intended meaning
`adobe-sign-action-queue` is:
- current-authenticated-user contextual,
- action-oriented,
- queue/read-model based,
- intended to answer: “Which Adobe Sign agreements need **my** action?”

### Closed rule
No later batch should collapse these concepts into one module name, one registry entry, or one description.

---

## 2.6 Product doctrine alignment

The My Dashboard initiative aligns with established HB Intel doctrine because the broader architecture already states that:

- user work orientation is primary,
- project command is secondary,
- clear next action and visibility matter,
- opaque automation and misleading state should be avoided.

The My Dashboard workstream should therefore be treated as a **SharePoint/SPFx activation path for existing product doctrine**, not as an unrelated side experiment.

---

# 3. Canonical Naming and Product Taxonomy

## 3.1 Canonical product names

| Concept | Canonical name | Notes |
|---|---|---|
| SharePoint communication site / initiative | **My Dashboard** | Site/product framing |
| SPFx product/web part | **HB Intel My Dashboard** | App/package identity |
| User-facing operating surface inside My Dashboard | **My Work** | Product language visible to users |
| Internal shell/component family | **My Work Shell** | Engineering name for shell construction |
| Initial dashboard surface | **My Work Home** | Default user-context landing surface |
| First production-shaped module | **Adobe Sign Action Queue** | End-user feature label |
| Existing shared package | **`@hbc/my-work-feed` / My Work Feed** | Existing canonical cross-module personal-work primitive; do not rename |
| Existing PWA-oriented product concept | **Personal Work Hub** | Existing architecture term; do not conflate with My Dashboard product identity |

## 3.2 Canonical IDs

| Concept | Canonical ID |
|---|---|
| Proposed app/domain folder | `my-dashboard` |
| Shell namespace | `my-work` |
| Home surface | `my-work-home` |
| Initial live module | `adobe-sign-action-queue` |

## 3.3 Taxonomy rule: one label can span surfaces only when the context is explicit

The repo already uses “My Work” in broader PWA/product doctrine. My Dashboard may use the same user-facing phrase because it is conceptually aligned, but it must always be clear whether a document refers to:

- the **My Dashboard-hosted My Work shell**,
- the **PWA My Work page**,
- or the **shared `@hbc/my-work-feed` package**.

Documents, prompts, and code comments should therefore use the full phrase when ambiguity is possible.

## 3.4 Copy guidance

Use:
- **My Dashboard** for the page/product identity,
- **My Work** for the personal dashboard surface,
- **Adobe Sign Action Queue** for the module title,
- **Agreements requiring your action** as user-facing explanatory copy where natural.

Avoid implying:
- HB Intel performs the signature action itself,
- the queue is exhaustive when source state is partial,
- a user has no work simply because one source cannot be reached.

## 3.5 Prohibited naming drift

Unless later explicitly approved, avoid introducing alternate labels such as:

- `personal-dashboard`
- `user-dashboard`
- `my-items`
- `Adobe Queue`
- `Signing Center`
- `pending-signatures` as a module name
- `My Tasks` as a synonym for the entire product surface

These labels either conflict with current doctrine, reduce precision, or narrow the module beyond its intended status mapping.

## 3.6 Recommended taxonomy statement for later docs

Later planning documents should preserve the following exact positioning:

> **My Dashboard is the SharePoint-hosted personal operating destination. My Work is the user-facing command surface within it. Adobe Sign Action Queue is the first production-shaped module in that surface. The workstream must remain compatible with HB Intel’s existing Personal Work Hub and `@hbc/my-work-feed` doctrine rather than creating a competing personal-work taxonomy.**

---

# 4. Scope Lock

## 4.1 In-scope for this initiative

The My Dashboard MVP should include:

1. New SPFx app/domain architecture for **My Dashboard**.
2. A **My Work Shell** using PCC-like construction principles.
3. A default **My Work Home** surface.
4. One production-shaped first module: **Adobe Sign Action Queue**.
5. Read-model boundaries sufficient to support personalized queue data.
6. Source-state handling for:
   - ready,
   - empty,
   - configuration required,
   - authorization required,
   - principal unresolved where applicable,
   - source unavailable,
   - partial/degraded response.
7. Communication-site hosting fit and final hosted validation requirements.
8. A naming and product-boundary doctrine compatible with existing My Work architecture.

## 4.2 Explicitly out of scope for the MVP

The following remain out of scope for the first implementation phase:

- in-HB signing or approval of Adobe agreements,
- editing, sending, cancelling, or otherwise mutating Adobe agreements,
- rendering full agreement documents inside My Dashboard,
- manager proxy access or cross-user queue impersonation,
- admin override of the actor identity for a “me” queue,
- automated reminders or escalations,
- webhook-backed synchronization,
- persistence of a global unified personal task store unless later approved,
- cross-platform unified “all My Tasks” aggregation beyond the first scoped module,
- Teams packaging in the first release,
- full URL-deep-link persistence for selected modules unless later batch scope explicitly adds it,
- PCC runtime integration of the new Adobe queue in the same phase.

## 4.3 What is intentionally deferred, not rejected

The following may remain valid future enhancements but are not MVP commitments:

- broader My Work module families,
- live integration of additional external-system queues,
- stronger role-aware personalization,
- direct reuse of `@hbc/my-work-feed` UI surfaces if later shown to be a clean fit,
- manager/team queue projections,
- notification and escalation intelligence,
- cross-surface navigation between the SPFx My Dashboard and the PWA Personal Work Hub.

## 4.4 Scope lock generated by repo truth

The existence of `@hbc/my-work-feed` creates a new boundary requirement not explicit enough in the original outline:

> **The My Dashboard MVP may establish a SharePoint-hosted shell and an Adobe queue module, but it must not redefine HB Intel’s canonical personal-work item model or aggregation architecture by accident.**

Later batches must carry this forward.

---

# 5. Target Users, User Stories, and UX Intent

## 5.1 Primary target user

**Authenticated HB employee using the My Dashboard communication site to understand work requiring their attention.**

The first module is most useful for employees who regularly receive Adobe Sign actions, but the shell/product foundation should remain broad enough for future personal work modules.

## 5.2 Primary MVP user story

> **As an authenticated HB employee, I want to see Adobe Sign agreements requiring my action so I can understand what needs attention and open the appropriate source agreement efficiently.**

## 5.3 Supporting user stories

### Queue and prioritization
- As a user with multiple pending agreements, I want the queue to make action type and relative urgency understandable at a glance.
- As a user, I want concise source-derived summary counts so I can decide whether to open the focused queue view.

### Empty and degraded states
- As a user with no pending agreements, I want a clear empty state so I understand that there is no current Adobe action pending for me.
- As a user whose Adobe connection is not ready, I want an authorization or configuration state that explains what is missing without implying that the queue is empty.
- As a user during a source outage or partial response, I want the UI to explain that data may be incomplete or temporarily unavailable.

### Trust and authority
- As a user, I want the interface to make clear that HB Intel is surfacing Adobe Sign action context and that final agreement action remains in the source system.
- As a user, I want refresh state or “generated at” context when source currency materially affects my confidence in the queue.

### Future extensibility without MVP sprawl
- As a future user of additional personal-work modules, I should experience a consistent My Work shell pattern rather than a one-off Adobe-only page that cannot scale.

## 5.4 UX intent statement

The My Work shell should feel like:

> **A calm, polished, personally relevant command surface that helps a user determine what requires attention next, without pretending to be the source system or overloading the page with low-value detail.**

## 5.5 UX design principles

### Principle 1 — Summary first, detail second
The landing experience should make the user’s current posture understandable before asking them to inspect a list. [R1] [R9] [R10]

### Principle 2 — Actionability over decoration
Cards, metrics, and queue lines should exist because they help the user decide what to do next. [R7] [R8]

### Principle 3 — Distinct state cards, not vague errors
Empty, authorization-required, source-unavailable, and configuration-required states must be distinct end-user states. [R4]

### Principle 4 — Personal relevance without immediate over-personalization
The MVP should be user-contextual by actor identity, but it need not introduce broad end-user customization before the shell and queue pattern are proven. [R2] [R5] [R6]

### Principle 5 — Cognitive restraint
Do not overload the home surface. The queue exists to reduce triage effort, not add another screen users must decipher. [R9] [R10]

### Principle 6 — Source authority stays visible
The UI should never suggest that HB Intel owns or completes the agreement action when Adobe Sign remains the source system.

### Principle 7 — Communication-site host fit is part of UX quality
Wide-layout fit, page composition, and actual hosted validation matter because communication-site rendering constraints differ from generic app canvases. [R1] [R3]

---

# 6. Closed Decisions Register

| Decision | Closed recommendation / resolution | Rationale |
|---|---|---|
| New SPFx domain or PCC extension? | **New SPFx domain** | Personal user context differs from PCC project context; host and lifecycle differ |
| What exactly is inherited from PCC? | **Shell-construction grammar only** | Reuse mature command surface / hero / active panel / bento shell logic conceptually |
| What exactly is inherited from HB Homepage? | **Communication-site host-fit lessons only** | Useful for page composition and ownership boundaries; wrong product family for My Work |
| Is My Dashboard already in the repo? | **Yes as planning docs; no runtime app scaffold found** | Search identified SPFx planning outline, not implementation domain |
| Should the plan ignore existing My Work Feed architecture? | **No** | Existing `@hbc/my-work-feed` and PWA My Work page materially affect taxonomy and architecture |
| Should PCC `adobe-sign` and My Dashboard `adobe-sign-action-queue` be merged? | **No** | One is project-context launch/reference; the other is user-context action queue |
| MVP breadth? | **Shell + first queue module; no unified cross-source personal-work suite yet** | Prevent scope creep and preserve architectural clarity |

---

# 7. Assumptions and Facts That Remain Unverified

## 7.1 Assumptions used in this Batch 01 artifact

1. The target My Dashboard SharePoint communication site named in the source outline is the intended production host.
2. The first module remains Adobe Sign Action Queue.
3. The broader comprehensive development plan will continue to include backend-mediated reads and source-system authority boundaries.
4. No prior Batch 01 output exists that supersedes this artifact.

## 7.2 Facts not verified in this audit

The following facts remain outside the evidence scope of this Batch 01 repo/research artifact and require later confirmation:

1. Whether the SharePoint site currently exists and its final page-placement decision.
2. Whether an Adobe app registration, OAuth callback host, and delegated token storage posture are already approved.
3. Which exact Acrobat Sign endpoints, scopes, and account/shard details will be authorized in the live integration phase.
4. Whether the final My Dashboard implementation will directly consume, bridge to, or remain narrowly aligned beside `@hbc/my-work-feed`.
5. Whether a dedicated final page URL has already been selected for Playwright-hosted validation.
6. Whether future UX wants the My Dashboard surface to cross-link to the PWA Personal Work Hub at MVP or only in a later phase.

---

# 8. Downstream Constraints for Batches 02–08

## 8.1 Cross-batch constraints that later work must inherit

### Constraint 1 — Do not implement My Dashboard inside PCC
PCC may inspire shell construction, but the new initiative remains a sibling app/domain.

### Constraint 2 — Preserve the product distinction between project work and personal work
PCC project actions and My Dashboard personal queues may use related words, but their context and read-model inputs are distinct.

### Constraint 3 — Do not create a second personal-work platform primitive by accident
Later batches must explicitly reconcile with `@hbc/my-work-feed` before introducing new item taxonomy, ranking semantics, or queue-health terminology.

### Constraint 4 — Preserve the Adobe module separation
`adobe-sign` in PCC and `adobe-sign-action-queue` in My Dashboard must remain separate concepts.

### Constraint 5 — Hosted communication-site proof is mandatory
Workbenches, screenshots, and local app assumptions are not enough for final acceptance; later implementation must validate actual SharePoint-hosted rendering. [R3]

### Constraint 6 — Keep the landing surface summary-first
Do not expand My Work Home into a dashboard dump. Progressive disclosure is the correct direction. [R1] [R9] [R10]

### Constraint 7 — State clarity is part of the architecture
Empty, degraded, authorization-required, configuration-required, and partial states must be designed intentionally, not added as last-minute error banners. [R4] [R11]

### Constraint 8 — Source authority must remain explicit
My Dashboard surfaces external work; it does not silently become the authoritative agreement system.

### Constraint 9 — Later naming must preserve the taxonomy locked here
Prompt packages and code comments must not introduce casual alternatives that muddy the product boundary.

## 8.2 Batch-specific implications

| Later batch | Batch 01 dependency |
|---|---|
| Batch 02 — shell/product architecture | Must design My Work Shell as a new SPFx sibling architecture; must preserve taxonomy |
| Batch 03 — read models/contracts | Must explicitly address reuse/bridge posture relative to `@hbc/my-work-feed` |
| Batch 04 — home surface UX | Must enforce summary-first and state clarity |
| Batch 05 — Adobe module UX | Must preserve user-context action queue posture and source-system clarity |
| Batch 06 — backend host | Must remain authenticated-user “me” oriented; avoid user-provided actor overrides |
| Batch 07 — OAuth/live integration | Must preserve delegated-user semantics unless explicitly re-decided with justification |
| Batch 08 — deployment/evidence | Must prove actual SharePoint communication-site host fit |

---

# 9. Risks If Later Plan Sections Ignore Batch 01 Findings

| Risk | What goes wrong | Severity |
|---|---|---|
| Product-context conflation | My Dashboard becomes a PCC tab or PCC clone despite being user-contextual | High |
| Platform duplication | A competing personal-work item model is created beside `@hbc/my-work-feed` | High |
| Taxonomy drift | “My Work,” “Work Hub,” “Action Center,” and “Dashboard” begin meaning different things across code/docs | High |
| Wrong shell inheritance | HB Homepage shell mechanics are over-applied to My Work navigation and routing | Medium-High |
| Adobe module collision | PCC `adobe-sign` and My Dashboard `adobe-sign-action-queue` become confused or merged | High |
| MVP sprawl | The first release balloons into a broad personal task platform rather than proving a focused shell/module pattern | High |
| UX overload | The home surface becomes too dense, increasing cognitive burden rather than reducing triage effort | Medium-High |
| False confidence in source state | Empty and degraded states are underdesigned, causing users to misread unavailable data as no work pending | High |
| Hosted validation failure | Workbench/local acceptance misses communication-site width and layout constraints | Medium-High |
| Future batch rework | Later implementation prompts need major restructuring because Batch 01 boundary decisions were not preserved | High |

---

# 10. Recommended Final Foundation Statement

The comprehensive plan should treat the following as the governing foundation:

> **My Dashboard is a new SharePoint-hosted HB Intel app/domain that activates the platform’s existing “personal work first” doctrine in a communication-site context. Its internal My Work shell may inherit shell-construction principles from Project Control Center, and it may borrow communication-site hosting lessons from HB Homepage, but it remains its own user-context product surface. The first live module, Adobe Sign Action Queue, must remain separate from PCC’s project-context `adobe-sign` module. Because HB Intel already contains a mature Personal Work Hub and `@hbc/my-work-feed` architecture, later My Dashboard batches must explicitly align with that existing doctrine and avoid creating a competing personal-work platform vocabulary.**

---

# 11. Research References

- **R1.** Microsoft Support. *Plan your SharePoint communication site.*  
  https://support.microsoft.com/en-us/office/plan-your-sharepoint-communication-site-35d9adfe-d5cc-462f-a63a-bae7f2529182
- **R2.** Microsoft Support. *Target navigation, news, files, links, and web parts to specific audiences.*  
  https://support.microsoft.com/en-us/office/target-navigation-news-files-links-and-web-parts-to-specific-audiences-33d84cb6-14ed-4e53-a426-74c38ea32293
- **R3.** Microsoft Learn. *Use web parts with the full-width column.*  
  https://learn.microsoft.com/en-my/sharepoint/dev/spfx/web-parts/basics/use-web-parts-full-width-column
- **R4.** Microsoft Learn. *Empty states for web parts.*  
  https://learn.microsoft.com/en-us/sharepoint/dev/design/empty-states
- **R5.** Microsoft Learn. *Create and edit a Viva Connections dashboard.*  
  https://learn.microsoft.com/en-us/viva/connections/create-dashboard
- **R6.** Microsoft Learn. *Available dashboard cards in Viva Connections.*  
  https://learn.microsoft.com/en-us/viva/connections/available-dashboard-cards
- **R7.** Sorapure, Madeleine. *User Perceptions of Actionability in Data Dashboards.* 2023.  
  https://journals.sagepub.com/doi/10.1177/10506519231161611
- **R8.** Verhulsdonck, Gustav, and Vishal Shah. *Making Actionable Metrics “Actionable”: The Role of Affordances and Behavioral Design in Data Dashboards.* 2022.  
  https://journals.sagepub.com/doi/abs/10.1177/10506519211044502
- **R9.** *Effect of information load and cognitive style on cognitive load of visualized dashboards for construction-related activities.* *Automation in Construction*, 2023.  
  https://www.sciencedirect.com/science/article/pii/S0926580523002893
- **R10.** *Business intelligence and cognitive loads: Proposition of a dashboard adoption model.* *Data & Knowledge Engineering*, 2024.  
  https://www.sciencedirect.com/science/article/pii/S0169023X2400034X
- **R11.** *Organizational decision making and analytics: An experimental study on dashboard visualizations.* *Information & Management*, 2024.  
  https://www.sciencedirect.com/science/article/pii/S0378720624000934
