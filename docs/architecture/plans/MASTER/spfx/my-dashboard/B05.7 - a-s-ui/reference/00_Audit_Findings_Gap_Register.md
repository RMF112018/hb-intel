# 00 — Audit Findings Gap Register

| Gap ID | Title | Severity | Remediation Wave |
|---|---|---:|---|
| AS-01 | Adobe card stretches into low-value empty volume | High | Prompt 02 |
| AS-02 | Visible status semantics absent despite computed labels | High | Prompt 03 |
| AS-03 | View switch embedded in heading and visually underpowered | High | Prompt 03 |
| AS-04 | Generic row classes are wrong for agreement/history rows | High | Prompt 04 |
| AS-05 | Repeated missing-date copy reads as broken UI | Medium | Prompt 04 / 05 |
| AS-06 | Preview-limit context not exposed | Medium | Prompt 04 |
| AS-07 | Completed loading/degraded states are text-only | Medium | Prompt 05 |
| AS-08 | Card interior lacks explicit responsive behavior | High | Prompt 06 |
| AS-09 | Adobe-specific styles pollute shared card CSS | Medium | Prompt 02 |
| AS-10 | Premium surface grammar remains weak | Medium | Prompts 03–06 |
| AS-11 | Keyboard validation is weaker than complexity warrants | Medium | Prompt 07 |
| AS-12 | Hosted closure/evidence remains insufficient | High | Prompt 08 |

## Gap Detail

### AS-01 — Height posture
The Action Queue screenshot shows a very tall right-side white card containing only a short empty-state sentence. The implementation must correct layout posture, not fill the empty space cosmetically.

### AS-02 — Status visibility
Status labels are computed in code but not visibly rendered. This harms scanability and confidence.

### AS-03 — Toggle semantics
The current view switch is implemented inside the heading through `titleContent`. It must become a dedicated semantic view-switch outside the heading.

### AS-04 — Row grammar
Agreement names and completed-history titles are not generic key/value labels. They need dedicated activity-row presentation.

### AS-05 — Missing date
`Updated date unavailable` must be eliminated from final UX.

### AS-06 — Preview framing
Counts and visible rows can differ. The card must explain that difference.

### AS-07 — State panel authorship
Loading/empty/degraded states need authored product panels and, for Completed lazy-load failures, Retry.

### AS-08 — Responsive behavior
Internal card anatomy must adapt across shell modes.

### AS-09 — Styling boundary
Adobe-specific view-toggle styling currently lives in shared MyWork card CSS. Move it local.

### AS-10 — Premium surface grammar
The card needs richer hierarchy, stronger sections, and intentional density.

### AS-11 — Keyboard validation
Tests must prove actual key behavior rather than keydown plus explicit click scaffolding.

### AS-12 — Closure proof
Final work needs hosted evidence and a re-score.
