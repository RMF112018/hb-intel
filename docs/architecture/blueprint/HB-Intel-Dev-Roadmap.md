# HB Intel — Delivery Roadmap

> **Doc Classification:** Canonical Normative Plan — consolidated execution delivery roadmap for HB Intel; defines wave structure, dual-stream SPFx/PWA sequencing, readiness gates, and long-range convergence doctrine. Does **not** replace `current-state-map.md` as present-state authority, the Unified Blueprint as program narrative, or detailed branch plans for task-level implementation.

> **Document Role:** Master delivery roadmap for HB Intel. This document consolidates completed streams, MVP-stage work, and future production-stage expansion into one execution-oriented roadmap. It is forward-looking and planning-oriented. It does **not** replace `current-state-map.md` as the source of present-state truth, and it does **not** replace detailed PH / SF / MVP task plans.
>
> **Read with:** `CLAUDE.md` → `docs/architecture/blueprint/current-state-map.md` → `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md` → this roadmap → detailed branch plans.

**Version:** 1.1
**Date:** 2026-03-15
**Roadmap Basis:** Refined Unified Blueprint + roadmap interview decisions  
**Primary Audience:** Product owner, architecture/code agents, implementation planning, leadership reviewers

---

## 1. Purpose of This Document

This roadmap answers five practical questions:

1. What major platform streams are already complete enough to be treated as available foundations?
2. What work remains to reach the staged MVP rollout?
3. How should the dual **SPFx + PWA** delivery model be sequenced during MVP?
4. What are the gates for moving from MVP waves into broader production stages?
5. How should HB Intel converge from a SharePoint-centered rollout toward a PWA-first operating model over time?

This document is the **canonical delivery roadmap** for completed and remaining work. Detailed task execution remains in the branch plans under `docs/architecture/plans/`.

---

## 2. Governing Interpretation Model

### 2.1 What governs what

- **Present-state truth:** `docs/architecture/blueprint/current-state-map.md`
- **Master product / architecture narrative:** `docs/architecture/blueprint/HB-Intel-Unified-Blueprint.md`
- **Historical implementation baseline:** `docs/architecture/plans/hb-intel-foundation-plan.md`
- **Binding architecture decisions:** `docs/architecture/adr/*`
- **Detailed implementation plans:** `docs/architecture/plans/PH*`, `ph7-*`, `shared-features/*`, `MVP/*`
- **This document:** the consolidated execution roadmap across completed, MVP, and future production stages

### 2.2 How to use this roadmap

Use this roadmap to understand **sequence, dependencies, wave structure, readiness gates, and long-range convergence**. Do not use it as proof that something is already implemented. Any statement about current implementation status should be verified against `current-state-map.md`.

---

## 3. Roadmap Doctrine (Locked Planning Assumptions)

The roadmap is governed by the following planning assumptions.

### 3.1 Dual-stream rollout model

HB Intel is a **dual SPFx / PWA application stream** during MVP and early production stages.

- **SPFx apps** are deployed first into real SharePoint contexts where users already work:
  - Estimating in the Estimating department site
  - Business Development in the Business Development department site
  - Risk Management in the Risk Management department site
  - Project Hub in project-specific sites
  - and so on by app
- **PWA** grows in parallel and unifies those apps under a single RBAC-governed experience.
- Long term, the platform is expected to converge toward **PWA-first use**, with SPFx retired app-by-app when justified.

### 3.2 Balanced progress rule

Roadmap sequencing should maintain **balanced progress between SPFx and PWA from the beginning**.

This does **not** mean both surfaces must mature at identical speeds. It means the roadmap must avoid:
- building SPFx experiences with no meaningful PWA counterpart planned,
- or building a PWA shell that lags too far behind real delivered value.

### 3.3 App-level MVP completion rule

An individual app stream is only treated as **MVP-complete** when:
- its **SPFx experience** is ready enough for real use in the intended SharePoint context, **and**
- its **PWA experience** is ready enough for real use in the unified application context.

### 3.4 Value-proof before hosting-cost escalation

The initial rollout prioritizes SPFx because:
- users already work in SharePoint,
- deployment friction is lower,
- department/project context matters,
- and early value can be proven before leadership is asked to approve additional hosted-PWA cost.

The PWA must **earn** broader investment by proving a real unified experience in a limited but meaningful scope.

