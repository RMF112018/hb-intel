# 02 — Checklist-Based Assessment

## 0. Doctrine preflight
### Passes
- Repo main was inspected directly.
- Governing checklist, scorecard, SPFx doctrine, homepage overlay, responsive catalog, shell breakpoint spec, and `WorkspacePageShell` contract were reviewed.
- Hosted screenshots were treated as real evidence.

### Fails
- The implementation does not visibly achieve a non-generic result.
- Dynamic stability is not explicitly governed at the app level.

---

## 1. Doctrine and host compliance
### Preserve
- The app does not fake Microsoft chrome.
- It is contained within a hosted page-canvas region.
- Webpart manifest and SPFx bridge exist and are adjacent/canonical.

### Directionally usable
- Simplified shell mode is a reasonable host-aware starting point for a domain SPFx app.

### Structurally wrong
- The shell composition is too raw for a premium hosted surface.
- `root-route.tsx` injects a manual button strip as navigation instead of using a governed navigation primitive.
- The visible result competes with SharePoint rather than harmonizing with it because the app presents as a heavy independent slab.

### Why it matters
Host-aware polish is not just “don’t fake the suite bar.” It is also about whether the app feels intentionally authored inside SharePoint. It currently does not.

### Correction direction
- Rebuild the simplified shell header for this app.
- Replace the custom raw button strip with a governed tab/segmented navigation component.
- Reduce visual shell takeover and better align the app to host-owned context.

### Work type
Structural redesign.

---

## 2. UI-kit doctrine and premium-stack compliance
### Preserve
- The app uses UI-kit primitives and shared providers instead of building everything ad hoc.

### Directionally usable
- `WorkspacePageShell` is at least present everywhere.

### Structurally wrong
- The pages use UI-kit too shallowly. They largely stop at shell/title level.
- No meaningful evidence appears in the Safety route layer of premium-stack usage expected for flagship surfaces where relevant.
- The dominant result still reads as generic enterprise UI.

### Why it matters
A flagship surface is not achieved by importing a provider and a few buttons. The surface has to materially use the system.

### Correction direction
- Use WPS deeply, not symbolically.
- Replace raw tables and manual nav with stronger governed primitives.
- Introduce governed icons, tooltips, overlays, and responsive list/detail patterns where warranted.

### Work type
Refinement plus structural redesign.

---

## 3. Token, styling, and primitive discipline
### Preserve
- There is not much outright visual clutter.
- Core spacing and typography are at least somewhat consistent.

### Structurally wrong
- Page files lean heavily on inline styles.
- Raw `<table>` structures are repeated across pages.
- Raw button strip navigation in `root-route.tsx` is not a mature primitive.
- Upload uses a hidden native file input and custom ad hoc file-selection row.
- Fixed stat grids (`repeat(4, 1fr)`) are hard-coded in detail pages with no responsive contract.

### Why it matters
This is exactly how a repo ends up with a surface that technically uses shared tooling but still behaves like hand-built scaffolding.

### Correction direction
- Extract Safety-specific workspace primitives where justified.
- Replace repeated inline layout patterns with governed/local reusable components.
- Move detail stat summaries and list tables onto governed responsive components.

### Work type
Structural redesign.

---

## 4. Purpose-fit and persona
### Preserve
- The workflow model itself is appropriate for Safety Record Keeping.
- Upload-first ingestion, review queue, inspections, and project-week reporting are coherent.

### Structurally wrong
- The visible tone does not communicate seriousness, trust, and command.
- The first view communicates “empty technical module” more than “safety operations workspace.”
- The current posture is closer to a temporary admin utility than a polished operational product.

### Why it matters
Safety workflows must feel authoritative and reliable. The current tone is provisional.

### Correction direction
- Add purpose-first page intros, status framing, and guidance.
- Recompose major views as workspaces with operational cues rather than blank canvases.

### Work type
Structural redesign.

---

## 5. Surface composition and hierarchy
### Preserve
- Titles are clear.
- Primary domains are logically separated.

### Structurally wrong
- The header/nav/title relationship is weak.
- Dashboard page does not have a true dashboard composition.
- List pages are broad tables inside a very large empty field.
- Detail pages jump directly from header to raw stat grid to raw list/table without a disciplined reading sequence.

### Why it matters
Flagship surfaces require a decisive focal order at zoomed-out viewing. Safety does not currently have one.

### Correction direction
- Each page needs a composed hierarchy: intro/status → actions/filters → primary workspace → subordinate content.
- Use negative space deliberately instead of allowing accidental emptiness.

### Work type
Structural redesign.

---

## 6. Homepage-specific integration quality
### Preserve
- The app is structurally a hosted SPFx surface rather than rogue shell duplication.

### Structurally wrong
- Even though Safety is a domain app, evaluating it by homepage-grade standards exposes that it still feels “dropped in a lane.”
- The header/nav/back-link/body relationship is visually underauthored.

### Why it matters
The user explicitly wants this held to the higher homepage-grade bar.

### Correction direction
- Make the top of the app feel like a purposeful product surface, not a utilitarian shell strip.
- Ensure the first screen delivers immediate value, not just title and emptiness.

### Work type
Structural redesign.

---

## 7. Breakpoint and shell-fit quality
### Preserve
- `DashboardLayout` and `ListLayout` in the UI kit do have responsive logic.

### Structurally wrong
- Safety largely bypasses those responsive benefits.
- Raw tables do not inherit card-stack behavior.
- Detail views use hardcoded four-column stats with no compact-state rules.
- No app-specific breakpoint contract is present in the Safety route/page layer.
- Memory-history routing plus simplified shell means compact state navigation clarity is also weak.

