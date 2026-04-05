# Prompt 03 — Redesign Tool Launcher / Work Hub

## Objective

Redesign `ToolLauncherWorkHub` so it becomes a real launcher/work-hub surface with premium destination affordances, real icon treatment, and stronger scan rhythm.

The final result must eliminate the current placeholder-grade launcher feeling while preserving the current grouping and configuration logic.

---

## First Instruction

**Do not re-read files that are still within your current context window or memory.** Re-read only when needed to verify drift, resolve uncertainty, or inspect files not already in active context.

---

## Required Starting Context

Use the repo truth as modified by Prompts 01–02.

At minimum, work from:

- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- any related files in `apps/hb-webparts/src/webparts/toolLauncherWorkHub/`
- `apps/hb-webparts/src/homepage/shared/HomepageRailShell.tsx`
- `apps/hb-webparts/src/homepage/shared/HomepageUtilityDenseGroup.tsx`
- `apps/hb-webparts/src/homepage/helpers/utilityConfig.ts`
- `apps/hb-webparts/src/homepage/webparts/utilityContracts.ts`
- `packages/ui-kit/src/homepage.ts`
- any shared icon/destination/launcher primitives available after Prompt 01

Inspect adjacent files as needed.

---

## Required Tasks

### 1. Remove pseudo-icon launcher behavior
Replace any remaining token-text pseudo-icons with real icon treatment at the correct seam.

The launcher must no longer feel like an unfinished placeholder system.

### 2. Convert destination presentation into real launcher affordances
Redesign the item presentation so destinations feel like launch targets, not inline links.

This may include:
- compact launcher tiles
- strong destination rows
- icon containers
- optional supporting metadata or status
- clearer directional affordance

Choose the strongest correct model based on repo truth and available width constraints.

### 3. Differentiate primary and secondary destinations where justified
Where grouping/content supports it, make the launcher easier to scan by distinguishing:
- the most important destinations
- routine supporting destinations
- category/group boundaries

Do not create a visually noisy or over-designed surface.

### 4. Improve group treatment
Group headings and group spacing should feel intentional and product-grade.

Do not leave the experience as a plain heading followed by links.

### 5. Preserve all existing behavior
Keep:
- config normalization
- active audience filtering
- loading states
- empty states
- author-safe defaults
- link behavior
- SPFx-safe rendering behavior

---

## Design Intent

The target is a launcher surface that feels:
- purposeful
- fast to scan
- product-like
- premium but restrained
- clearly more refined than a standard SharePoint list-of-links pattern

---

## Hard Constraints

- do not introduce shell chrome
- do not create lane-boundary violations
- do not invent backend-driven personalization logic that does not exist
- do not regress accessibility or reduced motion behavior
- do not add needless visual complexity

---

## Deliverables for This Prompt

By the end of this prompt, `ToolLauncherWorkHub` should be materially redesigned and clearly stronger than current repo truth.

---

## Acceptance Criteria

- launcher items no longer use pseudo-icon placeholders
- destination affordance is materially stronger than plain links
- group treatment and scan rhythm are clearly improved
- all functional behavior remains intact
- lint/build/type-check remain viable

---

## Completion Note

At the end, produce a concise completion note that states:

- which files were materially changed
- what launcher/destination pattern was adopted
- how icon treatment was corrected
- any follow-ons intentionally deferred
