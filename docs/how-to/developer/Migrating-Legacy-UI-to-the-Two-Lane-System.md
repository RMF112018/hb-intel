# Migrating Legacy UI to the Two-Lane System

## Purpose

Provide a practical migration guide for moving legacy HB Intel UI into the new two-lane shared UI model without destabilizing the repository.

This guide is for refactoring work where existing UI:

- mixes old wrappers and newer premium surfaces,
- uses local visual values that should become token-driven,
- places reusable UI in the wrong package,
- treats homepage/editorial content as generic application cards,
- or requires staged compatibility during shared UI rebuilds.

---

## Core migration rule

Prefer **staged migration with compatibility** over uncontrolled rewrite.

Use:

- adapters,
- wrappers,
- export shims,
- staged consumer adoption,
- incremental surface replacement.

Do not use migration difficulty as a reason to preserve weak patterns permanently.

---

## Step 1 — Classify the legacy UI

For each piece of legacy UI, decide what it really is:

- foundation concern
- primitive
- surface family
- consumer-local assembly
- migration adapter only

If the classification is unclear, do that work first before changing code.

---

## Step 2 — Identify the lane

Determine whether the legacy UI belongs to:

- the productive lane,
- the presentation lane,
- or a shared cross-lane primitive layer.

### Common legacy problem

Many old homepage and editorial modules are actually presentation-lane surfaces implemented with productive-lane assumptions.

Call that out directly instead of polishing the wrong model.

---

## Step 3 — Separate visual system problems from business logic problems

Do not mix these concerns during migration.

### Shared UI migration work should focus on

- tokens
- primitives
- surface ownership
- adapter strategy
- consumer usage cleanup

### Consumer-local work should focus on

- data flow
- business rules
- feature-specific orchestration
- route or webpart-specific behavior

---

## Step 4 — Introduce adapters when needed

Adapters are appropriate when:

- consumers cannot all be migrated at once,
- shared APIs are changing,
- a weak legacy surface needs a temporary bridge,
- existing imports must remain stable during rollout.

### Adapter rules

- adapters must be clearly temporary or clearly compatibility-oriented,
- adapters should not become the new permanent architecture,
- adapters should map old usage into the new layered system cleanly.

---

## Step 5 — Move hardcoded visual values inward

A common migration step is replacing local visual values with shared foundations.

### Typical examples

- local hex or HSL colors → semantic tokens
- local spacing → shared spacing scale
- local shadows → elevation system
- local typography sizes → shared type roles
- local motion timing → shared motion system

Do this before or alongside primitive and surface cleanup so the new system has real leverage.

---

## Step 6 — Rebuild reusable patterns at the right layer

### Move to primitives when

- the pattern is a building block
- multiple consumers repeat it
- both lanes may use it

### Move to surface families when

- the pattern is a recognizable section type
- multiple consumers or future consumers benefit from shared ownership
- the pattern is strategically important to the product experience

### Keep local when

- the assembly is tightly feature-bound
- reuse would be artificial or harmful

---

## Step 7 — Migrate consumers in waves

Do not try to migrate every consumer at once.

### Recommended wave shape

1. foundations and token cleanup
2. primitive rebuilds
3. new surface-family introduction
4. highest-value consumer migrations
5. legacy wrapper retirement
6. export cleanup and doctrine cleanup

This sequence lowers risk and makes visual regression easier to manage.

---

## Step 8 — Validate visually, not just technically

Migration success is not proven by compilation alone.

### Validate with

- affected stories or isolated renders
- real consumer screenshots
- before/after proof
- responsive checks
- adapter behavior checks
- packaging validation where relevant for SPFx

For homepage/editorial migrations, visual proof is mandatory in practice even if no automated visual system exists yet.

---

## Step 9 — Retire legacy patterns deliberately

After consumers move successfully:

- deprecate old wrappers,
- remove redundant exports,
- update docs,
- note replacement paths,
- avoid leaving multiple competing “official” solutions in place.

Migration is incomplete if the old weak pattern remains silently blessed.

---

## Common anti-patterns

Avoid:

- preserving legacy wrappers forever because they are widely used
- creating a second migration-only design system in local code
- trying to migrate foundations, primitives, consumers, and doctrine in one uncontrolled step
- treating presentation surfaces as merely decorated productive cards
- calling a local one-off premium CSS shell a reusable system

---

## Completion standard

A legacy UI migration is successful when:

- the layer placement is clearer,
- the lane placement is clearer,
- consumer code is less responsible for shared visual logic,
- compatibility was preserved where needed,
- the new system is stronger than the old one,
- doctrine, exports, and live usage are more aligned than before.
