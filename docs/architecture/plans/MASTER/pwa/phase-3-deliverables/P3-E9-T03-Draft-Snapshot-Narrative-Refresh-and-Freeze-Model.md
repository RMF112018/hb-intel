# P3-E9-T03 — Reports: Draft, Snapshot, Narrative, Refresh, and Freeze Model

**Module:** P3-E9 Reports
**Governing contract:** P3-F1 §4–§5, §11 — Draft/snapshot ownership, refresh, narrative
**Locked decisions driving this file:** LD-REP-07, LD-REP-08

---

## 1. Draft Configuration vs. Active Configuration

### 1.1 Two Distinct States

A project family's configuration exists in two distinct states at all times:

**Draft configuration** (`ConfigVersionState = 'draft'`): The PM-editable working state for a project family. The draft contains:
- Structural customizations to the family template (section include/exclude, ordering changes) — requires PE re-approval if structural changes exist
- Narrative defaults per section (PM-authored)
- Selected release class (within template-allowed set)
- Selected audience classes (PE-approved for changes)

**Active configuration** (`ConfigVersionState = 'active'`): The PE-activated state. Immutable once PE has activated it. All generation runs for the project family use the active configuration version in effect at the time the run is queued. The `configVersionId` on each `IReportRunRecord` is immutable.

### 1.2 Version Progression

```
PM edits draft → PM submits for PE activation → PE activates → config version = 'active'
                                               ↓
                                          PE rejects → config version = 'rejected'; PM must revise
```

If the PM makes structural changes to an already-active configuration:
1. A new draft version is created (version N+1).
2. The existing active version (version N) remains active and continues to drive runs.
3. The new draft must be submitted to PE for re-approval.
4. When PE activates the new draft, it becomes the new active version; the prior version becomes `'superseded'`.

Non-structural changes (PM narrative edits, narrative default updates) do not require PE re-approval. They take effect in the draft immediately and are captured in the next confirmed snapshot.

### 1.3 Structural vs. Non-Structural Changes

| Change Type | Structural? | Requires PE Re-approval |
|-------------|-------------|------------------------|
| Add or remove a section | Yes | Yes |
| Change a section's content type | Yes | Yes |
| Change a section's source module reference | Yes | Yes |
| Reorder sections | No | No |
| Edit a narrative default for a section | No | No |
| Change selected release class | No (if within allowed set) | No (PE already approved the allowed set) |
| Change audience classes to a more restricted set | No | No |
| Change audience classes to a broader set | Yes (governance change) | Yes |

---

## 2. Draft Lifecycle

### 2.1 Draft States

A report draft in the context of Reports module refers to the working state of a **project family's configuration** plus the associated **PM narrative content** for that family's current reporting period. Draft state is distinct from a run. Draft = what will be produced when a run is initiated. Run = the artifact produced from the draft.

```
[Family registered for project]
  → Draft configuration created (auto on registration, or on new version)
  → PM edits narrative sections, adjusts configuration
  → PM confirms draft (triggers snapshot freeze — see §4)
  → Generation run queued against confirmed draft + frozen snapshots
```

### 2.2 Draft Confirmation

Draft confirmation is a PM action that:
1. Freezes the current module snapshot set (all required source modules provide snapshots, which become immutable for this run).
2. Locks PM narrative content as of confirmation time.
3. Creates a generation run record (`ReportRunStatus = 'queued'`).

PM may confirm a draft even if the draft has a staleness warning, but the system MUST display the staleness warning and require an explicit acknowledgment before confirmation proceeds (P3-F1 §5.2).

PER may NOT confirm a draft. Draft confirmation is PM/PE-owned exclusively.

---

## 3. Staleness Model

### 3.1 Staleness Tracking

Every draft tracks `lastRefreshedAt` — the ISO 8601 timestamp of the most recent successful refresh of module-snapshot-sourced sections.

**Staleness threshold:** Configurable per family via `stalenessThresholdDays` in the family definition. Default: 7 days. The effective threshold per project-family is resolved from the central project-governance policy record (see T02 §2.13).

**Staleness state:** A draft is considered stale when:
```
now - lastRefreshedAt > effectiveStalenessThresholdDays (in days)
```

### 3.2 Staleness Behavior

| Condition | System Behavior |
|-----------|-----------------|
| Draft is stale | Show staleness warning banner in Reports UI |
| PM attempts export / confirmation while stale | Require explicit staleness acknowledgment before proceeding |
| Staleness threshold exceeded by > 2× | Escalate to Work Queue: `report-draft-stale` item (P3-D3 §12) |
| Draft refreshed | Reset `lastRefreshedAt`; clear staleness warning |

### 3.3 Staleness Work Queue Item

