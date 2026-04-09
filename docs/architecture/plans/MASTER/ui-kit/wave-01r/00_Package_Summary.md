# UI System Audit Closure — Package Summary

## Objective

This package converts the audit report’s recommended next actions into a comprehensive execution set for closure.

Source of truth:

- `docs/architecture/reviews/UI-System-Audit-Validation-Report.md`

The report concluded that the UI-system refactor is architecturally real and mostly conforming, but still open on:

1. visual proof artifacts,
2. build / packaging evidence,
3. shell-layout constant migration,
4. deprecated alias retirement planning,
5. PeopleCulture naming / authority ambiguity,
6. oversized main-barrel exports,
7. packaging-matrix traceability back to runtime mount mapping.

---

## What each prompt closes

### Prompt 01 — Capture Visual Proof
Closes the gap around presentation-lane proof quality by creating concrete consumer-tied visual evidence for the named migrated homepage consumers.

### Prompt 02 — Commit Build Evidence
Closes the gap around packaging/build proof by capturing clean SPFx build evidence and documenting it in-repo.

### Prompt 03 — Migrate Shell-Layout Constants
Closes the architectural cleanup gap where shell-layout constants still live in `theme/tokens.ts` instead of the app-shell boundary.

### Prompt 04 — Complete Deprecated Alias Retirement Plan
Closes the planning gap around the 13 deprecated aliases by producing an exact inventory, consumer impact map, migration gates, and wave-02 retirement plan.

### Prompt 05 — Resolve PeopleCulture Naming and Authority
Closes the ambiguity between `PeopleCulture.tsx` and `PeopleCultureMerged.tsx` by establishing a single authoritative production surface and cleaning up confusing duplicate authority.

### Prompt 06 — Begin Main-Barrel Reduction
Closes the first reduction wave for the oversized `@hbc/ui-kit` main barrel by migrating safe consumers to subpath imports and shrinking transitional exports where safe.

### Prompt 07 — Cross-Reference Mount Mapping and Packaging Proof
Closes the documentation traceability gap by tying runtime webpart GUID mappings directly to packaging verification evidence.

---

## Named consumer focus

The following consumer surfaces remain especially important throughout this package:

Shared-surface consumers:
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx`
- `apps/hb-webparts/src/webparts/leadershipMessage/LeadershipMessage.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx`
- `apps/hb-webparts/src/webparts/smartSearchWayfinding/SmartSearchWayfinding.tsx`

Intentionally-local premium consumers:
- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`

Authority / ambiguity cleanup target:
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCulture.tsx`
- `apps/hb-webparts/src/webparts/peopleCulture/PeopleCultureMerged.tsx`

---

## Expected closure outputs

At the end of this package, the repository should contain:

- a visual-proof evidence set for named homepage consumers,
- a committed build-evidence artifact or log set,
- updated packaging traceability docs,
- migrated shell-layout constants at the proper app-shell boundary,
- a resolved PeopleCulture authority model,
- a reduced main barrel with named migrated consumers,
- a formal deprecated-alias retirement plan with exact consumer impact.

---

## Guardrails

- Preserve the current two-lane / four-layer doctrine.
- Do not collapse intentionally local premium consumers into generic shared surfaces unless repo truth clearly supports that move.
- Do not claim closure based only on typecheck or documentation edits where artifact-level proof is required.
- Name real consumers and affected entry points in every completion note.
