# P3-E9-T07 — Reports: Review Boundaries, PER Behavior, Visibility, and Lane Depth

**Module:** P3-E9 Reports
**Governing contract:** P3-F1 §8.5–§8.6 — PER permissions; P3-E2 §8.4 — review boundary
**Locked decisions driving this file:** LD-REP-04, LD-REP-09, LD-REP-10
**Lane depth source:** P3-G1 §4.6, §4.8

---

## 1. PER Permissions

### 1.1 What PER May Do

| Action | Permitted | Rules |
|--------|-----------|-------|
| View report runs (all families in governed scope) | **Yes** | Subject to department scope; PER sees runs for projects in their governed scope only |
| View draft status (staleness indicator, draft age) | **Yes** | Read-only; PER cannot see in-progress PM narrative drafts before confirmation |
| View released artifacts (PDF download) | **Yes** | Access governed by release class; PER always has read access to runs in scope |
| Place field annotations (review layer) | **Yes** | Annotations stored in `@hbc/field-annotations` artifact; MUST NOT modify run-ledger, draft state, or PM narrative |
| Generate reviewer-generated runs | **Yes** | Only against the latest already-confirmed PM-owned snapshot; PER cannot initiate new draft confirmation |
| Release a report family (where authorized) | **Project-policy governed** | Authority per-family per effective policy; `perReleaseAuthority = 'per-permitted'` required |
| View release status | **Yes** | Read-only |
| View run-ledger history (summary) | **Yes** | Full history browsing requires launch-to-PWA per P3-G2 |

### 1.2 What PER May NOT Do

| Action | Prohibited | Governing Rule |
|--------|-----------|----------------|
| Confirm a PM draft | **NO** | Draft confirmation is PM/PE-owned exclusively; PER has no access to unconfirmed PM drafts |
| Edit PM narrative | **NO** | Narrative is PM/PE-authored exclusively; PER has no write access to narrative content |
| Modify run-ledger entries | **NO** | PER has no write access to the run-ledger; reviewer-generated runs are added as new entries only |
| Access unconfirmed PM drafts | **NO** | In-progress PM drafts before confirmation are not accessible to PER |
| Advance or bypass PM↔PE internal review chain | **NO** | Chain is PM/PE-owned; PER cannot initiate, advance, or skip it |
| Approve PX Review runs | **NO** | PX Review approval is PE-only |
| Refresh a PM draft | **NO** | Draft refresh is PM-owned |
| Initiate standard generation runs | **No** | PER initiates reviewer-generated runs only |

---

## 2. Reviewer-Generated Runs

### 2.1 What They Are

A reviewer-generated run is a PER-initiated generation run that produces a report artifact from the latest already-confirmed PM snapshot. It is distinct from a PM-initiated standard run:

| Attribute | Standard Run | Reviewer-Generated Run |
|-----------|-------------|----------------------|
| `runType` | `'standard'` | `'reviewer-generated'` |
| Initiated by | PM | PER |
| Snapshot source | PM draft confirmation → new snapshot freeze | Latest already-confirmed PM snapshot |
| Affects PM draft | No | No |
| Run-ledger impact | Creates new run record | Creates new run record (separate entry) |
| Approval/release gate | Per family policy | PER cannot advance through approval/release gates |
| Annotation attachment | No (optional via policy) | May carry `annotationArtifactRef` (PER review layer) |

### 2.2 Reviewer-Generated Run Rules (P3-F1 §8.6)

1. PER may only generate a reviewer-generated run using the latest already-confirmed PM snapshot. If no confirmed PM snapshot exists for the project-family, PER cannot generate a run.
2. PER cannot initiate a new PM draft confirmation to get a newer snapshot.
3. The reviewer-generated run does NOT bypass, replace, or modify the PM's draft state, PM narrative, or PM's run history.
4. The reviewer-generated run is recorded in the run ledger as a new entry with `runType: 'reviewer-generated'` and `generatedByUPN` = PER's UPN.
5. PER may not advance a reviewer-generated run through the approval or release workflow.

### 2.3 Multi-Run Comparison (PWA Only)

PER may compare multiple reviewer-generated runs (or a reviewer-generated run against a standard run) for a project-family. This capability is PWA-depth. Launch-to-PWA from SPFx (see §4 below).

---

## 3. Review Annotation Boundary (P3-E2 §8.4)

### 3.1 Architecture

Reports surfaces a review annotation layer for PER, but the annotation data itself is owned and stored by `@hbc/field-annotations`. The annotation layer is distinct from the run-ledger and from PM draft state.

```
Run artifact (PDF)
  ↑ generates
Run record (IReportRunRecord — run-ledger)
  + annotationArtifactRef → @hbc/field-annotations artifact (review layer, PER-owned)
```

