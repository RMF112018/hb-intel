# Homepage Launcher Audit Summary

## Verdict

The current homepage launcher is **directionally improved but not homepage-grade and not flagship-grade**.

**Score:** **31/56**

Threshold result:

- **Below** the 40/56 homepage-grade threshold
- **Well below** the 48/56 flagship / benchmark-grade threshold
- Multiple hard-stop concerns remain even apart from the numeric score

## Bottom line

The implementation is strongest in **architecture, stack choice, data seams, and breakpoint intent**.

It is weakest in **productized hierarchy, overflow strategy, handheld execution, and hosted closure proof**.

The most important conclusion is this:

> The launcher is no longer a broken strip of generic buttons, but it still does **not** behave or read like a world-class homepage launch surface.

## Highest-priority findings

1. **Handheld launcher posture is still wrong.**  
   The current phone experience is dominated by an oversized single-entry `HB Toolbox` / `More tools` treatment. Even where the code intends a leaner handheld posture, the rendered result remains visually tall and too dominant for the first mobile screen.

2. **There is a concrete runtime/CSS mismatch contributing to the phone problem.**  
   `HbHomepageLauncherBand.module.css` tries to suppress the launcher shelf for `phone-portrait` and `phone-landscape`, but the runtime `deviceClass` emitted by `HbHomepageLauncherBand.tsx` is `phone`, not either of those strings. That means the shelf-suppression branch never activates for ordinary phone portrait runtime.

3. **Overflow strategy is overcommitted to a bottom sheet.**  
   The codebase currently hard-locks a sheet-based overflow posture across display classes. That is acceptable on mobile, but it is too heavy-handed on desktop and most tablet conditions.

4. **The launcher still reads as a strip of equal-weight tools.**  
   The hard-coded priority order is useful, but the rendered product still does not explain why the visible tools are the visible tools, and it does not create enough distinction between:
   - primary frequent destinations
   - secondary tools
   - overflow-only tools
   - grouped company systems

5. **Drawer IA is flattened.**  
   Group metadata is preserved in the model, but the `Company Tools` sheet intentionally collapses everything into one category. That hurts scanability and weakens confidence under load.

6. **Hosted truth is not fully stable.**  
   The screenshot set shows more than one handheld launcher posture, which does not line up cleanly with the current locked phone rule in source. That strongly suggests package/runtime drift or incomplete closure validation.

## Hard-stop failures

- Breakpoint behavior that technically renders but becomes low-value on phone
- Overflow interaction pattern that is over-applied across display classes
- Dominant posture still reading as a generic action strip instead of a flagship surface
- Hosted/package truth not yet sufficiently proven stable

## Recommended immediate sequence

1. **Wave 01:** Fix handheld root causes and reduce mobile band height decisively
2. **Wave 02:** Rebuild overflow posture and secondary launcher IA
3. **Wave 03:** Productize hierarchy, grouping, and hosted proof discipline

## Strengths worth preserving

- Container-aware shell and entry-state architecture
- Separation between data, normalization, adapter, and presentation seams
- Governed icon strategy
- Good empty/loading/error handling
- Reasonable keyboard and reduced-motion posture
- Inspectable runtime diagnostics and package-version markers
