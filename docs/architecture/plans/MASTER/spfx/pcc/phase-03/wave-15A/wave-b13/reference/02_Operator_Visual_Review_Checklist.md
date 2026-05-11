# Phase 08 Operator Visual Review Checklist

Use this checklist after the implementation prompts and before accepting Phase 08 closeout.

## Command Center Feel

- [ ] PCC reads as a project command center, not a generic SharePoint dashboard.
- [ ] Header is visually dominant but not oversized.
- [ ] Project identity and active surface identity are clear.
- [ ] Surface-specific posture is visible.
- [ ] Source/no-writeback posture is visible without overwhelming the UI.

## Navigation and Module Access

- [ ] Top tabs are visually clear and premium.
- [ ] Active tab state is obvious without relying on color alone.
- [ ] Module launcher/dropdown feels intentional, not like a default menu.
- [ ] Disabled/deferred modules are visibly non-active and explain why.
- [ ] Keyboard navigation still works.

## Cards

- [ ] Cards have clear roles: action, analytics, source, gateway, exception, reference, selected module.
- [ ] First fold has a dominant priority area.
- [ ] Supporting cards are visually secondary.
- [ ] Cards do not all look equally important.
- [ ] Gateway actions are clear and truthful.
- [ ] No card only repeats the page/surface header.

## Analytics

- [ ] Analytics cards have insight/interpretation text.
- [ ] Charts do not carry meaning alone.
- [ ] Source/sample/preview labels are visible and calm.
- [ ] Chart visuals are not cramped.
- [ ] Reduced-motion behavior is respected.

## Host Fit and Responsiveness

- [ ] No horizontal clipping at standard laptop.
- [ ] No horizontal clipping at desktop.
- [ ] No horizontal clipping at ultrawide.
- [ ] Header content wraps cleanly.
- [ ] Module menu does not escape the PCC canvas in a harmful way.
- [ ] Cards stack/read well at compact breakpoints.

## Accessibility and Trust

- [ ] Focus states are visible.
- [ ] No clickable divs without keyboard behavior.
- [ ] Disabled controls expose reason copy.
- [ ] Status is not color-only.
- [ ] HBI/search language does not imply autonomous authority.
- [ ] Sage/Procore/SharePoint/Sage cues do not imply writeback.

## Evidence

- [ ] Screenshots exist for each surface.
- [ ] Contact sheet generated.
- [ ] Playwright evidence generated or blocked with reason.
- [ ] Component tests pass.
- [ ] Typecheck passes.
- [ ] Lockfile unchanged unless separately authorized.