### 3.5 Project Hub centrality

Project Hub is the central project-context anchor of the roadmap. Department apps may roll out on their own cadence, but they should be designed to connect back into Project Hub as the common project context.

### 3.6 Shared-platform rule

Shared features should generally be **adopted by default** and matured in support of real app rollouts. Existing shared packages should be reused and hardened where appropriate. They should not be ignored, but they also should not be forced into critical app paths before they are ready enough for dependable use.

### 3.7 Rollout rule

Stronger app streams may continue moving forward when another app stream lags, provided that:
- shared-platform standards stay coordinated,
- Project Hub integration remains coherent,
- and long-term PWA convergence is not undermined.

### 3.8 SPFx sunset rule

The default target is to sunset an app’s SPFx surface **3 to 6 months after the corresponding PWA experience is trusted, broadly adopted, and clearly better as the primary experience**, unless a clear business or operational reason justifies a longer overlap.

---

## 4. What the Roadmap Optimizes For

The roadmap prioritizes work by the problem categories HB Intel is intended to solve.

### 4.1 Priority order

1. **SharePoint site provisioning, management, and maintenance**
2. **Project lifecycle continuity**
   - Business Development → Estimating → Preconstruction → Construction → Warranty → Closure → Repeat Business
3. **Department collaboration**
4. **The rest**

### 4.2 Prioritization logic

Individual app sequencing should be driven first by:
- business pain,
- speed of value proof,
- trust-building potential,
- readiness,
- sponsorship,
- and external constraints.

A pure lifecycle order is not sufficient by itself. In practice, app timing is a blended decision based on:
- lifecycle importance,
- department need,
- leadership support,
- SharePoint readiness,
- and overall platform fit.

---

## 5. Completed and In-Place Foundations

> **Authority note:** This section summarizes planning-relevant foundations. Verify actual completion and maturity in `current-state-map.md` and package documentation.

The roadmap assumes the following foundations are already sufficiently established to support the staged MVP program:

### 5.1 Platform and governance foundations

- monorepo and workspace structure
- architecture governance hierarchy
- ADR program
- dev harness / tooling baseline
- core shell / auth / UI kit / models / query foundation

### 5.2 Shared package direction already underway

The repo already contains meaningful shared-package work that should be treated as real roadmap inputs, not hypothetical future ideas. This includes, at minimum, package families for:
- provisioning
- notification intelligence
- project canvas / governed personalization
- step wizard
- bic-next-move / work ownership
- field annotations
- versioned record / history direction
- and other shared-feature families already represented in `shared-features/*`

### 5.3 Consolidated blueprint/governance layer

The documentation set now has:
- a refined unified blueprint,
- a crosswalk,
- a consolidation report,
- and a clearer truth hierarchy.

That means the roadmap can now be managed as a **single delivery narrative** instead of being reconstructed from scattered summary files.

---

## 6. Core Readiness Gates

The roadmap uses gates rather than fixed calendar-only milestones.

### 6.1 App pilot gate

An app can enter pilot use when:
- its target workflow is coherent in SPFx,
- the underlying shared-platform dependencies are stable enough,
- its key states and ownership rules are visible to users,
- support/admin recovery paths exist where needed,
- and the app can be used by a limited real audience without constant developer intervention.

### 6.2 App MVP-complete gate

An app reaches MVP completion when:
- SPFx is trusted in real use,
- the corresponding PWA experience is ready enough for real use,
- core workflow stability is proven,
- support burden is manageable,
- and the app’s business value is visible enough to justify broader rollout.

### 6.3 PWA MVP gate

The PWA can be treated as entering its own real MVP stage when it can already prove:
- users can sign in successfully,
- users see only the apps they are allowed to use,
- app access is clean and trustworthy,
- users have a credible personal starting point,
- and a few important app areas already feel unified enough to justify hosted investment.

### 6.4 Broader rollout gate

An app or platform wave moves from pilot to broader rollout when:
- users trust it,
- key workflows are stable,
- support burden is manageable,
- sponsorship remains active,
- and the app no longer depends on unusually high-touch developer intervention.

### 6.5 SPFx retirement gate

An app’s SPFx surface can begin retirement planning when:
- the PWA version is trusted,
- the PWA is clearly the better primary experience for that workflow,
- RBAC and navigation are working cleanly,
- users are actually choosing the PWA,
- and support issues tied to the PWA version are operationally acceptable.