### Why it matters
The repo doctrine is explicit: breakpoint behavior must be deliberate, not accidental.

### Correction direction
- Define Safety-specific breakpoint modes.
- Replace raw tables with governed data/list components.
- Make detail-page summaries collapse to 2-column then 1-column grids.
- Explicitly define what compresses, stacks, hides, or overflows.

### Work type
Structural redesign.

---

## 8. Interaction completeness
### Preserve
- Core journeys exist in skeletal form.
- There is real retry logic in Review Queue.

### Structurally wrong
- Upload is not a guided ingestion workflow; it is a basic form.
- Review Queue does not provide a rich diagnostic/preview workflow.
- Dashboard drill-in is thin.
- Inspection detail is read-heavy and not operationally rich.
- Incidents is not real.
- Navigation itself lacks active-state clarity.

### Why it matters
A workflow app cannot be flagship if its core flows stop at “you can technically click through.”

### Correction direction
- Build richer preview, row-detail, and side-panel behaviors.
- Add action hierarchies and workflow guidance.
- Resolve the incidents path decisively.

### Work type
Structural redesign.

---

## 9. State-model completeness
### Preserve
- There are some banners and empty/no-data messages.

### Structurally wrong
- Pages often default to `[]` and render empty tables before loading resolves.
- `InspectionDetailPage` renders its own loading text instead of using WPS loading state.
- No-results and not-yet-loaded are visually conflated on several pages.
- Upload success/error logic is page-local and minimal.
- Incidents uses a polished empty-state primitive, but for the wrong reason: to present a future-wave placeholder.

### Why it matters
Operational trust breaks down when the UI cannot distinguish between “still loading,” “no data,” “no match,” “misconfigured,” and “future scope.”

### Correction direction
- Move page states into WPS props and richer page-level state models.
- Add distinct no-results, first-run, loading, empty, and error patterns.

### Work type
Structural redesign.

---

## 10. Data, contract, and backend discipline
### Preserve
- Feature package and repository model are strong.
- Ingestion state machine is explicit.
- Typed records and SharePoint topology are clear.

### Structurally wrong in visible UX terms
- The strong backend/data contract is not translated into strong UI states.
- Rich statuses from the ingestion model are reduced to very thin textual output.
- The UI does not capitalize on the domain rigor that already exists.

### Why it matters
The domain model is actually one of the strongest parts of the implementation. The UI is wasting that advantage.

### Correction direction
- Surface ingestion states as first-class status objects.
- Build better diagnostics, status chips, and guided next steps.
- Translate domain seriousness into visual seriousness.

### Work type
Refinement plus redesign.

---

## 11. Identity, media, and attribution quality
### Preserve
- Inspection detail at least shows project number, project name, inspector, and source workbook link.

### Structurally weak
- Attribution is minimal and visually flat.
- There is no richer ownership/context framing across most pages.
- No trust-building summary layer is present.

### Why it matters
Safety operations benefit from clear provenance, ownership, and recency cues.

### Correction direction
- Strengthen metadata presentation on detail and queue surfaces.
- Add “last run,” “uploaded by,” “review required because,” “period status,” and similar context patterns.

### Work type
Refinement.

---

## 12. Accessibility and keyboard behavior
### Preserve
- Some elements are semantically sound at a basic level.
- Buttons and links exist as real controls.

### Structurally weak
- Navigation buttons are visually tiny and not clearly active.
- Raw tables create poor compact-state usability.
- Fixed-grid summaries risk severe compression on smaller widths.
- Inline interaction clusters in rows are not strongly keyboard/spacing tuned.
- The visible future-wave incidents view is low-value and low-clarity.

### Why it matters
Accessibility is part of flagship acceptance, not a finishing pass.

### Correction direction
- Increase navigation target size.
- Use responsive list primitives.
- Ensure detail summaries and row actions remain touch-safe and keyboard-clear.
- Add robust focus-visible styling proof.

### Work type
Refinement plus redesign.

---

## 13. Host-runtime resilience
### Preserve
- The app packages as a real SPFx solution and has canonical entry files.
- It renders inside host context without obvious catastrophic failure.

### Structurally weak
- The current result is visually brittle because it depends on a large themed slab, raw tables, and sparse content.
- The acceptance footprint does not meaningfully validate hosted fidelity.
- Current tests do not prove that packaged output preserves a premium result.

### Why it matters
The doctrine explicitly says hosted validation is part of the product.

### Correction direction
- Add hosted screenshots and breakpoint evidence.
- Add tests for real navigation, active state, and core surfaces.
- Raise acceptance from “renders without error boundary” to real product validation.

### Work type
Refinement plus structural redesign.

---

## 14. Validation and closure
### Preserve
- There is at least a minimal E2E and router test footprint.

### Structurally weak
- Current validation does not test flagship requirements.
- No evidence of scorecard-grade closure exists.
- No hosted breakpoint matrix is being enforced for Safety.

### Correction direction
- Add explicit UI/UX acceptance coverage for the Safety app.
- Introduce screenshot-based and route-state assertions.
- Require proof against the governing scorecard, not just no-crash behavior.

### Work type
Refinement.

---

## 15. hbKudos benchmark acceptance traits
### Preserve
- Safety already has clearer runtime ownership seams than many ad hoc internal tools.

### Structurally weak
- It does not yet show equivalent product seriousness, interaction completeness, host-safe polish, or evidence-backed closure.
- It is nowhere near the benchmark class of discipline the scorecard expects.

### Correction direction
- Treat the next pass as a productization wave, not a minor styling pass.
