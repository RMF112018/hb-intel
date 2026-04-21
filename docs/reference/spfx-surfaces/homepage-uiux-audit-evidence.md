# Homepage UI/UX Audit — Evidence Appendix

Canonical evidence appendix for the flagship hero readability sign-off required by:

- [`homepage-uiux-audit-checklist.md`](./homepage-uiux-audit-checklist.md) §12 Accessibility + §14 Validation and closure
- [`homepage-uiux-audit-scorecard.md`](./homepage-uiux-audit-scorecard.md) "Evidence-backed closure"
- [`docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`](../ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md) §6.8 hero standard, §contrast

This appendix records explicit proof that the flagship hero (`HbSignatureHeroHomepage.tsx`, Waves 01 + 02) maintains acceptable readability for greeting, tagline, and logo across the approved daypart set and audited device classes.

## 1. Approved sign-off set

Sourced verbatim from `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerTimeOfDaySelector.ts:17-25` and `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroBannerAssetResolver.ts:66-94`.

| Daypart  | Time window    | Image file                      | Text-safe × | Logo-safe × |
|----------|----------------|---------------------------------|-------------|-------------|
| morning  | 05:00–09:00    | `banner_home_7_morning.png`     | 0.90        | 0.95        |
| mid-day  | 09:01–17:00    | `banner_home_7_mid-day.png`     | 1.15        | 0.80        |
| evening  | 17:01–20:00    | `banner_home_7_evening.png`     | 0.95        | 1.05        |
| night    | 20:01–04:59    | `banner_home_7_night.png`       | 0.55        | 1.30        |

Sign-off scope for this pass is the four daypart defaults. Wrapper-override images (when later authorized) will require their own appendix entry before shipping.

Device classes (matches breakpoints in `signature-hero.module.css`):

- Desktop ≥ 1440w — layout mode `premium-wide`
- Tablet ≈ 834w  — layout mode `compact-mid`
- Phone  ≈ 390w  — layout mode `compact-short-height`

Evidence matrix: **4 dayparts × 3 device classes = 12 states**.

## 2. Diagnostic seams used to force each state

Deterministic, no DOM manipulation required.

**Force a specific daypart (preferred for default-path sign-off):**

Inject a fixed `now` Date into the selector, per the existing test pattern at `apps/hb-webparts/src/webparts/hbSignatureHero/homepageHeroDaypartPrecedence.test.tsx:79-112`. For in-browser sign-off, use the same mechanism via a dev-only query param or a local `Date` override in the workbench harness.

**Verify the winning state before capture.** Inspect the rendered `<section>` element (HbSignatureHeroHomepage.tsx:253-284):

- `data-hbc-hero-background-source` = `daypart-default`
- `data-hbc-hero-daypart` = target daypart
- `data-hbc-hero-banner-file` = target image filename
- `data-hbc-hero-layout-mode` = expected breakpoint mode

**Console confirmation.** The debug line `[hb-signature-hero] background source` (HbSignatureHeroHomepage.tsx:184-200) prints the same facts and must agree with the data attributes before the screenshot is counted.

## 3. Contrast measurement method

Pragmatic sign-off method, defensible against the doctrine 4.5:1 text / 3:1 interactive requirement.

For each of the 12 states, measure at three readability-critical regions:

1. **Greeting line** — foreground glyph vs. underlying composite (scrim + grain + text-safe zone). Target ≥ 4.5:1.
2. **Tagline "Build with GRIT."** — foreground glyph vs. composite, accounting for the layered shadow stack at `HbSignatureHeroHomepage.tsx:316-323`. Target ≥ 7:1 (night worst case), ≥ 12:1 (best case, already established at `:49`).
3. **Logo + "HB Central" wordmark** — darkest mark pixel vs. halo + logo-safe composite. Logo graphic ≥ 3:1; wordmark text ≥ 4.5:1.

**Method (per region):**

1. Capture the hosted screenshot at native device resolution (no CSS zoom).
2. Sample a 3×3 pixel average of the background immediately behind the glyph using macOS Digital Color Meter or the Figma eyedropper.
3. Record the sampled background hex and the known foreground hex.
4. Compute the WCAG contrast ratio with a standard calculator. Record the ratio and pass/fail.

Sampled hex values are recorded alongside each ratio so the measurement is reproducible and not a black-box claim.

## 4. Per-state readability record

Screenshots live under [`./evidence/hero-readability/`](./evidence/hero-readability/) as `{daypart}-{device}.png`.

> **Status: capture session required.** The rows below are the evidence template. Each row must be completed from a real hosted SPFx workbench capture before the audit closes. Do not mark rows `Pass` without the sampled hex values and ratio.

