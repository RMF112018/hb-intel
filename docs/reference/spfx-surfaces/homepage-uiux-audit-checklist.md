# Homepage UI/UX Audit Checklist

Use this checklist to audit homepage-facing SPFx applications in the repo against the governing UI doctrine, homepage overlay, benchmark material, and the current hbKudos public runtime as the most acceptable implementation benchmark.

## Governing doctrine references

Before scoring any homepage application, review the governing doctrine under:

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- the broader doctrine directory at `docs/reference/ui-kit/doctrine/`
- the supporting benchmark material at `docs/reference/spfx-surfaces/benchmark/`

This checklist is not a substitute for those files. It is a practical audit tool derived from them. Where the doctrine is more specific or stricter than this checklist, the doctrine governs.

## 0. Doctrine preflight

- [ ] The audit reviewed the governing doctrine files under `docs/reference/ui-kit/doctrine/` before assessing the webpart.
- [ ] The audit reviewed the benchmark material under `docs/reference/spfx-surfaces/benchmark/`.
- [ ] The audit treated the SPFx Governing Standard as binding.
- [ ] The audit treated the Homepage Overlay as binding for homepage work.
- [ ] The audit used the current live source tree as implementation truth rather than relying on older planning notes.
- [ ] The audit evaluated the packaged/hosted result where available, not just local source.
- [ ] The audit explicitly checked whether the application is achieving a visibly non-generic result.
- [ ] The audit explicitly checked whether the application is dynamically stable across realistic display conditions, not just “responsive enough.”

## 1. Doctrine and host compliance

- [ ] The webpart respects SharePoint host realities and does not create fake shell chrome or duplicate navigation.
- [ ] The webpart owns only its page-canvas region and behaves credibly in real SharePoint hosting conditions.
- [ ] The implementation follows homepage import discipline and uses `@hbc/ui-kit/homepage` as the primary governed entrypoint where appropriate.
- [ ] The surface does not resolve to a generic thin-border white-card enterprise outcome.
- [ ] Manifest placement intent is correct and aligned with actual rendered posture.
- [ ] The webpart does not rely on “it technically renders” as proof of compliance.
- [ ] Hosted behavior is treated as part of the product, not a later packaging concern.
- [ ] The webpart does not attempt to suppress, replace, or compete with SharePoint chrome it does not own.
- [ ] The webpart avoids shell duplication, decorative shell mimicry, and unnecessary chrome inside hosted content.
- [ ] The application behaves credibly in minimally configured, partially configured, and edit-mode states.

## 2. UI-kit doctrine and premium-stack compliance

- [ ] The implementation uses the approved premium stack where relevant and justified.
- [ ] `motion` is used deliberately for refined state changes where motion materially improves the surface.
- [ ] `lucide-react` or governed homepage icon exports are used instead of Unicode/pseudo-icons.
- [ ] `@floating-ui/react` is used for anchored overlays when overlays are part of the UX.
- [ ] `@radix-ui/react-slot` is used where composable shell patterns benefit from it.
- [ ] `@radix-ui/react-tooltip` is used where compact affordances need clarification.
- [ ] `@radix-ui/react-separator` is used where hierarchy/rhythm benefit from a governed separator primitive.
- [ ] `@radix-ui/react-scroll-area` is used where overflow deserves a polished treatment.
- [ ] `class-variance-authority` is used for serious variant systems rather than ad hoc conditional class logic.
- [ ] `clsx` or equivalent governed composition is used for readable class assembly.
- [ ] The approved stack is not merely installed symbolically; it is materially used where the doctrine expects it.
- [ ] The dominant premium visual language is not default Fluent with a light brand tint.
- [ ] Direct Fluent usage, when present, is justified and does not define the flagship visual posture.

## 3. Token, styling, and local-primitive discipline

- [ ] Shared semantic tokens are used by default.
- [ ] Homepage-specific aliases or overlays are used only where they materially support homepage quality.
- [ ] Ordinary source does not drift into raw hex/rgb values or hardcoded spacing without deliberate justification.
- [ ] Repeated UI patterns are governed through variants, shared classes, or local primitives.
- [ ] Local homepage primitives are introduced where useful and are not prematurely promoted to shared ui-kit territory.
- [ ] Styling is maintainable and composable rather than brittle and ad hoc.
- [ ] Surface-family logic matches the role of the application.
- [ ] Buttons, badges, rows, panels, and shells read as a coherent family.
- [ ] Shadow, border, gradient, tint, and material treatments are purposeful and role-appropriate.
- [ ] The styling system helps the webpart escape the default enterprise-card grid outcome.

## 4. Purpose-fit and persona

