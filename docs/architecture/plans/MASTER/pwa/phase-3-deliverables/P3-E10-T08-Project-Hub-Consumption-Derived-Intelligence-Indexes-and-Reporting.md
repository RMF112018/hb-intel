# P3-E10-T08 — Project Hub Consumption, Derived Intelligence Indexes, and Reporting

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E10-T08 |
| **Parent** | [P3-E10 Project Closeout Module](P3-E10-Project-Closeout-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T08 of 11 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. Governing Principle: Org Intelligence Is a Derived Read Model

The correct model is explicit and must be enforced in implementation:

```
Project Closeout         PE-approved         Org Intelligence
(operational records)  → publication event → (derived read model)
                                                    ↓
                                             Project Hub
                                             (read-only query)
```

**Three data classes — three different APIs:**

| Class | Data | Write path | Read path |
|---|---|---|---|
| Project operational records | `LessonEntry`, `SubcontractorScorecard`, `AutopsyFinding`, etc. | `@hbc/project-closeout` module APIs | Direct read within project context; role-gated |
| Published intelligence records | `LessonsIntelligenceIndexEntry`, `SubIntelligenceIndexEntry`, `LearningLegacyFeedEntry` | Org intelligence layer only; populated from PE-approved Closeout events | Org intelligence query API |
| Read-only aggregation/search surfaces | Project Hub contextual panels | Never — Project Hub is read-only | Org intelligence query API, filtered for context |

**Governing rule:** Project Hub may never write to any Closeout record. It may never write to any org intelligence record. Any surface in Project Hub that displays Closeout-derived intelligence is strictly read-only.

---

## 2. The Three Org Intelligence Indexes

### 2.1 LessonsIntelligence Index

**Purpose:** Org-wide searchable knowledge base of approved project lesson entries.

**Population trigger:** `closeout.lessons-published` event at project `ARCHIVED` state.

**Unit of entry:** One `LessonsIntelligenceIndexEntry` per PE-approved `LessonEntry`. If a project has 12 approved lessons, 12 index entries are created.

**Schema summary:** See T02 §3.2 for full provenance + intelligence payload.

**Search dimensions:**
- Full-text: `situation`, `rootCause`, `recommendation`, `keywords`, `phaseEncountered`
- Filter: `category`, `impactMagnitude`, `applicability` (range), `marketSector`, `deliveryMethod`, `projectSizeBand`, `complexityRating` (range)
- Sort: `applicability DESC`, `impactMagnitude DESC`, `reportDate DESC`

**Default relevance ranking for contextual surfacing:** When surfaced for a specific active project, the system computes a relevance score:

```
relevanceScore =
  match(activeProject.marketSector, entry.marketSector) × 3
  + match(activeProject.deliveryMethod, entry.deliveryMethod) × 2
  + match(activeProject.sizeBand, entry.projectSizeBand) × 1
  + entry.applicability × 0.5
```

Entries are ranked by `relevanceScore DESC`, then `applicability DESC`, then `reportDate DESC`.

### 2.2 SubIntelligence Index

**Purpose:** Org-wide role-restricted subcontractor performance database.

**Population trigger:** `closeout.scorecard-published` event at project `ARCHIVED` state. One entry per published `FinalCloseout` scorecard (plus PE-exception interims).

**Schema summary:** See T02 §3.1 for full provenance + intelligence payload.

**Search dimensions:**
- Exact / fuzzy: `subcontractorName`, `subcontractorId`
- Filter: `tradeScope`, `marketSector`, `deliveryMethod`, `projectSizeBand`, `performanceRating`, `reBidRecommendation`
- Sort: `evaluationDate DESC` (most recent first)
- Range filter: `overallWeightedScore` (e.g., "show only ≥ 3.5")

**Role gating:** SubIntelligence queries are rejected at the API layer for users without `SUB_INTELLIGENCE_VIEWER` or higher role. See T09.

**Aggregation view (PE/PER/MOE only):** The SubIntelligence index supports aggregate queries — e.g., "all evaluations for [Sub Name] across all projects: average score, score trend over time, projects worked on." This is a server-computed aggregate, not a raw record dump.

### 2.3 LearningLegacy Feed

**Purpose:** Org-wide browsable collection of approved Learning Legacy outputs from Autopsy records.

**Population trigger:** `closeout.learning-legacy-published` event at project `ARCHIVED` state. One `LearningLegacyFeedEntry` per PE-approved `LearningLegacyOutput`.

**Schema summary:** See T02 §3.3 for full provenance + intelligence payload.

**Search dimensions:**
- Full-text: `title`, `summary`, `fullContent`, `tags`, `actionableRecommendations`
- Filter: `outputType`, `applicableMarketSectors`, `applicableDeliveryMethods`, `applicableSizeBands`, `recurrenceRisk`
- Sort: `recurrenceRisk DESC`, `publishedAt DESC`

---

## 3. Project Hub Contextual Consumption

### 3.1 Contextual Lessons Panel

Surfaced on: Project Hub project detail view (for active or new projects).

**Trigger:** When a user views a project, the system automatically queries the LessonsIntelligence index using the project's profile (sector + method + size) and returns the top N relevant entries.

**Display format:**
- Tile or collapsible panel: "Relevant lessons from similar projects"
- Each entry: category badge + recommendation (the action-verb-led directive) + impact magnitude chip + applicability score + "from [Project Name]" attribution
- User can filter by category, expand for full detail (situation + root cause + recommendation)
- "View all" navigates to full lessons library search

**What the user can do:** Read, filter, expand, copy recommendation text.
**What the user cannot do:** Edit, annotate, flag, delete, modify publication status.

### 3.2 Sub Vetting Intelligence Panel

Surfaced on: Project Hub procurement surface when evaluating a sub for award (accessible only to users with `SUB_INTELLIGENCE_VIEWER` or higher).

**Trigger:** User enters a subcontractor name or selects a registered sub.

**Display format:**
- Header: sub name, trade scope categories they have been evaluated on
- Score card: section score bars (Safety, Quality, Schedule, Cost, Communication, Workforce) per most recent evaluation
- History list: all evaluations in the index, sorted by date DESC — project name, eval date, overall score, rating, reBid recommendation
- Aggregate: average score across all evaluations; score trend (if 3+ evaluations exist)
- Restricted: narratives (keyStrengths, areasForImprovement, issues) visible only to PE/PER/MOE
- Exception flag: `isInterimException = true` entries carry a badge with explanatory tooltip

**What the user can do (with `SUB_INTELLIGENCE_VIEWER`):** Read scores and ratings; view history; export summary.
**What PE/PER/MOE can additionally do:** Read narrative fields; view aggregate trend; navigate to source project.
**What no user can do:** Create evaluations from this surface; edit scores; change publication status.

### 3.3 Learning Legacy Feed

Surfaced on: Project Hub "Organization Knowledge" or "Learning Library" section.

**Triggered:** Manually browsable + contextual surfacing on new project setup.

**Display format:**
- Feed of `LearningLegacyFeedEntry` records sorted by `recurrenceRisk DESC`, `publishedAt DESC`
- Filter sidebar: output type, sector, delivery method, size, recurrence risk, tag cloud
- Card: title + summary + recommendation bullets + applicable project tags + "from [Project Name]" attribution
- Expanded view: full content + all recommendations + linked section themes
- Tag-based discovery: clicking a tag filters to related outputs

---

## 4. Difference Between Record Classes in the UI

Implementation must clearly distinguish between the three data classes for users who have access to both project-level records and org intelligence:

| Surface element | Data class | Mutability | Navigation |
|---|---|---|---|
| Checklist item result | Project operational record | Editable by PM/SUPT | Within project Closeout module |
| Lesson entry (in project) | Project operational record | Editable while Draft | Within project Closeout module |
| Org lessons index entry | Published intelligence record | Immutable | "Source: [Project Name] — view source" link if user has project access |
| Sub scorecard (in project) | Project operational record | Editable while Draft | Within project Closeout module |
| SubIntelligence index entry | Published intelligence record | Immutable | "Source: [Project Name] — view source" link if user has project access |
| Learning legacy output (in project) | Project operational record | Editable while Draft | Within project Closeout module |
| Learning legacy feed entry | Published intelligence record | Immutable | "Source: [Project Name] — view source" link if user has project access |

Users should never be in a state where they believe they can edit an org intelligence record from a Project Hub surface.

---

## 5. Spine Publication Contract (Full)

### 5.1 Activity Spine Events

| Event key | Trigger | Payload |
|---|---|---|
| `closeout.checklist-created` | Checklist instantiated | `{ projectId, checklistId, templateVersion, jurisdiction }` |
| `closeout.item-completed` | Any item result changes to Yes/No/NA | `{ projectId, itemId, itemNumber, result, previousResult }` |
| `closeout.substantial-completion` | Item 2.10 = Yes | `{ projectId, itemId, itemDate }` |
| `closeout.co-obtained` | Item 3.11 = Yes | `{ projectId, itemId, itemDate }` |
| `closeout.last-work-date-recorded` | Item 4.13 = Yes | `{ projectId, itemId, itemDate }` |
| `closeout.liens-released` | Item 4.15 = Yes | `{ projectId, itemId }` |
| `closeout.files-returned` | Item 5.5 = Yes | `{ projectId, itemId }` |
| `closeout.scorecard-submitted` | First FinalCloseout scorecard submitted | `{ projectId, scorecardId, subcontractorName, evaluationType }` |
| `closeout.scorecard-approved` | FinalCloseout scorecard PE-approved | `{ projectId, scorecardId, subcontractorName, overallWeightedScore, performanceRating }` |
| `closeout.scorecard-published` | Scorecard published to org index | `{ projectId, scorecardId, indexEntryId }` |
| `closeout.lessons-submitted` | LessonsLearningReport submitted | `{ projectId, reportId, entryCount }` |
| `closeout.lessons-approved` | LessonsLearningReport PE-approved | `{ projectId, reportId, entryCount }` |
| `closeout.lessons-published` | Lessons published to org index | `{ projectId, reportId, publishedEntryCount }` |
| `closeout.autopsy-complete` | AutopsyRecord PE-approved | `{ projectId, autopsyId, findingCount, actionCount, outputCount }` |
| `closeout.learning-legacy-published` | Learning legacy outputs published | `{ projectId, autopsyId, publishedOutputCount, outputIds }` |
| `closeout.archive-ready` | ARCHIVE_READY milestone approved by PE | `{ projectId, checklistId, milestonesAllApproved: true }` |
| `closeout.archived` | Project reaches ARCHIVED state | `{ projectId, publishedAt, lessonsCount, scorecardsCount, learningOutputCount }` |

### 5.2 Health Spine Events

Emitted on each relevant state change:

| Dimension key | Formula | Emitted when |
|---|---|---|
| `closeoutCompletionPct` | `(Yes items / applicable items) × 100` | Any item result change |
| `scorecardCoverage` | `(PE_APPROVED FinalCloseout scorecards / total registered subs) × 100` | Any scorecard status change |
| `lessonsReadiness` | `0` if LessonsLearningReport < PE_APPROVED; `100` if PE_APPROVED | Report status change |
| `autopsyReadiness` | `0` if AutopsyRecord < PE_APPROVED; `100` if PE_APPROVED | Autopsy status change |

---

## 6. Reports Module Integration

### 6.1 Report Artifact Families

Project Closeout feeds two distinct report artifact families in P3-E9 Reports:

| Artifact | Trigger | Snapshot source | Reports role |
|---|---|---|---|
| `sub-scorecard` | Per-sub; generated at closeout by PM/PE | `GET /api/closeout/{projectId}/scorecard/{scorecardId}/snapshot` | Assembles scored criterion tables, narrative, section charts into PDF |
| `lessons-learned` | Per-project; generated at closeout | `GET /api/closeout/{projectId}/lessons/snapshot` | Assembles entry list, category distribution, magnitude analysis into PDF |

### 6.2 Snapshot API Preconditions

| Snapshot | Precondition |
|---|---|
| Scorecard snapshot | `SubcontractorScorecard.publicationStatus ≥ PE_APPROVED`; caller has PE role |
| Lessons snapshot | `LessonsLearningReport.publicationStatus ≥ PE_APPROVED`; caller has PE role |

Reports module must handle the case where a snapshot is requested before the precondition is met — return 409 with a clear message: "Scorecard has not yet been PE-approved. Approve the scorecard before generating the report."

### 6.3 Snapshot Immutability Guarantee

Once a snapshot is generated for an approved record, the data is frozen at the approval time. Subsequent updates to project data (which would require creating a new scorecard or resubmitting a lessons report) do not retroactively alter the snapshot used by a previously generated report.

---

*[← T07](P3-E10-T07-Project-Autopsy-and-Learning-Legacy.md) | [Master Index](P3-E10-Project-Closeout-Module-Field-Specification.md) | [T09 →](P3-E10-T09-Permissions-Visibility-Executive-Review-Role-Matrix.md)*
