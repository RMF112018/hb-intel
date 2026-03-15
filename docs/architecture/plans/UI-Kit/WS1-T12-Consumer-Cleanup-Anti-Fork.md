# WS1-T12 — Consumer Cleanup and Anti-Fork Enforcement

> **Doc Classification:** Canonical Normative Plan — Workstream I task plan for consumer cleanup and anti-fork enforcement. Ensures that no Wave 1 consumer maintains a local visual system that substitutes for `@hbc/ui-kit` primitives, and that contribution rules prevent future forking.

**Workstream Reference:** Workstream I — UI Kit Production Scrub Plan
**Read With:** docs/architecture/plans/UI-Kit/WS1-UI-Kit-Production-Scrub-Plan.md
**Sequencing:** Phase E (after T08 and T09 complete; may proceed concurrently with T10 and T11)
**Depends On:** T01 (consumer map identifies which packages to audit); T07 (polished kit provides the migration target)
**Unlocks:** T13 (anti-fork compliance dimension of production scorecard)

---

## Objective

Audit all Wave 1-relevant apps and packages for locally duplicated or bypassed UI patterns that belong in `@hbc/ui-kit`. Migrate any reusable local presentational patterns into the kit. Enforce the narrowest-valid import model. Establish contribution rules that prevent future forking. Exit with `UI-Kit-Entry-Point-Compliance-Report.md` documenting the state of all consumers.

---

## Why This Task Exists

A production-ready UI kit is undermined if consuming packages quietly build local visual systems that substitute for or duplicate kit primitives. This happens for legitimate reasons — the kit was not ready, a specific pattern was not yet in the kit, a developer was under time pressure — but the result is:

- Visual inconsistency across surfaces
- Duplicated maintenance burden
- Kit improvements that do not propagate to forked consumers
- Wave 1 launch with surfaces that look different from each other despite sharing a design system

T12 audits for and eliminates this state before Wave 1 ships. It also establishes the contribution rules that prevent the problem from recurring.

---

## Scope

T12 covers:

1. Audit of all Wave 1-relevant apps and packages for locally duplicated visual patterns
2. Migration of reusable local presentational patterns into `@hbc/ui-kit`
3. Enforcement of narrowest-valid import usage (no internal path imports bypassing public entry points)
4. Contribution rules for new reusable visual components
5. `UI-Kit-Entry-Point-Compliance-Report.md`

T12 does not cover:

- Feature-local composition shells that are genuinely feature-specific and do not belong in the kit (these are acceptable and should not be migrated)
- Backend or data-layer packages that have no UI concerns
- Third-party UI libraries that are intentionally used alongside the kit

---

## Audit Scope

Using the T01 Wave 1 consumer map as the starting point, audit the following package categories:

**PWA app packages:**
- The main PWA application shell
- Personal Work Hub feature package
- Any other Wave 1-relevant PWA feature packages

**SPFx app packages:**
- All SPFx webpart packages that are on the Wave 1 critical path
- The SPFx app shell / root webpart if separate from individual feature webparts

**Shared platform packages:**
- Any shared platform packages that render UI and import from `@hbc/ui-kit`

---

## What to Look For

For each audited package, identify:

### Duplicated primitives

Visual components in the feature or app package that replicate a pattern that exists or should exist in `@hbc/ui-kit`:
- Status badges that replicate the kit's status badge
- Card layouts that replicate kit card patterns
- Table headers that replicate kit table header behavior
- Buttons, inputs, or form layouts that bypass the kit's form system
- Loading spinners or skeleton screens that are locally styled rather than using kit primitives

### Entry-point bypasses

Imports from internal `@hbc/ui-kit` paths that bypass the public entry points:
```
// Bypass — must not occur:
import { SomeComponent } from '@hbc/ui-kit/src/components/SomeComponent'

// Correct — narrowest valid import:
import { SomeComponent } from '@hbc/ui-kit'
```

### Local style overrides

CSS or styled-component overrides that modify `@hbc/ui-kit` component appearance at the consumer level:
- `!important` overrides on kit component classes
- Wrapper divs with local class names that change kit component appearance
- Inline style props that modify kit component visual properties

### Unused or redundant kit imports

Packages that import a `@hbc/ui-kit` component but immediately override its appearance so thoroughly that the import has no value — effectively forking the component locally.

---

## Migration Rules