### 4.1 Morning (`banner_home_7_morning.png`)

| Device  | Screenshot | Greeting contrast | Tagline contrast | Logo + wordmark | Qualitative note |
|---------|------------|-------------------|------------------|-----------------|------------------|
| Desktop | `morning-desktop.png` | _pending_ | _pending_ | _pending_ | _pending_ |
| Tablet  | `morning-tablet.png`  | _pending_ | _pending_ | _pending_ | _pending_ |
| Phone   | `morning-phone.png`   | _pending_ | _pending_ | _pending_ | _pending_ |

### 4.2 Mid-day (`banner_home_7_mid-day.png`)

| Device  | Screenshot | Greeting contrast | Tagline contrast | Logo + wordmark | Qualitative note |
|---------|------------|-------------------|------------------|-----------------|------------------|
| Desktop | `mid-day-desktop.png` | _pending_ | _pending_ | _pending_ | _pending_ |
| Tablet  | `mid-day-tablet.png`  | _pending_ | _pending_ | _pending_ | _pending_ |
| Phone   | `mid-day-phone.png`   | _pending_ | _pending_ | _pending_ | _pending_ |

### 4.3 Evening (`banner_home_7_evening.png`)

| Device  | Screenshot | Greeting contrast | Tagline contrast | Logo + wordmark | Qualitative note |
|---------|------------|-------------------|------------------|-----------------|------------------|
| Desktop | `evening-desktop.png` | _pending_ | _pending_ | _pending_ | _pending_ |
| Tablet  | `evening-tablet.png`  | _pending_ | _pending_ | _pending_ | _pending_ |
| Phone   | `evening-phone.png`   | _pending_ | _pending_ | _pending_ | _pending_ |

### 4.4 Night (`banner_home_7_night.png`)

Night is the lowest text-safe multiplier (0.55) and the highest logo-safe multiplier (1.30). This is the hardest state for greeting/tagline and the easiest for logo. Do not wave it through — record explicit measurements.

| Device  | Screenshot | Greeting contrast | Tagline contrast | Logo + wordmark | Qualitative note |
|---------|------------|-------------------|------------------|-----------------|------------------|
| Desktop | `night-desktop.png` | _pending_ | _pending_ | _pending_ | _pending_ |
| Tablet  | `night-tablet.png`  | _pending_ | _pending_ | _pending_ | _pending_ |
| Phone   | `night-phone.png`   | _pending_ | _pending_ | _pending_ | _pending_ |

## 5. Per-state capture readout

For each captured state, paste the data-attribute readout from the `<section>` element here so a reviewer can confirm the screenshot matches the claimed state. Template:

```
[daypart] [device]:
  data-hbc-hero-background-source:
  data-hbc-hero-daypart:
  data-hbc-hero-banner-file:
  data-hbc-hero-layout-mode:
  data-hbc-hero-width:
  data-hbc-hero-height-budget-min:
  data-hbc-hero-height-budget-max:
```

## 6. Scorecard and checklist mapping

Explicit mapping from audit line items to the evidence above.

| Source                                              | Line item                                                              | Evidence reference                         |
|-----------------------------------------------------|------------------------------------------------------------------------|--------------------------------------------|
| Checklist §12                                       | Contrast meets doctrine requirements for text and interactive elements | §3 method + §4 ratios per state            |
| Checklist §12                                       | The surface remains usable in touch-sized and constrained-height states| §4 tablet and phone rows                   |
| Checklist §13                                       | The surface behaves correctly in real SharePoint hosting               | §4 hosted screenshots (not local preview)  |
| Checklist §14                                       | Hosted screenshots were captured                                       | §4 `evidence/hero-readability/` files      |
| Scorecard — Flagship acceptance                     | Evidence-backed closure                                                | This appendix as a whole                   |
| Scorecard — Hard stop failures                      | Critical accessibility failure                                         | Any `Fail` row in §4 blocks closure        |
| UI Doctrine Homepage Overlay §6.8                   | No heavy overlay band; readability via authored photo + subtle scrim   | §4 qualitative notes confirm no band drift |
| UI Doctrine Homepage Overlay §contrast              | WCAG 2.1 AA (4.5:1 text, 3:1 interactive)                              | §4 ratios per state                        |

## 7. Closure gate

The appendix is **not closed** until:

- Every _pending_ cell in §4 has a sampled-background hex, foreground hex, and computed ratio.
- Every §4 row links to a real PNG in `./evidence/hero-readability/`.
- Every §5 readout block is populated.
- No daypart × device state shows a `Fail` that has not been either remediated or explicitly accepted as a doctrine-approved exception with rationale.
