# Prompt 06 — QA, Rendered Validation, and SPPKG Rebuild

## Objective

Validate the structural rebuild in actual rendered SharePoint output, then rebuild the deployable package.

## Required Validation Checklist

### A. Webpart structure and manifest validation
- verify each homepage webpart still has the appropriate manifest
- verify the signature hero banner manifest includes:
  - `"supportsFullBleed": true,`

### B. Rendered validation
Capture screenshots proving:
- the hero is full-width capable and authored like a flagship surface
- the greeting is integrated into the hero experience
- the command surfaces feel materially stronger
- the launcher and discovery surfaces use real icons and stronger interaction
- editorial and operational surfaces are visibly differentiated

### C. Stack validation
Confirm the adopted stack is actually used in the rebuilt webparts and primitives:
- `motion`
- `lucide-react`
- `@floating-ui/react`
- `@radix-ui/react-slot`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
- `class-variance-authority`
- `clsx`

### D. Package rebuild
Perform a clean rebuild and generate the updated `.sppkg`.

## Hard Gates

Do not mark this complete if:
- the hero still reads as a large blue slab
- the greeting still reads as a separate surface
- launcher or discovery still use Unicode icons
- the page still reads as Fluent-adjacent card wrappers
- the screenshot difference is only subtle

## Required Output

Produce:
- completion note
- manifest validation summary
- dependency usage summary
- before/after screenshot set
- packaging summary
