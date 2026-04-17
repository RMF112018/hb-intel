# HB Homepage Shell Entry Breakpoint Spec

## Purpose

This spec defines the recommended **entry-state behavior** for the HB homepage shell across major device classes.

The entry stack remains:

1. **Flagship hero** (`hbSignatureHero`-style top band)
2. **Top actions / utility band** (currently SharePoint quick links, later governed by shell rules)
3. **First shell lane** (the first real hosted shell content)

The goal is to preserve the strengths of the current setup while improving:

- first-screen value density
- action clarity
- shell-content visibility above the fold
- hosted-surface fit inside the shell
- controlled degradation across narrower and shorter screens

---

## Governing entry-state rules

### Rule 01 — First screen must deliver brand + action + value
Every target state should show:

- the full hero message,
- at least the primary actions,
- and the beginning of the first shell lane.

The first shell lane must not feel buried beneath the hero and utilities.

### Rule 02 — The hero is not the homepage
The hero is a flagship brand and welcome surface, but it must not consume so much vertical space that the user cannot see meaningful shell content on first load.

### Rule 03 — Quick links become prioritized actions
The utility band should be treated as a **priority actions system**, not a flat directory of equal-weight destinations.

Recommended pattern:

- show the highest-frequency actions first,
- limit visible actions by breakpoint,
- send lower-priority tools into a governed `More tools` affordance.

### Rule 04 — The shell must be container-aware
Hosted surfaces should not be placed side-by-side simply because the viewport is technically wide enough. They should only share a row when the **actual slot width** supports a premium, stable nested layout.

### Rule 05 — Single-column fallback is not failure
Tablet portrait and all handheld states should prefer a disciplined single-column shell entry sequence rather than forcing compressed multi-column compositions.

### Rule 06 — Reflow safety is mandatory
The entry stack should not require awkward two-dimensional scrolling, and critical actions must remain reachable at higher zoom or in constrained width states.

---

## Resolution and design-target notes

### Important note on "resolution"
This spec lists both:

- **device/display resolution** — the physical pixel resolution of the screen, and
- **practical shell design target** — the layout condition you should actually design for in the browser after SharePoint chrome, browser chrome, zoom, and safe-area constraints reduce usable space.

For implementation, the **practical shell design target** matters more than the raw hardware resolution.

---

## Breakpoint matrix

| Display Type | Example Device / Context | Typical Device Resolution | Practical Shell Design Target | Entry Model |
|---|---|---:|---:|---|
| Ultrawide desktop | External monitor | 3440×1440, 3840×1600, 5120×1440 | 1600–2200 px usable content width | Premium wide composition |
| Standard laptop / desktop | 14-inch MacBook Pro class | 3024×1964 native on 14-inch MacBook Pro | ~1180–1400 px usable shell width depending on browser + SharePoint chrome | Compressed flagship desktop |
| Tablet landscape large | iPad Pro 13-inch landscape | 2752×2064 | ~1100–1250 px usable width | Simplified desktop-like |
| Tablet landscape medium | iPad Pro 11-inch landscape | 2420×1668 | ~980–1120 px usable width | Tablet landscape guided layout |
| Tablet portrait large | iPad Pro 13-inch portrait | 2752×2064 | ~820–950 px usable width | Guided single-column entry |
| Tablet portrait medium | iPad Pro 11-inch portrait | 2420×1668 | ~720–850 px usable width | Large-mobile style entry |
| Phone portrait large | iPhone 17 Pro Max | 2868×1320 | ~390–430 px CSS-class usable width | Immediate mobile entry |
| Phone portrait standard | iPhone 17 Pro | 2622×1206 | ~375–410 px CSS-class usable width | Immediate mobile entry |
| Phone landscape | iPhone Pro / Pro Max landscape | device-dependent | short-height constrained state | Compact banner + fast actions |

---

## 1) Ultrawide desktop / large external display

### Typical display conditions

- **Common monitor tiers:** 3440×1440, 3840×1600, 5120×1440
- **Practical shell target:** 1600–2200 px usable content width

### Recommended shell-entry behavior

- Hero height: **420–460 px**
- Hero remains visually premium and wide
- Keep left-weighted greeting/tagline and right-weighted brand lockup
- Quick actions: **6 visible primary actions max**
- Lower-priority tools move into `More tools`
- First shell lane should be fully visible without scrolling
- Two hosted shell surfaces may share the first row **only if both remain compositionally stable**

### Spacing guidance

- Hero → actions gap: **24 px**
- Actions → first shell lane gap: **28–32 px**

### What success looks like

- The page feels premium, not sparse
- The first shell lane reads as part of the first-view experience
- Extra width produces stronger composition, not dead canvas

### Avoid

