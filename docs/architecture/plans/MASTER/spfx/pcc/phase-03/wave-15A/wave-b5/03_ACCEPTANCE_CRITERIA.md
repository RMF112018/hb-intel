# Acceptance Criteria

## Default Project Readiness command surface

- Default Project Readiness renders no more than 12 `data-pcc-card` cards.
- Default Project Readiness renders exactly one `data-pcc-active-surface-panel="project-readiness"` marker.
- Default Project Readiness includes:
  - hero/context;
  - blockers;
  - lifecycle gate summary;
  - domain posture;
  - ownership/accountability;
  - evidence/source health;
  - Priority Actions preview;
  - module drill-down index.
- Default Project Readiness does not render embedded detail sections:
  - `data-pcc-readiness-section="lifecycle-readiness-center"`;
  - `data-pcc-readiness-section="permit-inspection-control-center"`;
  - `data-pcc-readiness-section="responsibility-matrix"`;
  - `data-pcc-readiness-section="constraints-log"`;
  - `data-pcc-readiness-section="buyout-log"`;
  - `data-pcc-card-id="procore-source-confidence"`;
  - Unified Lifecycle detail cards.

## Detail section behavior

- Selecting `lifecycle-readiness` renders Lifecycle Readiness detail cards only.
- Selecting `permits-inspections` renders Permit & Inspection detail cards only.
- Selecting `responsibility-matrix` renders Responsibility Matrix detail cards only.
- Selecting `constraints` renders Constraints detail cards only.
- Selecting `buyout` renders Buyout detail cards only.
- Selecting `procore-source-confidence` renders Procore source confidence only.
- Selecting `unified-lifecycle` renders Unified Lifecycle cards only.
- Non-selected detail module cards are absent from the DOM.

## Bento/card invariants

- Every rendered `[data-pcc-card]` under Project Readiness has `parentElement === [data-pcc-bento-grid]`.
- No `[data-pcc-card] [data-pcc-card]` nesting exists.
- Every card has explicit tier and region source.
- Titled cards maintain `aria-labelledby`.
- Heading-level contract remains valid.

## Interaction and false-affordance rules

- Enabled buttons are allowed only for local drill-down view selection.
- Allowed local buttons carry `data-pcc-readiness-drilldown-control`.
- No enabled workflow-like labels exist:
  - submit;
  - approve;
  - upload;
  - run;
  - execute;
  - sync;
  - write back;
  - complete checklist;
  - launch;
  - create;
  - modify;
  - delete;
  - save.
- Existing disabled affordance reason linkage remains valid.
- No live `a[href^="http"]` anchors are introduced in the Project Readiness bento grid.

## Read-model/state rules

- Existing read-model hooks remain unconditional in the read-model path.
- Approvals fetch failure still degrades to zero approvals-derived references and does not fail primary readiness.
- Unified Lifecycle failure does not block readiness command rendering.
- Loading/error states render command-scaffold only, not the full embedded module wall.
- Source confidence/read-only/source-of-record boundary copy remains visible.

## Evidence expectations

- Live DOM card evidence should show Project Readiness default card count reduced from 62 to no more than 12.
- Breakpoint evidence should show materially reduced Project Readiness measured container height at every viewport.
- Workflow evidence should classify enabled local controls as view-selection only, not workflow actions.
- Final score remains expert-reviewed; this implementation does not self-certify Phase 4 readiness.
