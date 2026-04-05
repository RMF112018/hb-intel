# Prompt 03 — Lane B Shell Experience Re-Authoring

## Objective

Redesign the shell extension so it behaves like a premium shell layer and no longer reads as technical placeholder scaffolding.

## Primary Scope

- `apps/hb-shell-extension`
- relevant shell extension styling and mount seams
- relevant `@hbc/ui-kit/app-shell` primitives
- shell boundary docs and doctrine

## Hard Instructions

- Do not reread files already in current context or memory.
- Do not keep the current top or bottom placeholder treatment unless it independently proves premium quality.
- The shell must help the homepage feel like one authored product.
- Empty shell regions must not leave behind visible technical residue.

## Required Work

1. Audit the current Lane B implementation and identify all placeholder-grade behaviors.
2. Rebuild the top placeholder as a **premium utility / signal layer** that may include:
   - utility actions
   - global support/help affordances
   - urgent alerts
   - a more intentional relationship to the homepage opening below
3. Rebuild the bottom placeholder as a **support / status / utility rail**, not a generic footer strip.
4. Create or promote shared shell primitives as needed in `@hbc/ui-kit/app-shell`.
5. Remove weak visual patterns such as:
   - raw text-abbreviation icons
   - flat strip styling
   - generic borders
   - under-authored spacing
6. Align the shell with the homepage horizontally and rhythmically so the transition into Lane A feels deliberate.
7. Ensure true non-render when a region has no meaningful content.

## Required Validation

- Provide before/after proof.
- Show the shell alongside the homepage opening to prove the system reads as one product.
- Confirm SharePoint placeholder realism and no unsupported chrome takeover.

## Deliverables

- Lane B implementation changes
- any shared shell primitive changes
- updated docs if shell posture or ownership changes
- closure note describing how the shell moved from technical scaffolding to authored product surface