When a draft exceeds the staleness threshold:
- A `report-draft-stale` Work Queue item is generated and assigned to the PM.
- Priority: `'normal'`.
- Item resolves when the draft is refreshed.

When a draft exceeds 2× the staleness threshold:
- Priority escalates to `'high'`.
- An Activity spine event `reports.stale-warning` (significance: `'notable'`) is also emitted.

---

## 4. Snapshot Freeze Model

### 4.1 Snapshot Resolution at Confirmation

When PM confirms a draft, the system resolves module snapshots for all sections with `contentType = 'module-snapshot'` or `'calculated-rollup'`:

1. For each required source module in the family's section definitions, call the source module's snapshot API.
2. Receive an `IModuleSnapshot` from each source module.
3. Record each snapshot as an `ISnapshotRef` on the run record.
4. Mark snapshots as frozen — no further refresh can modify the association for this run.

For integration-driven artifact families (`sub-scorecard`, `lessons-learned`):
- P3-E10 (Closeout) must have a confirmed, PE-approved snapshot available.
- Reports requests the snapshot from P3-E10's snapshot API.
- If no confirmed snapshot is available, generation fails with a `readiness check` failure message.

### 4.2 Snapshot Immutability Guarantee

Once a run is created and transitions out of `queued`:
- The `snapshotRefs` array on `IReportRunRecord` is immutable.
- No update to the source module's live data affects this run's artifact.
- The artifact permanently reflects the state of the data as captured in the frozen snapshots.

### 4.3 Readiness Check (P3-F1 §6.2)

Before a generation run is queued, the system performs a readiness check:

| Check | Failure Behavior |
|-------|-----------------|
| All required source modules have snapshots available | Block generation; show which modules are missing snapshots |
| Active configuration version exists for the family | Block generation; PM must complete configuration |
| PM narrative is present for all required narrative sections | Block generation; show incomplete narrative sections |
| PM↔PE internal review chain (if required and not complete) | Block PX Review from proceeding to approval (does not block generation) |

---

## 5. Refresh Model

### 5.1 What Refresh Does

A draft refresh re-requests snapshots from source modules and updates the module-snapshot-sourced sections in the draft with the latest available data. Refresh does NOT:
- Modify PM-authored narrative sections.
- Change the active configuration version.
- Create a new run record.
- Affect any existing confirmed/frozen run.

Refresh updates `lastRefreshedAt` and clears the staleness warning.

### 5.2 Refresh Trigger

Refresh may be initiated:
- Manually by the PM at any time.
- Automatically on a schedule configurable per project (optional; not required for Phase 3).

PER may NOT initiate a draft refresh. Refresh is PM-owned.

### 5.3 Narrative Preservation

Refresh preserves PM narrative across snapshot updates (P3-F1 §4.3). If a PM has authored narrative in section `S`, and a refresh updates section `S`'s snapshot data, the PM narrative for `S` is retained and shown alongside the refreshed data.

If a source module's snapshot schema changes in a way that makes a previously valid PM narrative section refer to a removed section, the system flags the orphaned narrative and prompts the PM to review.

---

## 6. PM Narrative Model

### 6.1 Narrative Section Ownership

Narrative sections (`contentType = 'narrative-only'`) are exclusively PM/PE-authored. Rules:

- PM authors or edits narrative content in narrative sections.
- PE may edit narrative on the draft (as project authority) before activating.
- PER has NO authority to modify narrative content.
- Narrative content is preserved across draft refreshes.
- Narrative is captured in the frozen snapshot at draft confirmation and becomes part of the immutable run record.

### 6.2 Narrative Provenance Tracking

Each narrative section edit is tracked:

```typescript
interface INarrativeEdit {
  sectionKey: string;
  content: string;
  editedByUPN: string;
  editedAt: string;   // ISO 8601
  previousContent: string | null;
}
```

This is an audit trail — not exposed in the generated report artifact, but available for run provenance inspection.

### 6.3 Narrative Constraints

- Narrative content is plain text or governed rich text only.
- No data binding markup, formula syntax, or dynamic field references are permitted in narrative content.
- Maximum character limits per section are defined in the family definition (optional; if not set, no limit enforced beyond reasonable PDF layout constraints).

---

## 7. Reviewer-Generated Run Draft Interaction

PER-initiated reviewer-generated runs do not interact with PM draft state:

- PER selects the latest already-confirmed PM snapshot (not the in-progress PM draft).
- The reviewer-generated run is created against that confirmed snapshot; PM draft state is unaffected.
- No new PM draft confirmation occurs.
- The run is recorded in the run ledger with `runType: 'reviewer-generated'`.
- Any annotations placed by PER attach via `@hbc/field-annotations` as a review layer; they do NOT modify the run record, draft state, or PM narrative.

See T07 for full PER behavior and annotation boundary rules.
