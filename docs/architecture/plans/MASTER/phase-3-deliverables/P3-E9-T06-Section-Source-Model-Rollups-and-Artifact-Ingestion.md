# P3-E9-T06 — Reports: Section Source Model, Rollups, and Artifact Ingestion

**Module:** P3-E9 Reports
**Governing contract:** P3-F1 §4 (snapshot model), §11 (narrative)
**Locked decisions driving this file:** LD-REP-01, LD-REP-02, LD-REP-08

---

## 1. Section Content Type Model

### 1.1 Three Permitted Content Types

Every section in every registered report family has a `contentType` (defined in T02 §2.2). The content type governs what data populates the section and who may author it.

| Content Type | Data Source | PM May Override? | Project May Bind? |
|--------------|-------------|-----------------|-------------------|
| `module-snapshot` | Immutable snapshot from a source module (e.g., P3-E5 Financial, P3-E6 Schedule) | Narrative overlay only | No data binding |
| `calculated-rollup` | MOE-approved rollup formula applied to snapshot data | Narrative overlay only | No formula override |
| `narrative-only` | PM-authored free text; no data source | Full authorship | N/A — text is the content |

### 1.2 What Is Explicitly Prohibited (LD-REP-08)

Projects may not introduce:
- **Custom data bindings** — References to live module data fields not mediated through the approved snapshot API.
- **Formula overrides** — Custom calculation logic in any section, even in narrative sections.
- **Dynamic field references** — Template variables or field substitution tokens referencing live project data.
- **Cross-section aggregations authored by PM** — PM may not introduce calculated dependencies between sections.

All data in generated reports flows exclusively from approved source-module snapshots or MOE-approved rollup calculations.

---

## 2. Source Module Snapshot Integration

### 2.1 How Snapshots Are Provided

Each source module that a report family depends on must implement a snapshot API contract. When Reports initiates a generation run:
1. Reports calls each required source module's snapshot endpoint.
2. The source module returns an `IModuleSnapshot` envelope (see T02 §2.8) containing:
   - Snapshot ID and version
   - Capture timestamp
   - Schema reference
   - The data payload (module-specific structure, opaque to Reports)
3. Reports freezes the snapshot association on the run record.

The snapshot API contract for each source module is specified in that module's T-file family (e.g., P3-E5-T09 for Financial, P3-E6-T09 for Schedule).

### 2.2 Snapshot Readiness Check

Before a run is queued, Reports verifies that each required source module has a snapshot available for the project. If any required module has no confirmed snapshot:
- Generation is blocked.
- The UI shows which modules are missing snapshots.
- PM must wait for the source module to produce a confirmable snapshot before proceeding.

### 2.3 Snapshot Schema Stability

When a source module version-bumps its snapshot schema:
- Reports does not automatically re-generate pending runs.
- The snapshot schema reference on existing frozen `ISnapshotRef` records is immutable.
- New runs (post schema change) use the new schema version.
- Template section definitions reference the schema contract version, so schema compatibility is verifiable.

---

## 3. PX Review Section Map

PX Review is a locked corporate template (`isLocked: true`). Its section structure is MOE-defined and not configurable by projects.

| Section Key | Content Type | Source Module |
|-------------|-------------|---------------|
| `project-overview` | `module-snapshot` | P3-A1 (Project Registry) |
| `financial-summary` | `calculated-rollup` | P3-E5 (Financial) |
| `schedule-summary` | `calculated-rollup` | P3-E6 (Schedule) |
| `safety-summary` | `calculated-rollup` | P3-E8 (Safety) |
| `quality-summary` | `module-snapshot` | P3-E4 (QC) — if available; otherwise omit |
| `constraints-summary` | `module-snapshot` | P3-E7 (Permits & Constraints) |
| `open-items-summary` | `calculated-rollup` | P3-E3 (Action Items / RFIs) |
| `executive-narrative` | `narrative-only` | PM-authored |
| `forecast-and-risk` | `narrative-only` | PM-authored |

Note: Section keys and module references above are the authoritative Phase 3 definition. Any change requires MOE approval and a new template version.

---

## 4. Owner Report Section Map

Owner Report is a corporate configurable template. MOE defines the base section structure; projects may author narratives and optionally reorder non-locked sections.

| Section Key | Content Type | Source Module | Optional? |
|-------------|-------------|---------------|-----------|
| `project-status-summary` | `module-snapshot` | P3-A1 (Project Registry) | No |
| `milestone-progress` | `calculated-rollup` | P3-E6 (Schedule) | No |
| `budget-status` | `calculated-rollup` | P3-E5 (Financial) | No |
| `safety-highlights` | `module-snapshot` | P3-E8 (Safety) — score band only | No |
| `open-items` | `module-snapshot` | P3-E3 | Yes |
| `owner-narrative` | `narrative-only` | PM-authored | No |
| `upcoming-milestones` | `narrative-only` | PM-authored | No |

