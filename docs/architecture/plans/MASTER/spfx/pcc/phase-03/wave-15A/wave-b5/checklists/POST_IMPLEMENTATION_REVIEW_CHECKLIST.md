# Post-Implementation Review Checklist

## Product behavior

- [ ] Default Project Readiness reads as a command center.
- [ ] Default card count is <= 12.
- [ ] Embedded modules are available through local drill-down controls.
- [ ] Selected detail mode is understandable and reversible.
- [ ] Source confidence and read-only boundaries remain visible.
- [ ] User is not faced with a default 62-card wall.

## Technical behavior

- [ ] Exactly one active-surface marker.
- [ ] All cards are direct bento children.
- [ ] No card nesting.
- [ ] Non-selected modules absent from DOM.
- [ ] Hooks are not conditional.
- [ ] Loading/error states do not render the module wall.
- [ ] Tests cover default and selected states.

## Evidence behavior

- [ ] DOM card summary shows reduced Project Readiness default count.
- [ ] Breakpoint evidence shows materially reduced height.
- [ ] No new false-affordance findings.
- [ ] No direct-child regressions.
- [ ] Evidence closeout records before/after impact.