### 3.2 Boundary Rules

| What Annotations Can Do | What Annotations Cannot Do |
|-------------------------|---------------------------|
| Attach to a specific run record via `annotationArtifactRef` | Modify the run record itself |
| Include PER's review notes, highlights, flags | Modify PM narrative content |
| Be pushed to project team via `@hbc/workflow-handoff` (Push-to-Team) | Modify the run-ledger |
| Be visible to PE and project team after push | Block report runs from proceeding |
| Be resolved by the project team in response to Push-to-Team | Replace the PM's standard run |

### 3.3 Annotation Visibility

- Annotations attached to a reviewer-generated run are visible to the PER review circle before push.
- After Push-to-Team, annotations become visible to the project team (PM, PE, Superintendent) as work items (P3-D3 §13).
- Annotations are never surfaced in the generated PDF artifact itself.
- PM maintains exclusive ownership of narrative content in the generated artifact.

---

## 4. Lane Depth Matrix for Reports

### 4.1 Reports Module Capabilities by Lane (P3-G1 §4.6)

| Capability | PWA | SPFx |
|------------|-----|------|
| View report list and status | **Required** | **Required** |
| Generate / queue report run | **Required** | **Required** |
| View report output / preview | **Required** | **Required** |
| PM narrative override / draft editing | **Required** | **Broad** — basic editing supported |
| Draft refresh and staleness handling | **Required** | **Broad** — staleness warnings shown |
| Run-ledger and history browsing | **Required** | **Launch-to-PWA** |
| Export (PDF download) | **Required** | **Required** |
| Approval (PX Review) | **Required** | **Required** |
| Release / distribution state | **Required** | **Broad** — view status; release action supported |

**Launch-to-PWA triggers from SPFx:**
- Full run-ledger history browsing → `/project-hub/{projectId}/reports?view=history`
- Advanced draft editing (section ordering, configuration changes) → `/project-hub/{projectId}/reports/{familyKey}/draft`

### 4.2 Executive Review Capabilities for Reports (P3-G1 §4.8)

| Capability | PWA | SPFx |
|------------|-----|------|
| View report runs in scope | **Full** | **Full** |
| Place review annotations on run artifacts | **Full** | **Broad** — annotation placement supported; advanced anchor depth in PWA |
| Generate reviewer-generated runs | **Full** | **Broad** — supported in both lanes |
| Push-to-Project-Team from annotation | **Full** | **Broad** — initiation supported in both |
| Confirm PER closure of pushed work item | **Full** | **Broad** |
| Review annotation thread management | **Full** | **Launch-to-PWA** |
| Multi-run comparison | **Full** | **Launch-to-PWA** |
| Review history browsing | **Full** | **Launch-to-PWA** |

**Lane depth doctrine for PER on Reports:** PWA provides the full executive review experience including annotation threads, multi-run comparison, and history. SPFx provides broad direct interaction — PER can read, annotate, generate runs, and push to team from SPFx. Deeper workflows stay in PWA.

---

## 5. Visibility Rules

### 5.1 Report Run Visibility

| Actor | Visibility |
|-------|-----------|
| PM | All runs for their project (standard + reviewer-generated) |
| PE | All runs for their project |
| PER | All runs for projects in their governed department scope |
| Superintendent | Released artifacts only (via Project Hub); no run-ledger access |
| Field | No direct Reports access |
| MOE/Admin | All runs platform-wide |

### 5.2 Draft Visibility

| Actor | Visibility |
|-------|-----------|
| PM | Full draft access — edit and view |
| PE | Full draft access — view and activate |
| PER | **No access to unconfirmed PM drafts** |
| Others | No draft access |

### 5.3 Snapshot Visibility

Once a snapshot is confirmed and frozen on a run, all authorized viewers of the run can see the snapshot reference metadata (what module, what version, captured at what time). They cannot view the source module's underlying live data through Reports.

---

## 6. Cross-Lane Navigation for Reports (P3-G2 §8.6)

Reports triggers launch-to-PWA for:

| Trigger | PWA Deep Link |
|---------|--------------|
| "View Full History" — run-ledger history | `/project-hub/{projectId}/reports?view=history` |
| "Advanced Draft Editing" — full draft management | `/project-hub/{projectId}/reports/{familyKey}/draft` |
| "Compare Runs" — PER multi-run comparison | `/project-hub/{projectId}/review?view=compare` |
| "Review Thread Management" — annotation threads | `/project-hub/{projectId}/review?view=threads` |

Launch-to-PWA passes `returnTo` parameter so the user can navigate back to the SPFx surface after completing the PWA task.
