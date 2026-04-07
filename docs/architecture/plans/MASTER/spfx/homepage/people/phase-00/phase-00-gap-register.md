# Phase 00 — Gap Register and Downstream Phase Boundaries

> **Purpose:** Document what implementation assumptions change because of the Kudos merge and define the downstream responsibilities of each phase under the locked three-part architecture.

---

## Gap Register

The following implementation assumptions change because Kudos is now a distinct integrated module rather than a separate surface or future add-on.

### 1. Content model scope

**Before:** Content model covered celebrations only (birthdays, anniversaries, announcements).
**After:** Content model must also cover Kudos submissions, approval state, recipient types, celebrate counts, and publication governance. Two distinct but coexisting source models within one webpart.

### 2. Visibility and persistence rules

**Before:** Visibility rules were date-based with type-specific persistence windows for celebrations.
**After:** Visibility rules must additionally include Kudos-specific 14-day age-off for unpinned items, HR pinning overrides, approval-gated publication, and `publishStartDate`/`publishEndDate` governance fields.

### 3. Adapter output structure

**Before:** Adapter produced normalized output for two regions (Band A and Band B).
**After:** Adapter must produce normalized output for three regions: Band A (announcements), Kudos module (featured + recent headlines), and Band B (weekly celebrations). Each region has independent data requirements.

### 4. Desktop composition skeleton

**Before:** Shell consisted of header, Band A, and Band B.
**After:** Shell must include header, Band A, Kudos module shell, and Band B. The Kudos module shell must include its own local header row with title, support line, and CTAs.

### 5. Responsive behavior

**Before:** Two-region responsive adaptation.
**After:** Three-region responsive adaptation. The responsive principle requires maintaining the hierarchy at all breakpoints: Band A remains editorial, Kudos remains more prominent than Band B, and Band B remains the lightest layer.

### 6. Authoring, loading, and empty states

**Before:** Two regions needed independent empty/loading/error handling.
**After:** Three regions must each handle empty, loading, partial-data, and error states independently. One-band and no-data states must still feel intentional. The Kudos module must handle the case of zero approved Kudos gracefully.

### 7. CTA model

**Before:** CTAs limited to View All and Submit Announcement.
**After:** CTA model must additionally include Kudos-specific actions: Give Kudos (primary), View All Kudos (secondary). The homepage quick-submit flow (modal, slide-over, or anchored panel) is a new interaction pattern.

### 8. Approval workflow

**Before:** No approval workflow existed. All celebrations were editorially controlled.
**After:** Kudos introduces a submission-approval-publication workflow with configurable reviewer/approver, pending queue, and moderation workspace. This is new infrastructure.

### 9. Reactions

**Before:** No reaction system.
**After:** Kudos introduces a single positive reaction type (Celebrate) with lightweight participation tracking. This is new interactive behavior.

### 10. Dedicated page

**Before:** No dedicated subpage was part of the celebrations architecture.
**After:** Kudos requires a dedicated page with employee-facing archive browsing + long-form submission, and HR/admin moderation workspace. The homepage module must link into this destination.

### 11. Packaging and runtime validation

**Before:** Packaging validated a two-band webpart.
**After:** Packaging must validate the complete three-part surface including the Kudos module, its interactions, and the dedicated page connection.

---

## Downstream Phase Responsibilities

Each phase is now responsible for the following scope under the locked merged architecture.

### Phase 1A — Content Model and Source Strategy

Define the unified source model for:
- celebrations (birthdays, anniversaries, announcements) with type-specific persistence
- Kudos submissions with approval state, recipient types, recipient references, and media
- coexistence strategy for two distinct content domains within one webpart

### Phase 1B — Visibility, Persistence, Approval, and Editorial Rules

Define the business rules for:
- celebration date-based visibility and type-specific persistence windows
- Kudos approval-gated publication and 14-day age-off
- HR pinning overrides for both celebrations and Kudos
- editorial override fields for both domains
- display priority logic for celebrations (does not apply to Kudos)

### Phase 2 — Adapter and Output Foundation

Define the normalized output structure for all three regions:
- Band A output: filtered, ranked announcement items
- Kudos module output: featured item + recent headlines + approval metadata
- Band B output: filtered weekly celebration items
- independent empty/populated state signals per region

### Phase 3 — Desktop Composition Skeleton

Build the desktop shell with:
- webpart header (Celebrating Our People)
- Band A shell
- Kudos module shell with local header row
- Band B shell
- correct vertical stacking and hierarchy

### Phase 4 — Band A — Highlights / Announcements

Build the formal editorial milestone layer:
- 2-column editorial grid
- medium-format announcement cards
- 2–4 visible items
- collapse when empty

### Phase 5 — Kudos Homepage Module

Build the embedded homepage recognition engine:
- featured Kudos spotlight
- recent approved Kudos headlines (3–6 items)
- local header with title, support line, Give Kudos CTA, View All Kudos CTA
- homepage quick-submit entry point
- Celebrate reaction affordance

### Phase 6 — Dedicated Kudos Page + HR/Admin Moderation Workspace

Build the full Kudos destination:
- employee-facing: archive browsing, long-form submission, detail views, reactions, browse-by filters
- HR/admin: pending queue, review, approve, reject, pin/unpin, publication management

### Phase 7 — Band B — This Week

Build the compact weekly celebration layer:
- dense compact grid or horizontal rail
- compact celebration tiles
- 4–8 visible items
- lightest and most compact of the three regions

### Phase 8A — Responsive Behavior

Adapt the complete three-part composition to tablet and mobile:
- maintain locked hierarchy at all breakpoints
- Band A remains editorial
- Kudos remains more prominent than Band B
- Band B remains the lightest layer

### Phase 8B — Authoring / Loading / Empty / Partial-Data Hardening

Make the complete surface safe in real SharePoint authoring and imperfect data conditions:
- independent empty states per region
- independent loading states per region
- graceful partial-data handling (e.g., zero Kudos, zero announcements, zero celebrations)
- authoring-mode readability
- one-band and no-data states that feel intentional

### Phase 9 — CTA, Editorial Controls, and Final Refinement

Add the final polish layer:
- global CTAs (View All, Submit Announcement)
- Kudos CTAs (Give Kudos, View All Kudos)
- editorial control refinements
- final hierarchy and spacing polish

### Phase 10 — Packaging, Runtime Proof, and Production Hardening

Validate the completed feature:
- manifest correctness for the three-part webpart
- `.sppkg` validation
- SharePoint-hosted runtime proof
- complete surface rendering verification
- production readiness confirmation
