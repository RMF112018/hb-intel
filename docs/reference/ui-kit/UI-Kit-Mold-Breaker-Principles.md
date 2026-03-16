# UI Kit Mold-Breaker Principles

> **Doc Classification:** Living Reference (Diátaxis) — WS1-T02 governing mold-breaker principles for HB Intel UI Kit; directional authority for T03 visual language, T04 hierarchy doctrine, T05 density/field doctrine, T06 data surface direction, T07 component quality bar, T13 production-readiness scorecard.

**Produced by:** WS1-T02 (Competitive Benchmark Matrix and Mold-Breaker Principles)
**Date:** 2026-03-16
**Governing plan:** `docs/architecture/plans/UI-Kit/WS1-T02-Competitive-Benchmark-Mold-Breaker.md`

---

## Governing Status

These principles are **governing constraints**, not aspirational goals. Any design or implementation choice in T03–T08 that conflicts with a mold-breaker principle requires a documented rationale explaining why the deviation is necessary.

Each principle is derived from specific competitive evidence in the market studies. Principles without direct market evidence are marked as HB Intel judgment calls.

### Wave 0 Scope

All principles in this document reflect what the kit can genuinely achieve in Wave 0. Where a principle describes capability beyond Wave 0, the future-direction scope is explicitly labeled.

---

## Verifiability Key

| Tag | Meaning |
|-----|---------|
| **[V]** | **Verifiable** — expressed in measurable terms that can be validated through testing, inspection, or automated checks |
| **[J]** | **Judgment** — HB Intel judgment call validated through design review checkpoint; not reducible to a single metric |

---

## Principles

### MB-01: Lower Cognitive Load Than the Category [V]

**Motivation:**
Construction-tech platforms are consistently criticized for cognitive overload. 60–70% of negative user reviews cite steep learning curves, dense interfaces, and excessive clicks for common actions. Procore requires 3–6 months to proficiency. CMiC reviewers describe "tons of features" creating overwhelm. No platform implements contextual in-app onboarding — "the single largest UX gap shared across the entire category." *(ux-mold-breaker, §3.2, §4; con-tech-ux-study, §3, §5, §9)*

**Positive Requirement:**
The kit must support progressive disclosure through a three-tier complexity system (Essential / Standard / Expert) that hides advanced controls until needed. Entry screens must open to current work via role-based project canvas, not to module menus. Empty states must provide actionable next-step guidance ("No submittals yet. Typical next step: import submittal register.") rather than blank screens.

**Verifiable terms:**
- Users reach first actionable item in <30 seconds without navigation training
- Essential mode enables task completion without exposing advanced fields
- First-session orientation time <5 minutes for new role assignment
- Maximum information elements per viewport region documented per complexity tier

**Anti-Pattern:**
Module-first navigation that requires users to mentally map "which tool do I need?" before work begins. Blank empty states that force support calls for basic orientation. Exposing every field and action regardless of user role or expertise level.

**Wave 0 Scope:** Role-based project canvas, complexity dial integration (`@hbc/complexity` v0.1.0), and smart empty states (`HbcSmartEmptyState`) are Wave 0 deliverables. AI-assisted contextual guidance is future direction.

---

### MB-02: Stronger First-Glance Hierarchy [V]