- [ ] The webpart’s intended purpose is explicitly defined.
- [ ] The surface tone fits that purpose instead of copying another webpart’s emotional model.
- [ ] The finished UI feels like the correct application for its content family.
- [ ] The application preserves HB brand family resemblance without becoming visually interchangeable with hbKudos.
- [ ] The default state communicates what the module is for within 3 to 5 seconds.
- [ ] The module feels productized, not simply restyled.
- [ ] The first view communicates clear value to the homepage.
- [ ] The application expresses the correct level of seriousness, energy, warmth, urgency, or editorial posture for its domain.
- [ ] The surface does not feel like a generic component shell with swapped copy.

## 5. Surface composition and hierarchy

- [ ] The application has one clear primary story or task in the first view.
- [ ] Visual hierarchy is decisive: headline, primary object, supporting content, and CTA are clearly ordered.
- [ ] Borders, shadows, backgrounds, and inset treatments support one coherent surface identity rather than nested-card clutter.
- [ ] The application uses width confidently and does not collapse into a timid centered rail.
- [ ] Supporting sections feel intentionally subordinate, not appended leftovers.
- [ ] Large-screen layouts feel authored, not merely stretched.
- [ ] Small-screen layouts feel selective, not merely compressed.
- [ ] The surface avoids dead space, timid hierarchy, and weak filler composition.
- [ ] The module reads as a flagship or serious supporting surface, depending on its intended role.
- [ ] Negative space is deliberate and compositional, not accidental emptiness.
- [ ] The surface has a clear focal sequence when viewed zoomed out.
- [ ] Asymmetric or wide compositions are used confidently where appropriate.
- [ ] The webpart does not settle for a polite small-card posture when its role calls for stronger authority.

## 6. Homepage-specific integration quality

- [ ] The webpart contributes positively to the entry-stack rhythm and does not feel buried.
- [ ] The webpart plays well with the homepage shell and adjacent modules.
- [ ] The application’s visual weight is appropriate relative to neighboring surfaces.
- [ ] The webpart reads as intentionally integrated into the homepage, not dropped into a lane.
- [ ] The shell fit is real: row-sharing only occurs when the actual slot width supports a premium nested experience.
- [ ] The application does not depend on ideal author section choices to rescue weak structural design.
- [ ] The first screen still delivers meaningful value beyond hero/branding layers.
- [ ] Zone-specific differentiation is present without breaking family resemblance.

## 7. Breakpoint and shell-fit quality

- [ ] The webpart defines explicit application-level breakpoint behavior.
- [ ] The webpart has a narrowest stable nested mode.
- [ ] The webpart is container-aware where nesting materially affects quality.
- [ ] Important content does not rely only on viewport-wide media queries when the surface is used inside homepage lanes.
- [ ] Multi-column behavior is conditional, not forced.
- [ ] At higher zoom or reduced usable space, the experience remains readable, tappable, and premium.
- [ ] The shell and the hosted application both behave well; one does not compensate for the other’s weakness.
- [ ] Compact states show less information where appropriate, not the same information in a tighter box.
- [ ] Reflow is stable under constrained width and constrained height.
- [ ] The surface remains credible across desktop, laptop, tablet landscape, tablet portrait, phone portrait, and short-height states.
- [ ] The application defines what content compresses, stacks, hides, collapses, or overflows in each mode.
- [ ] The application has explicit behavior for touch-first and handheld states.
- [ ] The webpart avoids accidental compression and forced multi-column fragility.
- [ ] Single-column fallback is treated as a valid success mode when required.

## 8. Interaction completeness

- [ ] The main surface supports the full user journey appropriate to its purpose, not just a shallow display layer.
- [ ] Primary actions are obvious and honest.
- [ ] There are no dead buttons, dead links, or deceptive affordances.
- [ ] Secondary and detail views exist where the content warrants them.
- [ ] Disclosure patterns are explicit, keyboard-safe, and touch-safe.
- [ ] Confirmation flows use real dialogs or panels, not lazy browser prompts.
- [ ] The module rewards deeper interaction with meaningful additional utility.
- [ ] CTAs are placed in the correct hierarchy and are not redundant.
- [ ] Hover is additive only; it is not the primary path to meaning or action.
- [ ] Overlays, readers, drawers, panels, or popovers use the correct semantic shell for the workflow.
- [ ] Compact affordances remain understandable without relying on guesswork.
- [ ] Interaction states feel premium and intentional, not default enterprise hover behavior.

## 9. State-model completeness

- [ ] Loading state is credible and visually intentional.
- [ ] Empty state is credible and explains what the webpart does.
- [ ] Error state is graceful and non-brittle.
- [ ] Success state exists where applicable.
- [ ] Dirty-state / unsaved-change handling exists where applicable.
- [ ] View-state transitions are deterministic and understandable from the code structure.
- [ ] Partial-configuration states are professional and author-safe.
- [ ] Missing or stale data does not collapse the experience into ambiguity.
- [ ] The surface handles stale/freshness communication appropriately where content is time-sensitive.
- [ ] State changes do not produce jarring layout instability.
- [ ] The application does not leak internal workflow complexity into user-facing states unless appropriate.

