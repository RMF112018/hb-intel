# HB Homepage Shell Composition Audit — Summary

## Executive position

The current homepage shell is directionally strong and materially more advanced than an ordinary SPFx composition host.

It already includes real shell architecture:

- declarative presets
- occupant metadata
- schema validation
- container-aware pairing logic
- breakpoint-state policy
- protected versus configurable decision boundaries

That means the shell has moved past the earlier “thin stacked host” stage.

However, it is **not yet at the flagship end state** defined in the audit brief because three major problems remain:

1. the **entry stack is still split across separate authored webparts** rather than governed as one productized sequence
2. the shell’s **current default composition is still too conservative**
3. one major occupant family — **People & Culture Public** — still sits outside the same token/surface discipline as the strongest homepage modules

## Most important current truths

### 1. The shell now has real architecture
`hbHomepage` is no longer just a fixed JSX stack.

Repo truth shows a real shell contract layer with:

- `ShellLayoutInputSchema`
- `DEFAULT_PRESET`
- an approved preset library
- occupant capability metadata
- pairing restrictions
- breakpoint policy
- protected and configurable decision boundaries

This is the correct structural direction for future controlled layout governance.

### 2. The shell still does not own the full entry stack
The homepage experience is still composed through separate surfaces:

- `hbSignatureHero`
- `PriorityActionsRail`
- `hbHomepage`

So the shell governs the **post-hero operating layer**, but not yet the whole “brand + action + value” sequence as a single orchestrated object.

That is the biggest remaining structural gap relative to the breakpoint spec.

### 3. The current default preset is still too linear
The default preset keeps every active module in a single full-width sequential band:

1. Company Pulse
2. Leadership Message
3. Project Portfolio Spotlight
4. People & Culture Public
5. HB Kudos

This is safe, readable, and author-friendly.

It is not the strongest flagship composition.

It underuses the newer slot model and leaves too much hierarchy on the table.

### 4. The shell’s ultrawide ambition is ahead of its CSS reality
The breakpoint policy defines an ultrawide state beginning at `1600px`, but the shell CSS currently caps the shell at `1440px`.

That means the shell cannot actually realize the full ultrawide composition it claims to support. The result is dead or at least practically unreachable wide-state behavior.

### 5. The module maturity curve is now clearer
The strongest occupants are now clearly aligned to the benchmark posture:

- **Company Pulse**
- **Leadership Message**
- **Project Portfolio Spotlight**
- **HB Kudos**
- **Safety Field Excellence** (architecturally strong, but not yet active in the shell)

The main outlier is still:

- **People & Culture Public**

Its public surface remains self-contained, inline-style-heavy, and materially less governed than the benchmark families.

## Preserve-this strengths

- Real slot/preset/shell schema groundwork already exists
- `PriorityActionsRail` already has breakpoint-aware overflow and compact behavior
- `hbSignatureHero` is structurally separated and manifest-safe for full-width hero work
- Strong modules are thin consumers of shared `@hbc/ui-kit/homepage` surface families
- The shell has the beginnings of future control-panel boundaries in code, not just in prose

## Highest-priority gaps

1. **Unify the entry stack contract**
   - The hero, actions, and first lane need one governed orchestration contract.

2. **Fix the shell’s wide-canvas behavior**
   - The shell cannot claim premium ultrawide behavior while hard-capping itself below the ultrawide breakpoint floor.

3. **Promote a stronger first-lane model**
   - The default preset is too cautious for a flagship homepage.
   - The shell needs a better operational/editorial anchor band.

4. **Make the occupant capability model real**
   - Several capability fields exist but are not yet materially used to change layout behavior.

5. **Rebuild People & Culture Public to benchmark discipline**
   - It should either move onto a shared surface family or adopt the same token and variant rigor locally.

6. **Activate future-state readiness through persisted governance**
   - The shell has decision boundaries, but not yet the persisted layout/configuration seam that a future tenant maintainer would actually use.

## Recommended end-state hierarchy

### Entry stack
1. **Signature hero** — remains system-authored and independent
2. **Priority actions band** — governed, prioritized, overflow-aware
3. **First shell lane** — operational/editorial anchor band that begins on first load

### Post-hero shell model
- **Band 1:** Project Portfolio Spotlight + Company Pulse
- **Band 2:** Leadership Message
- **Band 3:** Safety Field Excellence once active
- **Band 4:** People & Culture Public
- **Band 5:** HB Kudos

This model keeps operations and timeliness high, preserves human/context content, and stops recognition from overpowering the page.

## Recommended delivery split

### Wave 01 — shell and entry-stack architecture
- unify entry-stack contract
- correct wide-state shell sizing
- promote a stronger first-lane preset
- implement real slot comfort and occupant-fit rules
- introduce persisted governance groundwork for a future control panel

### Wave 02 — module-fit and future-growth alignment
- rebuild People & Culture Public
- activate Safety Field Excellence in the shell
- expand preset library
- add preview/validation ergonomics for governed reconfiguration

## Final conclusion

The homepage shell is **structurally credible now**.

It is no longer “just a wrapper.”

But it is still short of the target standard because:
- the top-of-page entry sequence is not yet fully orchestrated
- the shell does not yet use its own architecture aggressively enough
- one major module family still lags the benchmark bar

The correct next move is **not a cosmetic pass**.

The correct next move is a **controlled shell-orchestration upgrade**, followed by **module-fit normalization**.