**Motivation:**
Category leaders use flat information density where all columns and data receive equal visual weight. CMiC represents "the high-density extreme" with financial tables that reviewers describe as "overwhelming." Status badges follow consistent color conventions across the category, but responsibility tracking (Procore's "Ball In Court") is available inconsistently — not in Change Events, added to some modules years after others. *(con-tech-ui-study, §4, §7, §8; procore-ui-study, §1)*

**Positive Requirement:**
The kit must establish visual hierarchy through deliberate type scale, weight contrast, and surface treatment. Every actionable item must show current responsibility ("next move" ownership) in a consistent position — visible in list views, detail headers, and cards. Status colors must exceed WCAG AAA (≥7:1 contrast ratio) for outdoor readability.

**Verifiable terms:**
- Minimum 3-level type scale with ratio ≥1.25× between levels
- Status + owner identifiable in <1 second per item (design review target)
- Contrast ratio ≥7:1 for all status indicators
- "Next move" ownership filterable in Saved Views across all modules

**Anti-Pattern:**
Flat density where all table columns receive equal visual weight. Inconsistent responsibility tracking available in some modules but not others. Status colors that meet WCAG AA (4.5:1) indoors but become unreadable in bright outdoor light (>1000 lux).

**Wave 0 Scope:** Type scale, status color system with ≥7:1 contrast, and universal "next move" indicator are Wave 0. Eye-tracking validation is future direction.

---

### MB-03: Less Shell Fatigue [J]

**Motivation:**
The three-region application shell (header + sidebar + content) "is so consistent across the category that it constitutes a de facto standard." However, every platform opens to a module menu, not to current work. Switching between tools requires menu interaction each time — no persistent quick-access to the 3–4 tools a user works in daily. On tablets, sidebar and content compete for space. Notification clutter in headers adds to shell fatigue. *(con-tech-ui-study, §3, §5; ux-mold-breaker, §8.1; con-tech-ux-study, §5)*

**Positive Requirement:**
The shell must implement context-adaptive chrome that adjusts density per device without requiring user configuration. Sidebar must prioritize the user's top-5 tools by learned usage patterns. Notifications must consolidate into a single prioritized stream (one bell, one center) rather than scattered module-level indicators. Shell must show current project, current phase, and role-appropriate actions.

**Design review checkpoints:**
- Shell chrome occupies <100px of tablet width in icon-only mode
- Users reach most-used tool in one tap from any screen
- Users identify current project/phase context in <1 second
- Notification stream consolidates all notification types with urgency-based prioritization

**Anti-Pattern:**
Module-first navigation requiring users to remember which tool holds which data. Notification fatigue from unfiltered, unprioritized alert streams. Shell that fights for space with content on tablet viewports.

**Wave 0 Scope:** Context-adaptive shell density modes, smart sidebar ordering, and unified notification center are Wave 0. Usage-pattern learning for sidebar prioritization is Wave 1.

---

### MB-04: Less Reliance on Horizontal Scrolling [V]

**Motivation:**
Wide multi-column tables in financial tools (budgets, cost codes) require horizontal scrolling across the category. CMiC's cost code hierarchies span 15+ columns with mandatory horizontal scroll. On tablets — the primary field device — the iPad experience "feels like a scaled-up phone app" because tables don't adapt to viewport. No competitor implements responsive column hiding or card-based fallback for narrow viewports. *(con-tech-ui-study, §6, §14; con-tech-ux-study, §6)*

**Positive Requirement:**
Core data tables must display without horizontal scrolling at tablet landscape viewport (1024px). Tables must implement adaptive column hiding that shows only essential columns by default (ID, Status, Owner, Due Date) with advanced columns available via column picker. On viewports below 768px, wide data must transform to vertical card layout where columns become card rows.

**Verifiable terms:**
- Zero horizontal scroll on viewports ≥1024px for standard data surfaces
- Core tables show ≤6 default columns; full column set accessible via toggle
- Card-based view renders on viewports <768px with no horizontal scroll
- Split-pane (drawing + details) reflows intelligently: details become slide-out panel below 1366px

**Anti-Pattern:**
Tables that render all columns regardless of viewport width, forcing horizontal scroll. Financial tables that present 15+ columns as the default view. Split-pane layouts where one side must scroll horizontally on tablets.

**Wave 0 Scope:** Adaptive column hiding, card-based narrow fallback, and split-pane reflow are Wave 0. All Saved Views respect viewport-appropriate column sets.

---

### MB-05: More Adaptive Density [V]

**Motivation:**
No competitor offers a complexity dial. Users receive one density level regardless of role, device, or expertise. Procore's configurable columns with Saved Views allow users to create role-appropriate density levels, but this is user-configured, not system-provided. InEight allows chief estimators to create "relevant views and workflows to help estimators who want a more simplistic platform." The category's most common complaint is "great once you learn it, but too much up front." *(ux-mold-breaker, §8.2; con-tech-ux-study, §6; con-tech-ui-study, §6)*

**Positive Requirement:**
The kit must implement three distinct density modes — Essential (common fields only), Standard (all fields, no edge cases), Expert (advanced bulk actions, audit, relationship tracing) — selectable by the user and configurable as role-based defaults by admins. Mode selection must persist per device. Advanced fields hidden in lower tiers must show a "?" affordance explaining why they are hidden and how to access them.

**Verifiable terms:**
- Three density modes (Essential / Standard / Expert) with documented element visibility rules per mode
- Users switch modes in <2 seconds via persistent toggle
- Essential mode shows ≤6 fields per item
- Mode persists per device (desktop, tablet, phone can have different modes)
- Role-based defaults configurable by admin

**Anti-Pattern:**
One-size-fits-all density where power users tolerate complexity and occasional users are overwhelmed. Mobile experience that is a "crippled" version of desktop rather than an intentionally simplified tier. Configuration without guidance where users must discover Saved Views or ask admins for custom views.

**Wave 0 Scope:** Three-tier complexity toggle integrated via `@hbc/complexity` (v0.1.0), device-aware persistence, and role-based defaults are Wave 0. Smart field hiding with "?" affordance is Wave 0. AI-suggested density mode is future direction.

---

### MB-06: More Deliberate Depth [J]

**Motivation:**
All platforms use subtle box shadows (1–4px blur, low opacity) for card elevation, but the elevation system is not deliberate — the same shadow value appears on cards, panels, and overlays without communicating hierarchy. CMiC's interface is criticized as feeling "outdated," partially because flat or inconsistent elevation does not communicate depth. Newer implementations favor slide-out panels (from right edge) for preview and quick-edit, reducing full-page navigation. *(con-tech-ui-study, §9.1–9.3; ux-mold-breaker, §3.2)*

**Positive Requirement:**
The kit must implement a measured elevation system where shadow values (2px, 4px, 8px, 16px) correlate to layering depth. Flat surfaces (tables, text blocks) use borders; elevated surfaces use shadows. Interactive states (hover, focus, active, disabled) must be visually distinct. Panels must show context breadcrumb enabling jump-back to parent context.

**Design review checkpoints:**
- 3+ elevation levels are visually distinct to users
- Interactive elements identifiable without trial-and-error interaction
- Focus indicators visible at arm's length (field use distance)
- Breadcrumb navigation returns to parent context in <1 second
- Layering hierarchy is apparent: inline edit < side panel < full-page modal

**Anti-Pattern:**
Single shadow value applied uniformly to all elevated elements. Unclear interactive states where hover, focus, and active look the same. Stacked overlays without clear visual containment signaling which layer is editable.

**Wave 0 Scope:** Measured elevation token set (4 levels), interactive state system, and breadcrumb depth navigation are Wave 0. Animation polish for elevation transitions is Wave 1.

---

### MB-07: More Field-Usable Contrast and Touch Patterns [V]

**Motivation:**
No platform explicitly documents high-contrast design for outdoor construction environments. Standard 48px touch targets are borderline for gloved hands. Field users consistently express lower satisfaction with UX than office users and request "simpler interfaces, fewer clicks, and better mobile/offline experiences." CMiC's mobile is described as "very out-dated and hard to use." Procore's drawing sync (manual per project) is described as a safety/quality risk. *(ux-mold-breaker, §3.3, §8.5, §8.6; con-tech-ux-study, §11, §17.3)*

**Positive Requirement:**
All interactive elements must meet minimum touch target sizes in field density mode. Text contrast must exceed WCAG AAA. The kit must support offline-first drawing access with background sync for annotations. Field-optimized workflows must provide quick-create buttons (observation, punch, photo) always visible, with camera capture via dedicated button rather than file picker.

**Verifiable terms:**
- Touch targets ≥48×48px in field density mode (≥44×44px minimum in all modes)
- Spacing between interactive elements ≥8px
- Text contrast ratio ≥4.5:1 (WCAG AA minimum); ≥7:1 for critical status indicators
- High-contrast mode available: ≥10:1 for outdoor use at >1000 lux
- Drawings load from cache in <1 second offline
- Offline markups queue and sync without manual action
- Field issue creation completes in <30 seconds

**Anti-Pattern:**
32px row heights in data tables that are untouchable with gloves. Gray text on white backgrounds that disappear in sunlight. Drawing sync that requires manual per-project action. Desktop-centric keyboard navigation imposed on tablet/field contexts.

**Wave 0 Scope:** Touch target minimums, contrast ratios, and field density mode are Wave 0 token and component requirements. Offline drawing cache with background sync is Wave 0 for PWA. Auto-detect outdoor light conditions for high-contrast mode is future direction.

---

### MB-08: No Visual Version-Boundary Seams [V]

**Motivation:**
Procore's NGX modernization is the most comprehensive UX overhaul in the category, but the modernization is not complete across all tools — "some tools remain in 'legacy' state." Users navigate from modernized RFI interface to legacy Change Events interface, experiencing a visual and behavioral seam. CMiC users see an "outdated" interface alongside newer mobile apps. Trimble has separate cloud and on-premise UIs. All modernization trajectories point toward convergence on a common standard, but none has achieved it. *(con-tech-ux-study, §16; con-tech-ui-study, §6)*

**Positive Requirement:**
The kit's design system must be applied universally from day one — no legacy modules, no visual divergence between tools, no device-platform inconsistency. All tools must use identical button styles, card patterns, table layouts, and color semantics. Updates must be synchronized across all surfaces per release. Device-specific UI must use the same design language with device-appropriate interaction models.

**Verifiable terms:**
- Single design token set consumed by all surfaces — zero per-surface visual overrides
- All modules share identical component variants (buttons, cards, tables, status badges)
- No module is more than one release behind the current design system version
- Web and mobile surfaces are visually recognizable as the same product
- Feature rollouts are consistent across modules (e.g., Saved Views available everywhere simultaneously)

**Anti-Pattern:**
Partial modernization where some tools use the new design system and others remain legacy. Tool-by-tool updates that create visual seams when users navigate between modules. Mobile experience that feels like a "stripped-down version" rather than the same product adapted for the device.

**Wave 0 Scope:** Single design token set, universal component library, and synchronized surface deployment are Wave 0 architectural requirements. `@hbc/ui-kit` already serves as the single component library for all surfaces. Cross-device visual parity validation is Wave 0.

---

## Traceability Matrix

| Principle | Primary Evidence Sources | Evidence Type |
|-----------|------------------------|---------------|
| MB-01 Lower cognitive load | ux-mold-breaker §3.2, §4; con-tech-ux-study §3, §5, §9 | User reviews (60–70% cite learning curve); onboarding gap analysis |
| MB-02 Stronger hierarchy | con-tech-ui-study §4, §7, §8; procore-ui-study §1 | Design system analysis; BIC pattern comparison; color system audit |
| MB-03 Less shell fatigue | con-tech-ui-study §3, §5; ux-mold-breaker §8.1; con-tech-ux-study §5 | Shell pattern convergence analysis; navigation complexity comparison |
| MB-04 Less horizontal scrolling | con-tech-ui-study §6, §14; con-tech-ux-study §6 | Table density analysis; responsive behavior audit; tablet viewport study |
| MB-05 More adaptive density | ux-mold-breaker §8.2; con-tech-ux-study §6; con-tech-ui-study §6 | Complexity dial proposal; configurable views comparison; density criticism |
| MB-06 More deliberate depth | con-tech-ui-study §9.1–9.3; ux-mold-breaker §3.2 | Elevation pattern audit; panel pattern analysis; slide-out adoption study |
| MB-07 Field-usable contrast/touch | ux-mold-breaker §3.3, §8.5, §8.6; con-tech-ux-study §11, §17.3 | Field satisfaction gap; touch target audit; offline capability analysis |
| MB-08 No version-boundary seams | con-tech-ux-study §16; con-tech-ui-study §6 | NGX modernization analysis; platform divergence study; convergence trajectory |

---

## Source Evidence

| Source File | Scope |
|------------|-------|
| `docs/explanation/design-decisions/ux-mold-breaker.md` | Product strategy, 16 signature solutions, field doctrine |
| `docs/explanation/design-decisions/con-tech-ux-study.md` | Cross-platform UX analysis of 7 construction-tech leaders |
| `docs/explanation/design-decisions/con-tech-ui-study.md` | Cross-platform visual/UI analysis of 7 platforms |
| `docs/explanation/design-decisions/procore-ui-study.md` | Procore design system and UI patterns |
| `docs/explanation/design-decisions/procore-ux-study.md` | Procore UX patterns and field experience |

---

*End of UI Kit Mold-Breaker Principles — WS1-T02 v1.0 (2026-03-16)*