---

## 5. Integration-Driven Artifact Families: Ingestion from P3-E10

### 5.1 Ownership Boundary

Sub-scorecard and lessons-learned are integration-driven artifact families. P3-E10 (Project Closeout) owns all operational data. Reports ingests a Closeout-generated, PE-confirmed snapshot.

**What P3-E10 owns and provides:**
- All criterion scores, section scores, overall weighted scores, and performance ratings for sub-scorecard.
- All lesson entries, categories, impact ratings, keywords, and aggregation rows for lessons-learned.
- The confirmed snapshot version that Reports will consume.

**What Reports owns for these families:**
- The family definition (section schema, assembly rules, release governance).
- The run ledger records.
- The generated PDF artifact.
- The artifact provenance (which P3-E10 snapshot version was consumed).

### 5.2 Sub-Scorecard Ingestion

When a `sub-scorecard` generation run is initiated:
1. Reports calls P3-E10's sub-scorecard snapshot API for the specified `subcontractorId` and `projectId`.
2. P3-E10 returns a confirmed, PE-approved `ISubScorecardSnapshot` — see §5.3.
3. Reports assembles the sub-scorecard report artifact from the snapshot.
4. Reports does NOT re-calculate any scores. All scoring is done by P3-E10 at data-entry time.

If no confirmed P3-E10 snapshot exists for the requested subcontractor, generation fails with a readiness check failure.

### 5.3 Sub-Scorecard Snapshot Content (from P3-E10)

The P3-E10 sub-scorecard snapshot includes (per subcontractor per project):

**Header fields:**
- `subcontractorName`, `tradeScope`, `contractValue`, `finalCost`
- `scheduledCompletion`, `actualCompletion`, `evaluationDate`
- `evaluatedByUPN`, `projectId`, `subcontractorId`

**Six scored sections (each with weighted criteria, 1–5 scale, N/A allowed):**

| Section | Section Weight | Criteria Count |
|---------|---------------|----------------|
| Safety & Compliance | 20% | 5 |
| Quality of Work | 20% | 5 |
| Schedule Performance | 20% | 5 |
| Cost Management | 15% | 4 |
| Communication & Coordination | 15% | 5 |
| Workforce Management | 10% | 4–5 |

**Scoring model (executed by P3-E10, not Reports):**

Section score:
```
sectionScore = Σ(criterionScore × criterionWeight) / Σ(criterionWeight)
               where N/A criteria are excluded from both numerator and denominator
```

Overall weighted score:
```
overallWeightedScore = (safetyScore × 0.20) + (qualityScore × 0.20)
                     + (scheduleScore × 0.20) + (costMgmtScore × 0.15)
                     + (communicationScore × 0.15) + (workforceScore × 0.10)
```

Performance rating derivation (applied by P3-E10):

| Score Range | Rating |
|-------------|--------|
| 4.5–5.0 | Exceptional |
| 3.5–4.4 | Above Average |
| 2.5–3.4 | Satisfactory |
| 1.5–2.4 | Below Average |
| 1.0–1.4 | Unsatisfactory |

**Narrative fields (required, authored in P3-E10):**
- `keyStrengths`: Key performance strengths (PM-authored in E10)
- `areasForImprovement`: Improvement areas (PM-authored in E10)
- `reBidRecommendation`: Recommendation to re-bid (`'yes'` | `'no'` | `'conditional'`)
- `reBidNotes`: Narrative supporting recommendation

**SubIntelligenceIndex rows** (derived read model; not part of the report artifact itself — P3-E10 owns SubIntelligence index population separately; see P3-E10-T06)

### 5.4 Lessons Learned Ingestion

When a `lessons-learned` generation run is initiated:
1. Reports calls P3-E10's lessons-learned snapshot API for the specified `projectId`.
2. P3-E10 returns a confirmed `ILessonsLearnedSnapshot` — see §5.5.
3. Reports assembles the lessons-learned report artifact.
4. Reports does NOT modify any lesson entry data.

### 5.5 Lessons Learned Snapshot Content (from P3-E10)

**Project classification fields:**
- `deliveryMethod` (`'design-bid-build'` | `'design-build'` | `'cmar'` | `'gmp'` | `'lump-sum'` | `'jv'` | other)
- `marketSector` (Building | Civil | Industrial | Healthcare | Education | etc.)
- `projectSizeBand` (`'small'` (<$5M) | `'medium'` ($5M–$25M) | `'large'` ($25M–$100M) | `'major'` (>$100M))
- `complexityRating` (1–5)
- `actualCost`, `scheduledDuration` (months), `actualDuration` (months)