---

## 7. Roadmap Structure

The roadmap is organized into:
- **Foundation stream**
- **MVP Wave 0**
- **MVP Wave 1**
- **MVP Wave 2**
- **MVP Wave 3**
- **Future production stages**
- **Convergence stage**

Each stage contains both SPFx and PWA implications.

---

## 8. Foundation Stream — Project Setup / SharePoint Platform Repair

### 8.1 Role in the roadmap

This stream is both:
- a **foundation stream**, because later app experiences depend on site structure, permissions, project identity, and setup governance,
- and the **first visible MVP proof**, because it is one of the clearest early user-facing demonstrations of trust and value.

### 8.2 Scope

This stream includes:
- SharePoint site provisioning
- site management and maintenance rules
- project setup workflow
- setup governance / controller gate
- standardized project structure
- provisioning visibility and recovery
- setup-related permissions and handoff rules

### 8.3 SPFx implication

Initial real user value is likely experienced through SharePoint-centered flows and departmental/project contexts.

### 8.4 PWA implication

The PWA must grow enough setup visibility, RBAC, and navigation capability to make project setup feel like part of one unified platform rather than a SharePoint-only utility.

### 8.5 Exit criteria

This stream is considered proven when it demonstrates:
- reliable, standardized project setup,
- understandable status and ownership,
- recoverable failure handling,
- and enough user trust to support the next wave of app rollout.

---

## 9. MVP Wave 1 — First Mixed App Wave

### 9.1 Wave 1 app families

Wave 1 should focus on:
- **Personal Work Hub** — the primary operating layer; the first thing users see when opening HB Intel; role-aware personal work aggregation powered by `@hbc/my-work-feed` (SF29, implemented)
- **Project Hub**
- **Estimating**
- **Business Development**

### 9.2 Why these come first

This wave best proves:
- the personal-first paradigm is real from day one (per §7.1 locked UX doctrine in the Unified Blueprint),
- lifecycle continuity upstream of active construction,
- project-context centrality,
- cross-department movement into the project,
- and visible business value in workflows leadership can understand.

### 9.3 Strategic purpose

Wave 1 proves that HB Intel is not just a provisioning utility. It proves that the platform can:
- connect upstream work to project structure,
- improve handoff clarity,
- and begin replacing fragmented methods with connected, role-aware experiences.

### 9.4 SPFx expectation

Wave 1 users should encounter real value through the SPFx apps in the department/project environments where they already work.

### 9.5 PWA expectation

The PWA should support Wave 1 by proving:
- RBAC-controlled app visibility,
- clean app launch/navigation,
- and the Personal Work Hub as the trustworthy personal entry point for day-to-day use.

### 9.6 Shared-platform emphasis for Wave 1

Wave 1 should pull shared capabilities into real use where needed, especially around:
- auth / RBAC
- shared UI/system patterns
- project context persistence
- ownership visibility
- notifications
- setup/provisioning visibility
- audit/history where needed

### 9.7 Wave 1 exit criteria

Wave 1 is complete when:
- the Personal Work Hub, Project Hub, Estimating, and Business Development are each usable enough in both SPFx and PWA contexts,
- users trust the workflows,
- and the PWA has proven enough unified value to support the case for broader hosted investment.

---

## 10. MVP Wave 2 — Operational Depth and Operating Layer Growth

### 10.1 Wave 2 app families

Wave 2 should focus on:
- **Operational Excellence**
- Selected downstream operating-layer growth (deeper role-aware visibility, analytics, expanded notification intelligence)

**Reframing note (2026-03-15):** Leadership value is delivered through role-aware visibility, cards, escalation views, and drill-in surfaces within the Personal Work Hub and Project Hub established in Wave 1 — not through a standalone leadership application. The `@hbc/spfx-leadership` and `@hbc/features-leadership` packages remain as implementation containers for these role-aware surfaces. My Dashboard has been subsumed by the Personal Work Hub operating layer in Wave 1.

### 10.2 Why Wave 2 matters

Wave 2 deepens the platform’s operating layer.

It should prove that HB Intel can provide:
- company-level operational perspective,
- deeper analytics and operational oversight,
- and a stronger connection between app-level workflows and cross-department insight.

### 10.3 Strategic purpose

