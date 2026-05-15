# 08 — Acceptance Criteria and Proof of Closure

## Purpose

This file defines the final objective standard. The implementation is complete only when the criteria below are satisfied and demonstrated.

---

# 1. Product-Posture Acceptance

## AC-01 — Single Primary Page
- The visible runtime experience does not depend on tabs or dropdown navigation.
- All primary product value is visible from the My Dashboard page itself.

## AC-02 — No Focused Adobe Route Required
- A user does not need to switch to a focused Adobe surface to understand:
  - connection state;
  - queue state;
  - pending items;
  - empty state.

## AC-03 — Exactly Two Rendered Module Cards
- My Projects
- Adobe Sign Action Queue

No Work Summary, Source Readiness, or separate Adobe utility card remains in the primary runtime.

---

# 2. Layout Acceptance

## AC-04 — Locked Bento Spans
- My Projects:
  - 7 at large laptop / desktop / ultrawide
  - 6 at standard laptop
  - full-mode-width on smaller modes
- Adobe Sign:
  - 5 at large laptop / desktop / ultrawide
  - 4 at standard laptop
  - full-mode-width on smaller modes

## AC-05 — Card Order
- My Projects appears before Adobe Sign in DOM and visual composition.

## AC-06 — No Full-Width Desktop My Projects
- The Projects card does not consume the entire desktop row in the target UI.

---

# 3. Header Acceptance

## AC-07 — Compact Production Header
The rendered page header uses:

```text
My Dashboard
My Work
Your personal launch pad for project access and work requiring attention.
```

## AC-08 — No Telemetry Hero Strip
The old four-highlight hero pattern is absent from the rendered target path.

## AC-09 — No Page-Level Governance Lane
The old governance microcopy lane is absent from the rendered target path.

---

# 4. Adobe Sign Card Acceptance

## AC-10 — One Card Owns All States
A single Adobe card handles all relevant states.

## AC-11 — Authorization State
Authorization-required state includes:
- concise guidance;
- `Connect Adobe Sign` CTA;
- no separate guidance card.

## AC-12 — Populated State
Connected + populated state includes:
- compact metrics;
- up to 5 items;
- source handoff copy where truthful.

## AC-13 — Empty State
Connected + empty state reads as an appropriate positive empty state, not a source failure.

## AC-14 — Partial/Unavailable States
Partial/unavailable states remain truthful and compact inside the card.

---

# 5. My Projects Card Acceptance

## AC-15 — Disciplined Footprint
My Projects respects the locked spans and is not full-width on desktop.

## AC-16 — Empty/Unavailable Compression
Empty/unavailable states do not render:
- large low-density metric grids of zeroes;
- oversized empty launch-list region.

## AC-17 — Populated Launch Utility
Populated state preserves:
- project identity;
- role chips;
- SharePoint launch;
- Procore launch;
- disclosure beyond 5 rows.

---

# 6. Test and Documentation Acceptance

## AC-18 — Old Architecture Tests Reconciled
Tests asserting the rejected visible product model are:
- removed, or
- rewritten to reflect the new architecture.

## AC-19 — New Tests Prove Target Runtime
Tests must prove:
- two module-card rendering;
- absence of old rendered tab/menu product path;
- Adobe consolidated state handling;
- My Projects span/compression behavior where practical;
- compact header copy.

## AC-20 — App README Updated
`apps/my-dashboard/README.md` no longer reads like a B02-only scaffold. It accurately describes the current runtime posture after the UI reset.

---

# 7. Build and Packaging Acceptance

## AC-21 — Typecheck
```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
```

## AC-22 — Tests
```bash
pnpm --filter @hbc/spfx-my-dashboard test
```

## AC-23 — App Build
```bash
pnpm --filter @hbc/spfx-my-dashboard build
```

## AC-24 — SPFx Package Build
```bash
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

---

# 8. Final Closeout Report Requirements

The final local-agent closeout must include:

1. validation decision: PASS / FAIL;
2. branch and HEAD;
3. files inspected;
4. files changed;
5. tests/commands executed with results;
6. package command result;
7. any remaining operator-only hosted validation item, if not actually executed;
8. confirmation that no locked product decision was left unresolved.
