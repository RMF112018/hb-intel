# Prompt 06 — Integrated Flagship Acceptance Proof

## Objective

Extend the existing shell policy/conformance proof surface into a **repeatable flagship acceptance package** that certifies the real Wave 01 outcome across the complete entry stack.

This prompt is not about inventing testing from zero. It is about closing the remaining integrated proof gap.

## Why this prompt exists now

Repo truth already shows:
- entry-stack policy tests exist
- shell conformance tests exist

What is still missing is a tight, repeatable acceptance proof package that certifies the flagship homepage experience after the Wave 01 work is complete.

## Repo-truth findings to respect

- shell policy tests already encode hero budgets, action budgets, and protected rules
- shell conformance tests already encode entry-state/layout reasoning
- those tests alone do not certify the final entry-stack experience or flagship page cutover

## Governing authorities

- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- existing shell entry-stack / conformance tests
- any available harness utilities already used by homepage work

## External best-practice guidance to apply

- include constrained reflow states as explicit acceptance cases
- include stability considerations, not just static screenshot appearance
- include interaction responsiveness where the action layer has real affordances
- prefer inspectable evidence plus visual evidence, not one or the other alone

## Required viewport / state cases

At minimum certify all of the following:

1. standard laptop baseline approximating the practical 14-inch MacBook Pro shell target
2. tablet portrait
3. phone portrait
4. short-height constrained phone-landscape style state

## Required assertions

At minimum prove all of the following:

1. the hero remains premium and visible
2. the governed action layer is visible and active
3. the first meaningful shell lane begins on first load at the standard laptop baseline
4. portrait and phone states remain disciplined single-column states
5. protected shell rules are not violated
6. the flagship page no longer depends on the OOB Quick Links row
7. early-lane empty / invalid / low-signal candidates no longer dominate when a stronger legal candidate exists

## Exact files / seams to inspect first

- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/entryStackPolicy.test.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellConformance.test.ts`
- any homepage harness utilities under `apps/hb-webparts/src/homepage/` or `apps/hb-webparts/src/webparts/hbHomepage/`
- any screenshot / visual / viewport test utilities already in repo truth
- any touched docs that need closure-truth updates

Do **not** re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required implementation outcome

Build a repeatable acceptance package that produces:

- inspectable assertions
- runnable instructions
- generated proof artifacts or clearly described evidence outputs
- a clean pass/fail definition for Wave 01 closure

If existing tests are sufficient in one area, extend them rather than duplicating them.

## Definition of done

This prompt is done only when:

- there is a repeatable way to certify the flagship homepage against the required Wave 01 states
- the proof includes both logic-level and rendered/inspectable evidence where appropriate
- the proof explicitly covers the required viewport/state matrix
- any touched docs now reflect final repo truth

## Proof of closure required in the final response

Provide all of the following:

- exact tests / harness files changed
- how to run the proof
- what artifacts or outputs are produced
- explicit pass/fail criteria
- proof that the flagship page cutover, entry-stack budget, rail alignment, and non-empty-first behavior are all covered
- any touched docs updated and why

## Constraints

- Do not add a disconnected test suite that ignores existing shell proof surfaces.
- Do not rely on screenshots alone where inspectable assertions are possible.
- Do not declare acceptance without covering all required states.
- Do not leave touched docs knowingly stale.