## 10. Data, contract, and backend discipline

- [ ] Data contracts are explicit and typed.
- [ ] Mapping logic is deliberate and testable rather than hidden inside render code.
- [ ] Read seams are canonical and clearly scoped.
- [ ] Write seams are canonical and clearly scoped, if applicable.
- [ ] Refresh and invalidation behavior is correct after mutations.
- [ ] Visibility predicates are explicit and explainable.
- [ ] No sloppy fallback path risks reading from or writing to the wrong target.
- [ ] Data shaping supports the UI and UX rather than forcing the UI to compensate for weak contracts.
- [ ] Ownership boundaries between runtime surfaces are clear.
- [ ] The code structure makes it clear which seam owns view logic, data logic, and mutation logic.

## 11. Identity, media, and attribution quality

- [ ] People, authorship, recipients, submitters, or owners are rendered correctly where applicable.
- [ ] Photo and media hydration logic is explicit and robust where applicable.
- [ ] Fallback behavior is intentional, not accidental.
- [ ] No internal-only metadata leaks into public-facing views.
- [ ] Media treatment supports the surface persona and hierarchy rather than acting as filler.
- [ ] Attribution strengthens trust and clarity without overloading the surface.
- [ ] Images, avatars, icons, and badges are role-appropriate and visually coherent.
- [ ] Alt text and media semantics are handled properly where relevant.

## 12. Accessibility and keyboard behavior

- [ ] Focus-visible states are present and consistent.
- [ ] Primary paths are keyboard reachable.
- [ ] No critical meaning depends on hover.
- [ ] Semantic buttons, headings, labels, regions, and ARIA relationships are used where appropriate.
- [ ] `prefers-reduced-motion` is respected where motion exists.
- [ ] Touch targets remain credible in compact states.
- [ ] Focus order is sensible in both default and expanded states.
- [ ] Reader and panel experiences are semantically correct for their workflows.
- [ ] Contrast meets doctrine requirements for text and interactive elements.
- [ ] The surface remains usable in touch-sized and constrained-height states.
- [ ] Primary actions remain reachable at common zoom levels.

## 13. Host-runtime resilience

- [ ] The surface behaves correctly in real SharePoint hosting, not just isolated local preview.
- [ ] Overlay collisions, fixed controls, iframe conditions, or safe-area issues are accounted for where relevant.
- [ ] The application survives common zoom conditions and constrained browser windows.
- [ ] Hosted validation is part of acceptance, not optional polish.
- [ ] Packaging truth matches source intent. For the flagship hero + entry stack, record across the audited seven-breakpoint matrix in [`homepage-hosted-breakpoint-evidence.md`](./homepage-hosted-breakpoint-evidence.md).
- [ ] The rendered SharePoint-hosted result preserves the intended structural and visual upgrade.
- [ ] The application does not rely on brittle DOM assumptions about the host.
- [ ] Critical controls are not hidden by host chrome, sticky assistants, or edge overlays.

## 14. Validation and closure

- [ ] Repo-truth comparison against hbKudos was performed before acceptance.
- [ ] A gap register was produced.
- [ ] Material gaps were either remediated or explicitly accepted as exceptions.
- [ ] Hosted screenshots were captured.
- [ ] Console and runtime behavior were reviewed.
- [ ] Closure evidence is stored with the effort. For the flagship hero, use the evidence appendix at [`homepage-uiux-audit-evidence.md`](./homepage-uiux-audit-evidence.md).
- [ ] The application can credibly be described as homepage-grade.
- [ ] The application is benchmark-grade without becoming a renamed clone of hbKudos.
- [ ] Breakpoint behavior was validated as a design artifact, not treated as implicit.
- [ ] The audit includes explicit notes on what should be preserved, refined, or structurally rebuilt.

## 15. hbKudos benchmark acceptance traits

Use these as benchmark characteristics, not cloning instructions.

- [ ] The application is a thin-shell orchestrator rather than a logic sink.
- [ ] The user journey is complete enough for the module’s purpose.
- [ ] The styling system is governed through tokens, modules, and variants.
- [ ] Detail views, overlays, and secondary surfaces are purpose-built.
- [ ] Accessibility and host-safe behavior are treated as first-class concerns.
- [ ] Runtime ownership seams are clear.
- [ ] The application expresses the right persona for its domain while still meeting the doctrine bar.
- [ ] The implementation demonstrates evidence-backed closure rather than aspirational polish only.
