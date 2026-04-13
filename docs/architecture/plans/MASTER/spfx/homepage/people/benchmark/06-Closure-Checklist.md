# 06 — Closure Checklist

Use this checklist before declaring any homepage webpart update complete.

## A. Doctrine compliance

- [ ] `UI-Doctrine-SPFx-Governing-Standard.md` was reviewed and applied.
- [ ] `UI-Doctrine-SPFx-Homepage-Overlay.md` was reviewed and applied.
- [ ] No material unresolved doctrine violations remain.
- [ ] The webpart respects homepage page-canvas ownership and host-aware behavior.

## B. Benchmark alignment

- [ ] The target webpart was compared directly against the Kudos public benchmark.
- [ ] The comparison was based on repo truth, not assumptions.
- [ ] A gap register was produced.
- [ ] All material gaps were either remediated or explicitly accepted as exceptions.

## C. Persona and design symmetry

- [ ] The target webpart’s intended persona was explicitly defined.
- [ ] The finished webpart expresses that persona credibly.
- [ ] The webpart maintains clear HB branding and design symmetry with the rest of `hb-webparts`.
- [ ] The final surface does **not** read as a cloned or renamed version of another homepage webpart.

## D. Architecture and seam quality

- [ ] Read seams are explicit and correct.
- [ ] Write seams are explicit and correct, if applicable.
- [ ] Source binding is canonical and not drift-prone.
- [ ] State management is deliberate and readable.
- [ ] Contract and mapping logic are explicit.

## E. UX completeness

- [ ] The primary surface is premium and purpose-fit.
- [ ] Loading state is credible.
- [ ] Empty state is credible.
- [ ] Error state is credible.
- [ ] Success state exists where applicable.
- [ ] Secondary/detail/flyout behavior is complete where applicable.
- [ ] No dead buttons, dead links, or deceptive controls remain.

## F. Identity / media / attribution

- [ ] Identity display is correct where applicable.
- [ ] Photo or media behavior is correct where applicable.
- [ ] Fallback behavior is deliberate.
- [ ] No unintended internal-only data is exposed publicly.

## G. Accessibility and host runtime

- [ ] Keyboard navigation is credible.
- [ ] Focus-visible behavior is present.
- [ ] Hover-only critical information is avoided.
- [ ] SharePoint host controls are accommodated.
- [ ] Relevant viewport / zoom conditions were validated.

## H. Validation evidence

- [ ] Hosted screenshots were captured.
- [ ] Runtime console behavior was reviewed.
- [ ] Material defects were logged.
- [ ] Closure evidence is stored with the effort.
- [ ] A conformance scorecard was completed.

## I. Final acceptance rule

- [ ] No conformance category scored below 2 without an explicit exception.
- [ ] Overall score meets the required threshold.
- [ ] Remaining issues are genuinely non-blocking.
- [ ] The webpart can credibly be described as homepage-grade.
- [ ] The webpart is benchmark-grade without becoming visually interchangeable with another homepage webpart.

## Final statement

Do not close a homepage webpart effort because the UI is improved.
Do not close it because it now resembles Kudos.
Close it only when doctrine compliance, implementation quality, runtime behavior, persona-fit execution, and validation evidence together show that it belongs in the same quality class as the Kudos public benchmark.
