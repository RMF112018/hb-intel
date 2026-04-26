# 03 — Homepage Surface and UI/UX Requirements

## Objective

Develop the dynamic Safety Field Excellence homepage surface so it reaches flagship/benchmark-grade quality under the homepage UI/UX checklist and scorecard.

This is not just a data cutover. The visual result must be a credible, productized, safety-recognition surface that feels native to the HB Central homepage.

## Governing UI Inputs

Implementation must be guided by:

- `docs/reference/ui-kit/doctrine/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/benchmark/`
- `homepage-uiux-audit-checklist.md`
- `homepage-uiux-audit-scorecard.md`
- current hbKudos public runtime as a rigor benchmark, not as a visual clone

## Flagship Score Target

Target:

- 48+/56 total score
- no hard-stop failures
- no critical accessibility failures
- no generic enterprise-card posture
- no unresolved host-fit instability
- no dead primary CTA
- no missing loading/empty/error state
- no weak packaged result that differs from source intent

## Surface Design Direction

The surface should express:

- seriousness appropriate to safety
- recognition without gamification
- evidence-backed trust
- weekly operational cadence
- polished compact behavior
- clear safety leadership ownership
- visual differentiation from hbKudos without losing HB family resemblance

## Layout Requirements

### Standard Mode

Standard mode should show:

- posture band
- weekly reporting period
- primary highlighted project
- evidence summary
- metric chips
- confidence/freshness indicator
- secondary excellence signals
- primary CTA into Safety record/detail
- optional reviewed/published attribution

### Compact Mode

Compact mode should show:

- posture label
- primary project
- compressed evidence summary
- 1–2 metric chips
- reduced secondary signals
- CTA only if space supports it

### Minimal Mode

Minimal mode should show:

- status/posture chip
- primary project title or preview title
- one concise supporting metric
- no dense metadata

## Preview Fallback Requirement

When no published dynamic data exists, the fallback must be a polished preview of the future state.

Do not render a blank "No data" card.

The preview fallback must:

- use the same final layout shell
- label itself clearly as "Preview" or "Coming soon"
- show representative placeholder content
- explain what real data will appear
- include non-deceptive sample metrics
- avoid implying that sample projects are real current winners
- keep CTA honest, such as "Open Safety hub" or "View Safety records"
- remain premium and homepage-grade

### Preview fallback copy pattern

```text
Weekly Safety Excellence Preview

Once weekly Safety records are published, this surface will highlight the project with the strongest verified field-safety performance — based on inspection consistency, active-jobsite evidence, finding response, and data quality.

Example evidence:
• Rolling inspection performance
• Corrective-action closure
• Active field exposure
• Finding severity trend
```

### Preview fallback data model

```ts
interface SafetyFieldExcellencePreviewModel {
  state: "preview";
  title: "Weekly Safety Excellence Preview";
  periodLabel: "Awaiting published weekly data";
  primaryPreview: {
    title: "Project highlight will appear here";
    summary: "Published Safety data will identify a project with verified active-field safety performance.";
    evidenceBullets: [
      "Inspection consistency",
      "Corrective-action response",
      "Activity/exposure confidence"
    ];
  };
  secondaryPreviewSignals: [
    "Most improved safety trend",
    "Strong corrective-action closure",
    "Consistent inspection cadence"
  ];
}
```

## State Model

Required states:

- loading
- preview/no-data
- dynamic-ready
- dynamic-stale
- dynamic-error-with-curated-fallback
- dynamic-error-with-preview-fallback
- insufficient-data
- suppressed-by-safety-leadership

## UI-Kit and Styling Requirements

- Use `@hbc/ui-kit/homepage` as the governed entry point where applicable.
- Preserve/extend `HbcSafetyHomepageSurface` rather than building a disconnected one-off surface unless doctrine requires a local primitive.
- Use `lucide-react` or governed icon exports.
- Use `motion` deliberately for refined transitions and respect reduced motion.
- Use `clsx` or governed class composition.
- Use local primitives only when they materially improve homepage quality.
- Avoid raw hard-coded color/spacer drift unless tokens are unavailable and justification is documented.
- Avoid default Fluent posture as the dominant visual language.

## Interaction Requirements

- primary CTA to the Safety record or Safety hub
- secondary signal CTA where available
- optional details drawer/panel only if it adds value and remains shell-safe
- no dead buttons
- no hover-only meaning
- keyboard-safe links and buttons
- touch-safe compact states

## Accessibility Requirements

- region labels are clear
- headings are semantic
- focus-visible states are present
- no critical information depends on color only
- reduced motion is respected
- touch targets remain credible in compact states
- contrast complies with doctrine
- preview/sample content is labeled to avoid deception

## Shell-Fit Requirements

Validate across:

- standard two-up homepage lane
- compact paired slot
- minimal/summary-collapsed shell mode
- desktop
- laptop
- tablet landscape
- tablet portrait
- phone portrait
- short-height browser
- 125% and 150% zoom

The surface must selectively reduce content in compact/minimal modes. Do not squeeze the full standard experience into a narrow slot.

## Scorecard Closure

The implementation is not done until a scorecard is completed.

Minimum closure target:

| Category | Required target |
|---|---:|
| Doctrine and host compliance | 4 |
| UI-kit / premium-stack compliance | 3+ |
| Token and styling discipline | 3+ |
| Purpose-fit sophistication | 4 |
| Surface composition and hierarchy | 4 |
| Homepage integration quality | 4 |
| Breakpoint and shell-fit quality | 4 |
| Interaction completeness | 3+ |
| State-model completeness | 4 |
| Contract/data/backend seam rigor | 4 |
| Identity/media/attribution quality | 3+ |
| Accessibility and keyboard behavior | 4 |
| Host-runtime resilience | 4 |
| Validation and closure proof | 4 |

Total target: 48+/56.