When a locally duplicated pattern is found:

1. **If the pattern belongs in the kit:** Migrate it. If `@hbc/ui-kit` already has an equivalent (post-T07), replace the local version with the kit component. If the kit does not yet have an equivalent, add it to the kit (following contribution rules below) and replace the local version.

2. **If the pattern is genuinely feature-specific:** Document why it is not a kit concern and leave it in place. Feature-specific presentational logic is acceptable — the anti-fork rule applies to reusable visual primitives, not to feature-local compositions.

3. **If the pattern represents an unresolved gap in the kit:** Flag it in the compliance report as a kit debt item. If it is Wave 1-critical, escalate to T07 (if T07 is still open) or T13's residual debt register (if T07 is closed).

---

## Contribution Rules

Document the following rules in `UI-Kit-Usage-and-Composition-Guide.md` (T10) and enforce them as part of T12:

1. **New reusable visual components land in the kit first.** A presentational component that will be used in more than one feature package must be contributed to `@hbc/ui-kit` before being used in any feature package.

2. **Local visual components are acceptable only for genuinely feature-specific content.** A component that renders business-domain data in a way that is specific to one feature and has no reuse potential may live in the feature package.

3. **Entry-point imports are the only valid import path.** No feature package may import from an internal path within `@hbc/ui-kit`.

4. **Style overrides at the consumer level are prohibited for kit components.** If a kit component requires visual customization, that customization must be achieved through the component's official API (props, variants, theme tokens). If the API is insufficient, propose an API addition to the kit — do not override locally.

---

## Mandatory Output

### `UI-Kit-Entry-Point-Compliance-Report.md`

Location: `docs/reference/ui-kit/UI-Kit-Entry-Point-Compliance-Report.md`

Must include:

- Audit scope: packages reviewed
- Findings by package: duplicated primitives found, entry-point bypasses found, local style overrides found
- Migration actions taken: what was migrated to the kit
- Residual items: patterns left in place (with justification for each)
- Kit debt items: patterns that represent gaps in the kit (flagged for T13 residual debt register)
- Contribution rules: reference to the rules documented in `UI-Kit-Usage-and-Composition-Guide.md`

---

## Governing Constraints

- **Package boundary rule applies.** All reusable visual components must live in `@hbc/ui-kit`. T12 enforces this boundary; it does not establish a new one.
- **Migration must be tested.** When a local component is replaced with a kit component, the replacement must be verified to produce correct visual output in the consuming context. Do not migrate without confirming the result.
- **Do not over-migrate.** Feature-specific presentation logic is not a kit concern. The goal is to eliminate duplicated reusable primitives, not to move all UI code into the kit.

---

## Acceptance Criteria

- [ ] All Wave 1-relevant apps and packages are audited per the T01 consumer map
- [ ] All duplicated reusable visual primitives are either migrated to the kit or documented with justification for remaining local
- [ ] All entry-point bypass imports are resolved to public entry-point imports
- [ ] All local style overrides of kit components are resolved or documented
- [ ] Contribution rules are documented in `UI-Kit-Usage-and-Composition-Guide.md`
- [ ] `UI-Kit-Entry-Point-Compliance-Report.md` exists at the required location and is complete
- [ ] Reference document added to `current-state-map.md §2` as "Reference"
- [ ] T13 author confirms no Wave 1 consumer has unresolved anti-fork violations at workstream close

---

## Known Risks and Pitfalls

**Risk T12-R1: Migration breaking consumer behavior.** Replacing a local component with a kit component may produce subtle visual differences if the kit component's default behavior differs from the local implementation. Test each migration visually and functionally.

**Risk T12-R2: Scope creep from legitimate feature-local patterns.** Not every locally defined visual element is a fork. Do not attempt to migrate feature-local data presentation shells into the kit. Use the "reusable across more than one feature" test.

**Risk T12-R3: Entry-point bypass imports buried in barrel re-exports.** Some packages use internal barrel files that re-export from kit internal paths. Audit these carefully — an indirect bypass is still a bypass.

---

## Follow-On Consumers

- **T13:** Uses the compliance report to evaluate the "anti-fork enforcement" and "Wave 1 readiness" dimensions of the production-readiness scorecard

---

*End of WS1-T12 — Consumer Cleanup and Anti-Fork Enforcement v1.0 (2026-03-15)*
