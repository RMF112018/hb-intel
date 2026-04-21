# Prioritized Enhancement and Redesign Plan

## Enhancement 01 — Repair handheld runtime/CSS contract mismatch
- **Exact gap closed:** Gap 01
- **Implementation direction:** Align launcher-band handheld suppression selectors to the real emitted runtime device-class values.
- **Expected UI/UX impact:** Removes unintended shelf/padding on phone and reduces visual bloat.
- **Doctrine / checklist relevance:** Breakpoint quality, shell-fit, homepage integration
- **Cross-layer implications:** launcher band wrapper + CSS contract + hosted proof
- **Implement now vs later:** **Now**
- **Refinement vs redesign:** Refinement

## Enhancement 02 — Compress the phone launcher into a true fast-action seam
- **Exact gap closed:** Gap 02
- **Implementation direction:** Reduce handheld trigger height, band padding, and entry-stack spacing; keep a strong affordance without a tall hero-adjacent slab.
- **Expected UI/UX impact:** Better first-screen value, faster scan, less top-of-page vertical waste.
- **Doctrine / checklist relevance:** Hero/action/value first screen, mobile compactness, positive adaptation
- **Cross-layer implications:** entry-stack spacing + launcher CSS + overflow trigger layout
- **Implement now vs later:** **Now**
- **Refinement vs redesign:** Refinement

## Enhancement 03 — Split overflow strategy by display class
- **Exact gap closed:** Gap 03
- **Implementation direction:** Keep sheet on phone, allow tray / mega-panel / lower dock style overflow on wider display classes.
- **Expected UI/UX impact:** Desktop and tablet secondary-launch access feels lighter, faster, and more integrated.
- **Doctrine / checklist relevance:** Interaction completeness, host-fit, purposeful secondary surfaces
- **Cross-layer implications:** presentation resolution, ui-kit launcher family, tests
- **Implement now vs later:** **Now**
- **Refinement vs redesign:** Redesign

## Enhancement 04 — Restore grouped secondary IA in overflow
- **Exact gap closed:** Gap 04
- **Implementation direction:** Use the group metadata already preserved in the model; stop flattening all tools into one undifferentiated category.
- **Expected UI/UX impact:** Better scanability, clearer mental model, more credible company-tools experience.
- **Doctrine / checklist relevance:** hierarchy, interaction clarity, premium overflow behavior
- **Cross-layer implications:** adapter, overflow render model, drawer/tray layout
- **Implement now vs later:** **Now**
- **Refinement vs redesign:** Redesign

## Enhancement 05 — Rebuild the desktop/tablet launcher grammar
- **Exact gap closed:** Gaps 05 and 06
- **Implementation direction:** Move beyond equal-weight square cells; make the primary launcher visibly more intentional while keeping the strip compact and operationally credible.
- **Expected UI/UX impact:** The launcher finally reads as the homepage’s true launch surface.
- **Doctrine / checklist relevance:** purpose-fit, flagship quality, anti-generic posture
- **Cross-layer implications:** UI-kit launcher family and homepage integration
- **Implement now vs later:** **Now**
- **Refinement vs redesign:** Redesign

## Enhancement 06 — Re-baseline tests to the new product contract
- **Exact gap closed:** Gap 07
- **Implementation direction:** Update tests only after the product contract is redesigned.
- **Expected UI/UX impact:** Prevents regression back into the current underpowered posture.
- **Doctrine / checklist relevance:** closure rigor
- **Cross-layer implications:** test files and runtime diagnostics
- **Implement now vs later:** **After redesign**
- **Refinement vs redesign:** Refinement

## Enhancement 07 — Add hosted breakpoint proof as a closure gate
- **Exact gap closed:** Gap 08
- **Implementation direction:** Require evidence across the full breakpoint matrix, including DOM markers proving the deployed package matches the intended build.
- **Expected UI/UX impact:** Makes acceptance credible and reduces package drift confusion.
- **Doctrine / checklist relevance:** host-runtime resilience, validation and closure
- **Cross-layer implications:** build/package/test/QA
- **Implement now vs later:** **Now**
- **Refinement vs redesign:** Refinement