**Per-lesson entry fields:**
- `lessonId`, `projectId`
- `title` (brief, imperative title)
- `category` — one of 16 governed categories (see §5.6)
- `phase` — project phase when lesson was encountered
- `description` — detailed narrative of what happened
- `rootCause` — root cause analysis
- `recommendation` — starts with action verb; names owner and project phase
- `applicability` (1–5) — how broadly applicable this lesson is
- `impactMagnitude` — `'minor'` | `'moderate'` | `'significant'` | `'critical'`
- `keywords` — comma-separated; enables LessonsIntelligenceIndex search and relevance ranking
- `enteredByUPN`, `enteredAt`

**Impact magnitude thresholds (defined by P3-E10):**

| Magnitude | Financial Impact | Schedule Impact |
|-----------|-----------------|-----------------|
| Minor | < $10K | < 1 week |
| Moderate | $10K–$100K | 1–4 weeks |
| Significant | $100K–$1M | 1–3 months |
| Critical | > $1M | > 3 months |

**LessonsIntelligenceIndex rows** (derived read model; not part of the report artifact — P3-E10 owns LessonsIntelligence index population separately; see P3-E10-T05)

### 5.6 Lesson Category Reference

| Category | Typical Topics |
|----------|---------------|
| PRE-CONSTRUCTION | Scope definition, team assembly, site logistics, owner coordination |
| ESTIMATING & BID | Estimate accuracy, bid strategy, margin assumptions, contingency |
| PROCUREMENT | Lead times, supplier performance, procurement authority, spec clarity |
| SCHEDULE | Critical path, logic, sequencing, recovery, milestone tracking |
| COST/BUDGET | Forecast accuracy, cost trending, budget authority, CO process |
| SAFETY | OSHA, near-miss reporting, safety engagement, incident investigation |
| QUALITY | First-pass quality, rework, punch list, inspection protocols |
| SUBCONTRACTORS | Sub qualification, insurance, payment chain, performance management |
| DESIGN/RFIs | Ambiguous specs, RFI response time, design changes, constructability |
| OWNER/CLIENT | Owner responsiveness, decision-making speed, scope changes, alignment |
| TECHNOLOGY/BIM | BIM maturity, coordination workflows, clash resolution, 3D workflow |
| WORKFORCE/LABOR | Crew continuity, union compliance, prevailing wage, apprenticeship |
| COMMISSIONING | Commissioning readiness, testing plans, training delivery, manuals |
| CLOSEOUT/TURNOVER | As-built drawings, warranty registration, O&M manuals, final walkthrough |
| OTHER | Lessons that do not fit other categories (free-text category may be specified) |

---

## 6. Calculated Rollup Definitions

Calculated rollup sections use MOE-approved formulas applied to snapshot data. Projects may not override the formula. The rollup definition is versioned alongside the family template definition.

### 6.1 Financial Summary Rollup (PX Review)

Draws from P3-E5 (Financial) snapshot:
- Current cost at completion (CAC)
- Budget at completion (BAC)
- Cost variance: `CV = BAC - CAC`
- Cost performance index: `CPI = EV / AC` (if EVM enabled)
- Change order summary: count, total approved value, pending value

### 6.2 Schedule Summary Rollup (PX Review)

Draws from P3-E6 (Schedule) snapshot:
- Current project percent complete vs. planned percent complete
- Schedule variance: `SV = EV - PV` (if EVM enabled)
- Count of active critical path activities
- Next key milestone (name + forecast date)

### 6.3 Safety Summary Rollup (PX Review and Owner Report)

Draws from P3-E8 (Safety) snapshot:
- Overall safety posture band (NORMAL / ATTENTION / AT_RISK / CRITICAL)
- Composite safety score band (not raw score; per P3-E8 PER tiering)
- Open corrective actions count (total, overdue)
- Incident count (current period, YTD)
- Inspection compliance rate

### 6.4 Budget Status Rollup (Owner Report)

Draws from P3-E5 (Financial) snapshot:
- Approved contract value
- Current estimate at completion
- Percent of budget expended
- Change order exposure summary

### 6.5 Milestone Progress Rollup (Owner Report)

Draws from P3-E6 (Schedule) snapshot:
- Percent schedule complete
- Milestones achieved this period
- Next upcoming milestone

Note: Rollup formula specifications are owned by the corporate template library. Any formula change requires a new MOE-approved template version.
