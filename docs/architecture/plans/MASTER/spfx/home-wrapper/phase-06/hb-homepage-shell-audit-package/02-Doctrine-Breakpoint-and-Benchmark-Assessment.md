# 02 — Doctrine, Breakpoint, and Benchmark Assessment

## Governing doctrine alignment

### What is already strong

The codebase already reflects several correct architectural moves:

- Homepage work is routed through `@hbc/ui-kit/homepage` rather than generic root UI imports.
- The shell has explicit breakpoint governance and container-aware resolution.
- The governance model distinguishes protected decisions from future bounded configurability.
- The hero is treated as a canonical flagship surface rather than a generic banner.

### Where the current rendered result still falls short

#### A. The page does not yet deliver the required first-screen sequence
The doctrine and breakpoint spec require:

1. hero
2. actions
3. beginning of first shell lane

The current 14-inch baseline screenshot still reads more like:

1. branding
2. directory
3. homepage later

That is the central doctrine failure.

#### B. The utility layer is still not behaving like a priority-actions system
The doctrine explicitly rejects long equal-weight rows as the premium answer. The current live action row is still doing exactly that.

#### C. The shell is container-aware in code, but the overall homepage is not yet container-aware as one product surface
The shell can respond to container width. The separate action layer still uses its own device classification path, and the overall page is still partly governed by page authoring rather than one unified entry-state policy.

#### D. Empty states are not being compositionally governed
A flagship homepage cannot let low-signal empty states occupy early premium slots ahead of stronger content.

## Breakpoint-spec assessment

### 14-inch MacBook Pro baseline
This is the most important state because the spec treats it as the primary design baseline.

Current outcome:

- hero present
- action row present
- first meaningful shell value not early enough
- composition feels ceremonial before it feels useful

This is non-compliant with the intended “brand + action + value” rule.

### Tablet and handheld direction
The shell’s code is directionally good because it already forces first-lane single-column behavior under tablet and phone states. That part of the architecture should be preserved.

### Hero implementation quality
The canonical hero implementation is aesthetically strong, but its CSS and runtime do not yet read like a fully budgeted, breakpoint-spec-driven entry surface. It still needs explicit first-screen budget alignment with the action band and shell start.

### Action-band implementation quality
The dedicated `PriorityActionsRail` is the correct strategic direction, but the live screenshot still shows the OOB Quick Links row. Until the live page uses the governed rail, the breakpoint spec cannot be considered truly implemented.

## Benchmark-informed assessment

Public intranet and homepage guidance consistently reinforces the following principles:

- treat the homepage as prime real estate
- keep high-value content at the top
- avoid overloaded navigation or equal-weight clutter
- personalize and target content to reduce noise
- do not let large decorative hero treatments delay content on smaller screens
- keep mobile and constrained views clean, ordered, and scannable

The current HB page is directionally aligned in architecture, but not yet in rendered outcome.

## Benchmark conclusion

This is **not** a case where the product lacks a design language.
It is a case where:

- the composition is not yet enforcing the strongest parts of that language,
- the page is still letting legacy/OOB patterns define the user’s first task layer,
- and the shell is not yet promoting the most valuable content aggressively enough.
