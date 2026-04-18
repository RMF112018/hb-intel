# Findings Register

## P0 — The flagship homepage path is still a row/list product model
- **Priority:** P0
- **Affected existing package files:** `AUDIT-Executive-Summary.md`, `AUDIT-Findings-Register.md`, `PROMPT-01`, `PROMPT-02`, `PROMPT-03`
- **Related repo seams:** `PriorityActionsRail.tsx`, `HbcPriorityRailSurface.tsx`, `HbcPriorityRailAction.tsx`, `priority-rail.module.css`
- **Issue description:** The live rail is still fundamentally a grouped row/list system. The existing package pair identifies that, but does not yet break the remediation into precise enough units to ensure a true product-model redesign.
- **Why it matters:** This is the central blocker to a signature-grade outcome.
- **Stronger future-state coverage needed:** explicit flagship product-model decision, stronger section hierarchy, stronger action grammar, and behavioral lock-in
- **Required package action:** rewrite + split

## P0 — The attached package pair does not separate “preserve architecture” from “redesign surface grammar” clearly enough
- **Priority:** P0
- **Affected existing package files:** all audit and prompt files
- **Related repo seams:** `HbHomepageEntryStack.tsx`, `HbHomepageShell.tsx`, `hbHomepageWrapperConfig.ts`, `PriorityActionsRail.tsx`
- **Issue description:** The live architecture already contains correct wrapper/shell/data boundaries. The attached package pair is broadly aware of this, but does not use that preserve-vs-redesign split sharply enough.
- **Why it matters:** Weak separation creates unnecessary risk of accidental architectural churn.
- **Stronger future-state coverage needed:** explicit preserve list and redesign list in the package itself
- **Required package action:** rewrite

## P0 — The package underweights the application-level breakpoint seam
- **Priority:** P0
- **Affected existing package files:** `AUDIT-Current-Implementation-Map.md`, `PROMPT-05`
- **Related repo seams:** `priorityActionsPresentation.ts`
- **Issue description:** The live repo already centralizes device/presentation normalization and overflow decisions in a dedicated seam, but the package pair does not make this seam important enough.
- **Why it matters:** A flagship redesign can still fail if its compact and constrained states are weak.
- **Stronger future-state coverage needed:** dedicated responsive/container-driven prompt and stronger closure standards
- **Required package action:** expansion + split

## P1 — The package underweights the wrapper-owned entry-stack authority seam
- **Priority:** P1
- **Affected existing package files:** `AUDIT-Current-Implementation-Map.md`, `PROMPT-05`
- **Related repo seams:** `HbHomepageEntryStack.module.css`, `HbHomepageEntryStack.tsx`
- **Issue description:** The live repo already encodes width envelope and gutter logic for the entry-stack, including intentional top-band authority. The existing package pair hints at this but does not preserve it precisely enough.
- **Why it matters:** Future prompts should refine this seam, not casually replace or fight it.
- **Stronger future-state coverage needed:** explicit preserve language and tighter composition prompt
- **Required package action:** expansion

## P1 — The existing package lacks a dedicated closure unit for default-vs-flagship isolation
- **Priority:** P1
- **Affected existing package files:** `PROMPT-02`
- **Related repo seams:** `types.ts`, `variants.ts`, `HbcPriorityRailSurface.tsx`
- **Issue description:** The package pair wants a stronger flagship variant, but does not isolate the problem of maintaining generic/default/admin preview behavior while deepening the homepage flagship path.
- **Why it matters:** Without this, redesign work can either contaminate the default path or leave flagship behavior too timid.
- **Stronger future-state coverage needed:** dedicated prompt on shared contracts and flagship isolation
- **Required package action:** add prompt

## P1 — The package lacks a dedicated closure unit for action recognition grammar
- **Priority:** P1
- **Affected existing package files:** `PROMPT-03`
- **Related repo seams:** `HbcPriorityRailAction.tsx`, `HbcPriorityRailSurface.tsx`, `priority-rail.module.css`
- **Issue description:** Section hierarchy and action rendering are related but not identical problems. The current package pair merges them too much.
- **Why it matters:** A surface can group well and still fail as a launch surface if action anchors remain visually weak.
- **Stronger future-state coverage needed:** separate action-rendering / recognition prompt
- **Required package action:** split prompt

## P1 — The package does not push hard enough on behavioral lock-in tests
- **Priority:** P1
- **Affected existing package files:** `PROMPT-07`, `AUDIT-Validation-and-Closure-Standards.md`
- **Related repo seams:** `HbcPriorityRail.test.tsx`, `hbHomepageEntryStack.test.tsx`
- **Issue description:** The package pair asks for tests, but it does not define enough test intent to prevent regression into the old list-first grammar.
- **Why it matters:** Strong visual change without behaviorally meaningful tests is fragile.
- **Stronger future-state coverage needed:** wrapper boundary preservation, flagship structure assertions, compact-state assertions, overflow assertions
- **Required package action:** rewrite + add specificity

## P1 — Hosted SharePoint closure is still under-specified
- **Priority:** P1
- **Affected existing package files:** `PROMPT-Validation-and-Hosted-Closure.md`, `AUDIT-Validation-and-Closure-Standards.md`
- **Related repo seams:** manifest/package/build seams, hosted page validation
- **Issue description:** The attached pair correctly requires hosted validation, but still leaves too much implicit.
- **Why it matters:** Local render is not enough for SPFx flagship closure.
- **Stronger future-state coverage needed:** exact evidence expectations and no-deferral posture
- **Required package action:** rewrite

## P2 — Research findings need stronger translation into implementation
- **Priority:** P2
- **Affected existing package files:** `AUDIT-Research-Backed-UX-Findings.md`, `PROMPT-04`, `PROMPT-06`
- **Related repo seams:** overflow system, action targets, motion/focus states
- **Issue description:** The existing research file is sensible but generic. It does not tie directly enough to overflow semantics, target size, or reduced motion.
- **Why it matters:** Research should sharpen implementation decisions, not just decorate the audit.
- **Stronger future-state coverage needed:** semantics, target size, reduced motion, container-aware behavior
- **Required package action:** rewrite

## P2 — Screenshot-led assessment is over-weighted
- **Priority:** P2
- **Affected existing package files:** `AUDIT-Screenshot-Driven-Assessment.md`
- **Related repo seams:** all
- **Issue description:** The screenshot assessment is useful but should be supporting evidence, not one of the main evidentiary pillars.
- **Why it matters:** Repo-truth audits should lead with code seams and doctrine.
- **Stronger future-state coverage needed:** move screenshot evidence behind seam evidence
- **Required package action:** demote / absorb

## P3 — File naming and package map are good but can be clearer
- **Priority:** P3
- **Affected existing package files:** `README.md`, file structure
- **Related repo seams:** n/a
- **Issue description:** The attached pair already has better naming than some prior packages, but the combined package benefits from an even clearer preserve-vs-redesign structure.
- **Why it matters:** Better execution flow for the local code agent.
- **Stronger future-state coverage needed:** explicit package map, execution order, preserve list
- **Required package action:** refine
