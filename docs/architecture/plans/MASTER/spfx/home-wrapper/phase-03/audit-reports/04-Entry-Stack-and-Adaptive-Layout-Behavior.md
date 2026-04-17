# Entry-Stack and Adaptive Layout Behavior

## 1. Executive judgment

The current codebase is **good at post-hero shell adaptation** and **only partially good at whole-homepage entry-stack adaptation**.

That distinction matters.

The shell itself now has:
- breakpoint states
- single-column fallback logic
- pairing rules
- container measurement
- reduced-motion handling

But the **entry stack** is still physically split across separate webparts.

So the homepage does not yet fully behave like one governed “hero → actions → first lane” system.

## 2. Entry-stack reality today

### Current structural reality
- `HbSignatureHero` is its own surface
- `PriorityActionsRail` is its own surface
- `HbHomepage` owns only the post-hero operating layer

### Result
The codebase can produce a good entry stack in SharePoint authoring, but the shell does not yet guarantee it.

That is the core entry-stack gap.

## 3. Device-class assessment

### Ultrawide desktop
**Practical target:** 1600–2200 usable content width

**Current state**
- The shell policy defines an ultrawide state
- The shell CSS caps the shell at `1440px`

**Assessment**
- Hero/action/shell orchestration cannot fully exploit ultrawide width today
- The post-hero shell remains disciplined, but under-scaled for premium ultrawide composition

**Verdict**
- **Needs structural correction**

### Standard laptop / desktop
**Practical target:** ~1180–1400 usable width

**Current state**
- The shell is strongest here
- Paired band behavior can activate
- The `editorial-focus` preset can create a meaningful first lane
- Default preset still remains single-column and conservative

**Assessment**
- The architecture works
- The shipped hierarchy is still too cautious

**Verdict**
- **Architecturally good, compositionally underused**

### Tablet landscape large / medium
**Practical target:** ~980–1250 usable width

**Current state**
- The shell shifts toward single-column entry-band behavior
- Paired layout is effectively suppressed
- This matches the breakpoint spec well

**Assessment**
- Good fallback behavior
- Stable, safe, and readable

**Verdict**
- **Mostly compliant**

### Tablet portrait large / medium
**Practical target:** ~720–950 usable width

**Current state**
- Single-column behavior is correctly favored
- The shell avoids fragile side-by-side early compositions

**Assessment**
- This is one of the better-aligned device classes in the current shell
- The larger issue remains whether the hero/actions above it are also appropriately compressed

**Verdict**
- **Strong shell compliance; entry-stack compliance still depends on external surfaces**

### Phone portrait large / standard
**Practical target:** ~375–430 usable width

**Current state**
- Shell policy and CSS strongly favor single-column
- PriorityActionsRail already has compact behavior and overflow
- The shell itself is structurally safe here

**Assessment**
- Mobile shell fit is directionally correct
- Main risk is still whole-entry vertical density, not post-hero shell behavior

**Verdict**
- **Good shell behavior, partial full-entry governance**

### Phone landscape / short-height constrained
**Practical target:** short-height constrained state

**Current state**
- Shell policy explicitly recognizes height-constrained phone-landscape
- Single-column fallback remains safe

**Assessment**
- Good policy seam
- The real need is to connect this policy to the hero/action layer, not just the shell body

**Verdict**
- **Good architecture, incomplete whole-page closure**

## 4. Current shell strengths by adaptive behavior

- Container-aware rather than viewport-naive
- Pairing is conditional instead of automatic
- First-band pairing can be suppressed by entry-state policy
- Reduced motion is wired
- Single-column fallback is treated as intentional, not as failure

## 5. Current adaptive gaps

### A. Ultradwide state is not physically realized
The shell cannot fully enter the wide-state regime it defines.

### B. Comfort model is only partially real
The registry defines:
- `preferredWidth`
- `supportsCompact`
- `supportsSummaryCollapse`
- `prominenceCeiling`

But the current resolver mostly acts on:
- minimum width
- pairability
- narrowest stable paired width

That means the shell has metadata it is not yet using.

### C. Column grammar is still narrow
There is essentially one meaningful paired grammar:
- `3fr / 2fr`

This is a good starting point.
It is not a rich enough shell vocabulary for long-term homepage composition.

### D. Entry-stack orchestration remains external
The first shell lane can behave correctly, but the shell does not yet guarantee:
- hero height budget
- action visibility budget
- first-fold stack budget

Those rules still live across multiple surfaces and authoring decisions.

## 6. Does each application adapt correctly based on slot width?

### Company Pulse
Yes, credibly.
It is a good first-lane participant.

### Leadership Message
Yes, credibly.
It can operate as a secondary participant or full-width band.

### Project Portfolio Spotlight
Yes, and it is arguably under-promoted.
It should be treated as a first-lane-capable anchor.

### People & Culture Public
Adaptation is acceptable but not premium-benchmark-grade.
Its local surface grammar is less robust than the strongest occupants.

### HB Kudos
Yes.
It is the strongest participant from a productization standpoint.

### Safety Field Excellence
Architecturally yes, but it is not yet active in the shell.

## 7. Could current adaptive behavior later be exposed safely through a governed control panel?

### Yes, in part
Because the shell already has:
- preset IDs
- override structures
- protected vs configurable boundaries

### Not yet fully
Because it still lacks:
- persisted state
- preview/validation tooling
- richer footprint modes
- stronger occupant capability enforcement

## 8. Net verdict

The adaptive shell architecture is now credible.

The missing closure is:
- **full entry-stack governance**
- **real wide-state realization**
- **full exploitation of the occupant capability model**