- Expanding hero height just because there is extra width
- Turning quick actions into a long flat directory
- Leaving excessive dead space before real shell content begins

---

## 2) Standard laptop / 14-inch MacBook Pro class

### Typical display conditions

- **Example hardware:** 14-inch MacBook Pro
- **Native resolution:** 3024×1964
- **Practical shell target:** ~1180–1400 px usable shell width in a fully expanded browser with SharePoint chrome
- This is the recommended **primary baseline** for the shell entry design

### Recommended shell-entry behavior

- Hero height: **340–380 px**
- Quick actions: **5 visible primary actions max**
- Lower-priority actions go into `More tools`
- Reduce vertical gap below actions so shell content begins sooner
- The first shell lane should show at least the **top third to half** of its content above the fold
- If the first lane is two-column, the left surface should visually dominate and the right should remain clearly secondary

### What success looks like

- The first screen shows hero, actions, and meaningful shell content
- The page feels efficient rather than ceremonial
- The hero still feels premium without consuming most of the decision screen

### Avoid

- Eight equal-weight app tiles visible at once
- A hero so tall that the real homepage only starts at the bottom edge
- Loose spacing that delays the first shell lane

---

## 3) Tablet landscape — iPad Pro 13-inch and 11-inch

### Typical display conditions

#### iPad Pro 13-inch
- **Device resolution:** 2752×2064
- **Practical shell target:** ~1100–1250 px usable width in landscape

#### iPad Pro 11-inch
- **Device resolution:** 2420×1668
- **Practical shell target:** ~980–1120 px usable width in landscape

### Recommended shell-entry behavior

- Hero height: **280–320 px**
- Quick actions: **4–6 visible primary actions max**
- Utility band can be either:
  - a single horizontal row with snap/scroll, or
  - a compact **2×3** actions grid
- The first shell lane should still begin on first load
- Only **one hosted surface should dominate** unless two-column nesting remains visually stable
- Stack hosted surfaces if side-by-side nesting creates fragile density or uneven height behavior

### What success looks like

- The page still feels premium, but the stack is clearly more efficient than desktop
- The utility band remains fast to scan and tap
- The first shell lane does not feel pushed too far down by branding

### Avoid

- Desktop-style equal-width action tiles squeezed into a too-tight row
- Side-by-side hosted surfaces that technically render but look stressed
- Keeping desktop hero proportions on tablet landscape

---

## 4) Tablet portrait — iPad Pro 13-inch and 11-inch

### Typical display conditions

#### iPad Pro 13-inch portrait
- **Device resolution:** 2752×2064
- **Practical shell target:** ~820–950 px usable width

#### iPad Pro 11-inch portrait
- **Device resolution:** 2420×1668
- **Practical shell target:** ~720–850 px usable width

### Recommended shell-entry behavior

- Hero height: **240–280 px**
- Greeting and tagline scale down one step
- Quick actions: **4 visible primary actions max**
- Utility band becomes a **2-column grid**
- Secondary tools move behind `More tools`
- First shell lane becomes **single-column only**
- Show one hosted shell module clearly before the second begins

### What success looks like

- The page feels like a guided vertical entry sequence
- The first hosted shell surface becomes the real focus immediately after actions
- The page no longer feels like compressed desktop

### Avoid

- Multi-column first-lane shell layouts in portrait tablet mode
- Oversized brand lockup and desktop hero proportions
- Admin-style rows of too many utility destinations

---

## 5) Phone portrait — iPhone 17 Pro Max

### Typical display conditions

- **Device:** iPhone 17 Pro Max
- **Device resolution:** 2868×1320
- **Practical shell target:** ~390–430 px CSS-class usable width after browser/UI constraints

### Recommended shell-entry behavior

- Hero height: **200–220 px**
- Greeting stacks above tagline
- Brand lockup reduces in scale
- Keep only the welcome message and strong brand signal
- Utility band becomes **Top Actions**
- Show **4 primary actions max**
- Secondary tools move behind `More tools` or an action sheet / bottom sheet
- First shell lane begins immediately after Top Actions
- All hosted shell content is **single-column only**
- Hosted modules must render in their narrowest stable layout mode

### What success looks like

- The first view is immediate and task-friendly
- Brand is present, but utility and shell content are not delayed
- No horizontal crowding and no tiny action cards

### Avoid

- Desktop hero proportions
- Horizontal action rows with undersized cards
- Eight equal-weight utilities shown before shell content
- Any dependence on hover or wide metadata patterns

---

## 6) Phone portrait — iPhone 17 Pro

### Typical display conditions

- **Device:** iPhone 17 Pro
- **Device resolution:** 2622×1206
- **Practical shell target:** ~375–410 px CSS-class usable width after browser/UI constraints

### Recommended shell-entry behavior