Wave 2 helps move the platform from “useful project/workflow tools” toward “a coherent operating environment” by improving:
- operational oversight and department-level visibility,
- and cross-department analytics that build on the Personal Work Hub and Project Hub foundations from Wave 1.

### 10.4 SPFx expectation

Wave 2 SPFx experiences should strengthen role-centered use inside SharePoint contexts where those users already spend time.

### 10.5 PWA expectation

Wave 2 is where the PWA should become more visibly real as a unified home and navigation layer, not merely a shell around early app access.

### 10.6 Exit criteria

Wave 2 is complete when:
- Operational Excellence has credible user value,
- role-aware visibility features within the Personal Work Hub and Project Hub demonstrate leadership value without requiring a standalone leadership application,
- and broader sponsorship for the next expansion stages is established.

---

## 11. MVP Wave 3 — Broader Department Collaboration and Operational Depth

### 11.1 Wave 3 focus

Wave 3 should generally emphasize:
- broader department collaboration / support functions,
- and deeper analytics and intelligence surfaces.

### 11.2 Purpose

Wave 3 broadens HB Intel from a strong early-core platform into a wider company operating layer. It should bring additional departments into the platform where there is clear business pain, readiness, and sponsorship.

### 11.3 Sequencing rule

Wave 3 should use a blended deployment rule:
- lifecycle relationship matters,
- but pain level, readiness, leadership support, and department sponsorship also matter.

### 11.4 Candidate app families

Wave 3 may include, depending on readiness and sponsorship:
- support-function department apps,
- wider collaboration tools,
- deeper analytics and intelligence surfaces,
- and additional project-support experiences that expand cross-department continuity.

### 11.5 Exit criteria

Wave 3 is successful when HB Intel is no longer experienced as a small set of connected apps, but as a meaningful cross-department operating platform with visible leadership value.

---

## 12. Future Production Stages

The roadmap should continue to keep strategically important app families visible, even when they do not yet have immediate rollout sponsors.

### 12.1 Visibility rule for future apps

Important future app streams should remain visible in the roadmap with a defined later stage, even if they are not immediate priorities.

### 12.2 Sponsorship rule

If an app matters strategically but does not yet have a strong internal champion:
- keep it visible in a future stage,
- do not force rollout early,
- and revisit it when business pull, readiness, or sponsorship improves.

### 12.3 Likely future-stage themes

Future production stages are likely to include:
- deeper lifecycle continuity into active construction and downstream closeout / warranty work,
- broader department collaboration streams,
- more complete leadership and project intelligence layers,
- additional role-specific operating surfaces,
- and stronger PWA-native experiences that reduce reliance on SharePoint hosting contexts.

---

## 13. PWA Evolution Roadmap

### 13.1 Early role of the PWA

In early MVP stages, the PWA should act as:
- the unified sign-in point,
- the RBAC-governed app launcher,
- and a trustworthy personal home layer.

### 13.2 Mid-stage role of the PWA

As Wave 1 and Wave 2 mature, the PWA should become:
- the more coherent cross-app navigation layer,
- the main place where personal work and app access feel unified,
- and the increasingly preferred entry point for day-to-day use.

### 13.3 Later-stage role of the PWA

In later production stages, the PWA should become:
- the primary operating experience,
- the default access point for most users,
- and the long-term replacement for most SPFx-first use where appropriate.

### 13.4 PWA investment rule

Leadership should only be asked to approve hosted-PWA cost once the PWA can already prove a limited but real unified experience with credible user value.

---

## 14. SPFx Evolution and Sunset Strategy

### 14.1 Why SPFx matters in early stages

SPFx remains important because it:
- meets users where they already work,
- lowers early adoption friction,
- leverages underused SharePoint context,
- and allows HB Intel to prove value before larger infrastructure cost is approved.

### 14.2 Long-term posture

SPFx is not the permanent center of gravity. Long term, the roadmap should aim for PWA-first use where the PWA becomes the better primary experience.

### 14.3 Sunset rule

The default roadmap target is:
- begin app-specific SPFx sunset planning **3 to 6 months after trusted PWA rollout** for that app,
- unless there is a compelling reason to keep SPFx active longer.

### 14.4 Sunset decision criteria

Do not sunset SPFx on a calendar alone. Use evidence:
- PWA trust
- PWA usability
- supportability
- user adoption
- workflow fit
- and business value

---

