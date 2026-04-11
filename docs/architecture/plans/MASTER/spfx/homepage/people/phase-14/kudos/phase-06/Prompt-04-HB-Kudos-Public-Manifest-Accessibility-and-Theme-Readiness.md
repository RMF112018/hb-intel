# Prompt-04 — HB Kudos Public Manifest, Accessibility, and Theme Readiness

```md
Objective

Perform the final readiness pass across manifest posture, theme/section-background handling, accessibility polish, and flyout/dialog behavior for the public HB Kudos webpart.

Primary problem

The public UI may still be carrying unresolved readiness questions around:
- `supportsThemeVariants`
- section background behavior
- focus treatment
- flyout/dialog interaction quality
- reduced-motion expectations
- other host/runtime best-practice obligations

This prompt is for closing or explicitly resolving those questions.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Focus on the public Kudos webpart and directly supporting public-surface UX/runtime layers.
- Remain evidence-based.
- Do not make performative changes solely to satisfy a checklist.
- If a current posture is retained rather than changed, document the rationale clearly.

Primary tasks

1. Audit the public Kudos manifest and determine whether the current theme-variant posture is still appropriate.
2. Make any final explicit decision around section background / theme-awareness support.
3. Audit public-surface focus visibility and keyboard resilience for:
   - archive actions
   - composer inputs
   - composer actions
   - close/cancel/submit flows
4. Review modal/flyout behavior for credible accessibility and usability.
5. Tighten reduced-motion behavior and any remaining high-value interaction polish.
6. Keep all changes governed and proportionate.

Required outcome

The public Kudos webpart should finish this pass with:
- an explicit and defensible manifest/theming posture
- strong visible focus treatment
- better keyboard/flyout confidence
- clearer accessibility readiness
- no shallow “checkbox compliance” changes

Required deliverables

- implementation changes
- a manifest/theming rationale note
- accessibility closure note
- explicit statement of anything intentionally left unchanged and why

Acceptance standard

This prompt is successful only if the public HB Kudos surface becomes more explicitly defensible as an SPFx-hosted, accessible, theme-aware-or-consciously-theme-limited production surface.
```