- Hero height: **190–210 px**
- Greeting, tagline, and reduced brand lockup only
- Show **3–4 primary actions max**
- Prefer a **2×2** primary-actions layout if cards remain tap-safe and legible
- First shell lane starts immediately after actions
- Tighten vertical spacing by one density step relative to larger devices
- No secondary summary bars above the first hosted shell module

### What success looks like

- The page feels instant, not ceremonial
- Top actions are immediately reachable
- The first shell lane begins early and cleanly

### Avoid

- A hero that consumes more than roughly half of the first screen
- Two rows of utility tiles before any shell content
- Tablet-like assumptions about available width

---

## 7) Phone landscape / short-height constrained state

### Typical display conditions

- Applies to iPhone Pro / Pro Max landscape and other short-height browser states
- Width may appear generous, but usable height is severely constrained

### Recommended shell-entry behavior

- Hero becomes **compact banner mode**
- Hero height: **120–160 px**
- Utility band becomes:
  - a horizontally scrollable Top Actions strip, or
  - a single `Top Actions` trigger opening a sheet
- First shell lane starts immediately below
- Reduce logo scale and preserve only the most important welcome/brand content

### What success looks like

- The page remains usable in a constrained-height state
- Actions remain reachable without excessive vertical scrolling
- The hero no longer dominates the layout

### Avoid

- Desktop hero treatment in phone landscape
- Tall utility tiles
- Large vertical artwork consuming the first screen

---

## Action visibility rules by breakpoint

| Device Class | Visible Primary Actions | Overflow Behavior |
|---|---:|---|
| Ultrawide desktop | 6 | `More tools` |
| Standard laptop / desktop | 5 | `More tools` |
| Tablet landscape | 4–6 | `More tools` |
| Tablet portrait | 4 | `More tools` |
| Phone portrait large | 4 | Sheet / `More tools` |
| Phone portrait standard | 3–4 | Sheet / `More tools` |
| Phone landscape | 0–4 depending on strip mode | Action sheet / overflow strip |

---

## Hero height rules by breakpoint

| Device Class | Recommended Hero Height |
|---|---:|
| Ultrawide desktop | 420–460 px |
| Standard laptop / desktop | 340–380 px |
| Tablet landscape | 280–320 px |
| Tablet portrait | 240–280 px |
| Phone portrait large | 200–220 px |
| Phone portrait standard | 190–210 px |
| Phone landscape | 120–160 px |

---

## First shell lane rules

### Rule A — First lane must begin on first view
At every breakpoint, the beginning of the first shell lane must be visible on initial load.

### Rule B — Two-column first lanes are conditional
The shell may use a two-column first lane only if both hosted surfaces remain:

- readable
- balanced
- premium-looking
- interaction-safe
- free of awkward internal compression

If not, the shell must stack them.

### Rule C — Tablet portrait and phones default to single-column
The first shell lane should be single-column for:

- tablet portrait
- phone portrait
- phone landscape

### Rule D — Hosted surface compatibility is judged by shell fit
If a hosted surface cannot remain stable, readable, and visually composed at its assigned slot width, the shell must:

- widen it,
- stack it,
- move it,
- or force an alternate hosted layout mode.

The shell should never assume that “it technically renders” means “it is properly nested.”

---

## Implementation guidance for the current setup

### Current strengths to preserve

- Full-width flagship top band
- Immediate recognition of HB Central as a branded internal destination
- Fast access to high-frequency tools
- A straightforward vertical transition from brand into work content

### Immediate improvements to prioritize

1. **Reduce hero height on laptop widths first**
2. **Convert the quick links row into a prioritized Top Actions system**
3. **Ensure the first shell lane begins sooner below the utility band**
4. **Use shell slot rules so hosted surfaces only share a row when their container width can actually support it**
5. **Define a narrowest-supported nested mode for each hosted surface the shell intends to place early in the entry stack**

---

## Suggested shell entry acceptance criteria

A shell entry implementation should be considered complete only if:

- the hero is visually premium at all major breakpoints,
- the first shell lane begins on first load across all major device classes,
- the action layer is clearly prioritized rather than directory-like,
- tablet portrait and phone states are single-column and stable,
- no first-screen state feels like “branding first, homepage later,”
- hosted surfaces nested in the first shell lane remain compositionally stable in their assigned slot widths,
- and the shell remains reflow-safe under constrained conditions.

---

## Source basis for device-specific resolutions

The Apple-specific device resolutions in this spec were based on Apple technical specifications for:

- 14-inch MacBook Pro
- 11-inch and 13-inch iPad Pro
- iPhone 17 Pro and iPhone 17 Pro Max

Generic ultrawide tiers are common monitor classes used as practical design references rather than product-specific requirements.