## 15. Shared Platform and Package Dependency Strategy

### 15.1 Shared features are part of the roadmap, not separate from it

The shared-package program should be treated as a core delivery stream that supports app rollout, not an abstract architecture branch disconnected from deployment.

### 15.2 Adoption rule

Use shared capabilities by default where they fit the architecture. Most shared features were built with the larger platform in mind and should not be treated as optional if they clearly represent the intended standard.

### 15.3 Hardening rule

Where a shared capability is not yet ready for critical use:
- harden it,
- narrow its first use if needed,
- but do not casually replace it with app-local divergence that will create more fragmentation later.

### 15.4 Roadmap implication

Each app-wave plan should explicitly identify:
- which shared features are required,
- which are optional but recommended,
- and which must be hardened before the app can move to pilot or broader rollout.

---

## 16. Outside Dependencies and Real-World Constraints

The roadmap must explicitly account for factors outside normal feature development.

### 16.1 Major outside dependencies

- leadership approval
- hosted-PWA cost approval
- SharePoint environment readiness
- department willingness / sponsor engagement
- IT/security constraints
- support handoff readiness

### 16.2 Planning rule

These dependencies can legitimately change sequencing. The roadmap is not purely driven by engineering logic.

### 16.3 Sponsor model

Sponsorship is app-dependent:
- some waves may be pushed by leadership,
- some by project operations,
- some by specific departments,
- and some by mixed sponsorship around visible pain points.

---

## 17. Recommended Delivery Sequence Summary

### 17.1 Stage summary

| Stage | Primary Focus | Strategic Purpose |
|---|---|---|
| **Foundation / Wave 0** | Project Setup / SharePoint provisioning, site management, maintenance | Establish trust, standardization, and platform footing |
| **Wave 1** | Personal Work Hub + Project Hub + Estimating + Business Development | Prove personal-first paradigm, lifecycle continuity, and cross-department project value |
| **Wave 2** | Operational Excellence + operating-layer growth | Deepen operational oversight and role-aware analytics |
| **Wave 3** | Broader collaboration + operational depth | Extend platform reach across the company |
| **Future Production Stages** | Additional app families, deeper lifecycle coverage, wider operating platform | Complete the broader platform vision |
| **Convergence Stage** | App-by-app PWA-first transition and SPFx retirement | Move toward unified PWA primary use |

### 17.2 Roadmap sequencing rule of thumb

- Solve the highest-value problems first.
- Keep both SPFx and PWA progressing.
- Use Project Hub as the center of project context.
- Let stronger app streams continue when another lags.
- Keep future app streams visible even before they are prioritized.
- Retire SPFx only when the PWA has genuinely earned primary-use trust.

---

## 18. What This Roadmap Leaves to Detailed Branch Plans

This roadmap intentionally does **not** define:
- exact task-level implementation breakdowns,
- exact package-by-package acceptance criteria,
- detailed ADR content,
- or exact calendar dates for every wave.

Those belong in the detailed plans under:
- `docs/architecture/plans/MVP/*`
- `docs/architecture/plans/shared-features/*`
- `docs/architecture/plans/ph7-*/*`
- root `PH*` plan files

This roadmap instead provides the **single consolidated sequencing model** those plans should align to.

---

## 19. Immediate Next Planning Actions

1. Align the detailed MVP plan branch to this staged wave model.
2. Define Wave 1 Personal Work Hub scope, leveraging the completed `@hbc/my-work-feed` (SF29) primitive and the §7.1 locked UX doctrine in the Unified Blueprint.
3. Create explicit dependency mapping between Wave 1 / Wave 2 apps and shared packages already in progress.
4. Add a clear app inventory by wave to future roadmap revisions as sponsorship/readiness becomes clearer.
5. Define app-level PWA readiness checklists using the gate model in this document.
6. Establish a recurring roadmap review rhythm so future app streams remain visible even before active execution.

---

## 20. Final Summary

HB Intel should be delivered as a **staged dual-stream platform**:
- SPFx proves value first in the SharePoint contexts where users already work,
- PWA grows in parallel and earns its hosted expansion by proving unified value,
- Project Setup / SharePoint provisioning establishes trust and footing,
- Project Hub anchors the cross-app project experience,
- and the platform expands app-by-app through staged MVP waves until the PWA becomes the primary long-term operating surface.

That is the roadmap’s core logic.