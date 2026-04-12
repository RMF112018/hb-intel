# HB Kudos Repo-Truth Audit Report  
## Major findings package

## Objective

Conduct a repo-truth audit of the current HB Kudos implementation on the live `main` branch of:

- `https://github.com/RMF112018/hb-intel.git`

The objective of this report is to identify the major findings that still prevent HB Kudos from fully meeting the standard of a highly professional, production-grade, UI-kit-compliant React / SPFx implementation, and to convert those findings into a forceful prompt package for a local code agent.

## Audit scope reviewed

### Shared UI-kit layer
- `packages/ui-kit/DESIGN_SYSTEM.md`
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/HbcKudosComposer/`

### Public runtime
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedBody.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/*`

### Companion runtime
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

### Shared local governance layer
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/governance.module.css`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`

### Validation footprint
- `e2e/webparts/kudos/hosted/*.spec.ts`

## Executive judgment

HB Kudos is materially improved and directionally strong, but it is not yet fully closed. The implementation now has better runtime separation, better hook extraction, and meaningful hosted validation, but it still falls short of the repo’s own current UI-kit rules and still carries too much local styling and presentation ownership to be considered the reference-standard homepage webpart.

The implementation should not yet be treated as the final model for all future homepage webparts until the 10 findings below are resolved.

## Top 10 major findings

### Finding 1 — The shared UI-kit Kudos composer is not compliant with the current UI-kit authoring rules

The current design system guidance says UI-kit components should be token-driven and use Griffel `makeStyles`. The shared `HbcKudosComposer` implementation still uses a CSS module and a large amount of local hardcoded styling behavior. This is the deepest governance break because it sits inside the shared layer and affects both the public and companion flyout experiences.

**Impact**
- breaks declared UI-kit standards
- creates a “shared but non-standard” component family
- locks future consumers into a styling pattern the repo itself says not to use

### Finding 2 — The public runtime still owns too much bespoke presentation structure instead of consuming a tighter governed surface family

The public runtime is now thinner than before, but `PublicKudosSurface`, `ArchiveList`, local CSS modules, and runtime-specific presentation choices still own too much of the product’s visual grammar. The runtime is still behaving partly like a surface-design lab instead of a thin consumer of a shared homepage system.

**Impact**
- makes the public webpart harder to govern
- raises drift risk between public and companion surfaces
- weakens HB Kudos as a reusable reference pattern

### Finding 3 — Inline styles and injected style blocks still exist in critical public runtime paths

`KudosFeedBody` still carries a runtime-injected `<style>` block and multiple inline style objects. The public runtime shell also still carries style-object-based layout decisions. This bypasses the variant/module discipline the repo is trying to enforce.

**Impact**
- styling system inconsistency
- harder regression control
- worse maintainability and testing clarity

### Finding 4 — The companion runtime is still too large and mixes orchestration, rendering, filtering, dispatch, and dialog routing

`HbKudosCompanion.tsx` is still oversized and still carries too many responsibilities. Although the runtime ownership boundary is better, the companion remains too monolithic for long-term maintainability and future enhancement.

**Impact**
- high change-risk surface
- harder testing and reasoning
- harder role-governance and workflow extension

### Finding 5 — The governance primitive layer is only partially abstracted and still leans too heavily on inline style composition

`KudosGovernancePrimitives.tsx` improves reuse, but many primitives still compose their visual behavior through repeated style objects and local variable injection rather than a cleaner primitive-class/variant structure.

**Impact**
- partial abstraction rather than true systemization
- difficult to scale across future governance surfaces
- encourages continuing inline-style patterns

### Finding 6 — Accessibility compliance is not fully guaranteed

The design system requires strong keyboard accessibility, visible focus treatment, and minimum interaction target sizes. Multiple buttons, chips, and dense controls still look undersized relative to the published standards. The flyout shell also does not explicitly own trigger-focus restoration after close, even though tests expect it.

**Impact**
- standards gap
- potential WCAG / usability issues
- brittle keyboard-only behavior

### Finding 7 — Flyout shell behavior is not yet harmonized enough across composer, article reader, feed, and governance detail experiences

The shared flyout shell is reused, which is good, but the surrounding behavior remains inconsistent. Close behavior, trigger restoration, action-zone rhythm, and body layout semantics are not yet hardened into one uniform experience contract.

**Impact**
- UX inconsistency
- avoidable interaction drift
- more testing surface than necessary

### Finding 8 — Token, variant, CSS-variable, and style-ownership architecture is still fragmented

The product currently spans shared UI-kit tokens, local governance tokens, local intent aliases, local CSS custom properties, CSS modules, `cva` wrappers, inline style objects, and injected style blocks. That is too many styling layers for a feature that is supposed to become a model implementation.

**Impact**
- unclear styling source of truth
- too many places for drift
- slower future remediation

### Finding 9 — Hosted SharePoint regression coverage is meaningful but not yet model-grade complete

The repo already includes hosted overlap and keyboard/focus coverage, which is a strong start. However, model-grade closure still needs a fuller validation matrix across responsive breakpoints, safe-zone protection, visual regressions, companion workflows, and closure reporting.

**Impact**
- good foundation, incomplete closure
- higher chance of hosted regressions escaping
- weaker confidence for using Kudos as the template for future work

### Finding 10 — HB Kudos is not yet fully packaged as the model reference implementation for future homepage webparts

The user’s stated goal is for Kudos to become the model standard for future homepage webparts. It is not there yet because the implementation still needs final conformance cleanup, clearer closure criteria, and explicit documentation/governance that lock it as the benchmark.

**Impact**
- future teams may copy unresolved debt
- reference quality is not yet proven
- governance expectations remain too implicit

## Priority order

1. shared UI-kit composer conformance
2. public runtime shared-surface reduction
3. public runtime inline/injected style elimination
4. companion decomposition
5. governance primitive hardening
6. accessibility and focus compliance
7. flyout harmonization
8. token/variant/CSS architecture unification
9. hosted validation expansion
10. model-reference closure governance

## Remediation target state

HB Kudos should end this package in a state where:

- the shared layer follows the repo’s current UI-kit rules
- the public runtime is a thin consumer, not a style-heavy feature island
- the companion runtime is decomposed into cleaner workflow units
- governance primitives are genuinely reusable and low-inline-style
- accessibility and focus behavior are explicitly guaranteed
- flyout behavior is uniform and contract-driven
- styling ownership is rationalized
- hosted validation is expanded and trustworthy
- the feature can credibly serve as the model standard for future homepage webparts

## Prompt map

- Prompt 01 resolves Finding 1
- Prompt 02 resolves Finding 2
- Prompt 03 resolves Finding 3
- Prompt 04 resolves Finding 4
- Prompt 05 resolves Finding 5
- Prompt 06 resolves Finding 6
- Prompt 07 resolves Finding 7
- Prompt 08 resolves Finding 8
- Prompt 09 resolves Finding 9
- Prompt 10 resolves Finding 10
