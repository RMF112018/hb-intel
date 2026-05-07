# Open Decisions Closed

This file closes implementation decisions so the local code agent does not stall or invent product direction.

## OD-01 — Is the target a narrow accessibility fix or a full Project Home remediation?

**Decision:** Full Project Home remediation.

**Reason:** Project Home is the PCC front door and has cross-pillar scorecard impact. Contrast remediation is necessary, but the larger scorecard gain comes from command-center clarity, card hierarchy, progressive disclosure, lifecycle/HBI differentiation, and evidence completeness.

## OD-02 — Should total Project Home card count be reduced?

**Decision:** Do not make card-count reduction the primary requirement. Prefer **visible first-scan reduction** and **progressive disclosure** over deleting capabilities.

**Implementation rule:**

- Fixture-only path may remain 10 cards.
- Read-model-driven path may remain 16 cards if the first-fold hierarchy is materially improved.
- Cards may be reordered, retiered, renamed, condensed, grouped, or converted to compact summaries.
- Do not remove Unified Lifecycle, Ask HBI, Procore, Document Control, Approvals, Readiness, Site Health, Priority Actions, Team, Recent Activity, or External Platforms unless the user explicitly authorizes scope removal.

## OD-03 — Should Priority Actions remain fully expanded on the homepage?

**Decision:** No. Project Home should show a compact command rail by default.

**Target:** Show a concise subset of highest-priority items plus category counts / overflow summary. Full detail can remain accessible via lower-page expansion, local preview-only toggle, or a clearly inert drilldown pattern. Do not add live execution.

## OD-04 — Should Ask HBI remain last on the page?

**Decision:** No. Ask HBI must be visible earlier as a differentiator, but must remain advisory and grounded.

**Target:** Add an earlier compact HBI entry point or HBI intelligence strip without auto-fetching or implying mutation authority. Keep detailed Ask HBI panel available lower in the page if needed.

## OD-05 — Should Lifecycle content remain appended late?

**Decision:** No. Lifecycle continuity should be visible earlier as a compact summary.

**Target:** Promote a lifecycle continuity summary near the core-control cluster while keeping heavy lifecycle detail lower or behind progressive disclosure.

## OD-06 — Should Procore snapshot appear above Tier 2 core-control cards?

**Decision:** No. A `tier3/deferred` Procore snapshot should not precede Tier 2 operational cards unless it is actively blocking or materially stale.

**Target:** Move Procore source posture below the core-control cluster or fold it into a source-confidence/status strip.

## OD-07 — Should Missing Configurations remain third by default?

**Decision:** Conditional. It may remain high only when it represents a blocking state. Otherwise demote it.

**Target:** Treat setup/configuration as an exception/state signal, not the default third item in a mature project command center.

## OD-08 — Should Project Intelligence be renamed?

**Decision:** Yes, use a more operator-facing title.

**Target title options:**

- `Project Command Summary`
- `Project Intelligence`
- `Project Operating Summary`

Avoid `Project Intelligence Header`, which sounds like an internal implementation label.

## OD-09 — Should the homepage hero include operating posture?

**Decision:** Yes.

**Target:** The hero/command summary should answer:

- What project am I in?
- What needs attention today?
- Are there blockers or missing setup items?
- Are approvals/readiness/document-control items at risk?
- What source owns the data?
- What can HBI help with, and what can it not do?

## OD-10 — Should shared primitives be modified?

**Decision:** Not by default.

**Rule:** Do not edit `PccBentoGrid`, `PccDashboardCard`, `footprints.ts`, shell tabs, or shell hero primitives unless a validation blocker proves a local Project Home change cannot satisfy the remediation.

## OD-11 — Should the screenshot evidence harness be improved?

**Decision:** Yes, if this can be done locally within the evidence/test harness without destabilizing product code.

**Target:** Project Home screenshot evidence must include meaningful below-fold scroll segments. The current `surface-project-home-scroll-001.png` at `scrollY: 0` is insufficient.

## OD-12 — Should the remediation claim 100/100 or Phase 4 readiness?

**Decision:** No.

**Target:** The local agent may report scorecard movement and evidence improvements, but final scoring remains expert-reviewed. Playwright evidence does not equal scoring authority.

## OD-13 — Should HBI use stronger command language to feel powerful?

**Decision:** No.

**Target:** HBI should feel useful and intelligent through grounding, traceability, and suggested next steps—not through autonomous authority language. Avoid words such as approve, submit, execute, sync, write back, update, create, delete, modify, unless clearly describing source-system ownership and disabled/non-executing posture.

## OD-14 — Should external platform links be launched from Project Home?

**Decision:** No new live launches in this remediation.

**Target:** External systems may be surfaced as source posture or reference rows. Do not introduce executable launch links unless an existing pattern already governs them and the prompt specifically asks for it.

## OD-15 — Should fixture-only and read-model paths diverge visually?

**Decision:** They may diverge in data richness, but not in core hierarchy.

**Target:** The fixture-only path should preserve the same basic flagship hierarchy so tests and demo fallback do not become stale.
