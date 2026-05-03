# Lessons Learned Developer Implementation Decisions and Contracts

## Non-Negotiable Contracts

1. Primary object is `PccLessonLearnedRecord`.
2. Every workbook field survives as a mapped target field or explicit legacy/source field.
3. The workbook's six-lesson layout is not a target limit.
4. PCC owns lesson governance; source systems own their native facts.
5. Every evidence/source value requires source lineage.
6. No Procore/Sage/Graph/SharePoint runtime mutation exists in documentation scope.
7. Publication is gate-based, not status-text-based.
8. Redaction is enforced in read models, not only in UI.
9. HBI is advisory only and must honor permission/redaction context.
10. Improvement actions are linked to lessons and auditable.
11. Lessons may inform future work but cannot automatically decide vendor, employee, legal, claims, or warranty outcomes.
12. All module responses use existing PCC envelope/source-status/warning posture when implemented.

## Required TypeScript Contracts for Future Implementation

```ts
export interface PccLessonLearnedRecord {
  lessonId: string
  projectId: string
  projectNumber: string
  projectName: string
  title: string
  status: PccLessonStatus
  visibilityTier: PccLessonVisibilityTier
  sensitivity: PccLessonSensitivityClassification
  category: PccLessonCategory
  subcategory?: string
  phaseEncountered: PccProjectLifecyclePhase
  marketSector?: string
  deliveryMethod?: string
  projectSizeBand?: string
  complexityRating?: number
  tradeScope?: string
  discipline?: string
  tags: string[]
  content: PccLessonContent
  impact: PccLessonImpactProfile
  evidence: PccLessonEvidenceReference[]
  sourceLineage: PccSourceLineageReference[]
  review: PccLessonReviewState
  redaction: PccLessonRedactionProfile
  reuse: PccLessonReuseProfile
  audit: PccLessonAuditEvent[]
}
```

## Required Enums

- `PccLessonStatus`
- `PccLessonCategory`
- `PccLessonSensitivityClassification`
- `PccLessonVisibilityTier`
- `PccLessonImpactMagnitude`
- `PccLessonPublicationDecision`
- `PccLessonReviewOutcome`
- `PccLessonReuseTargetModule`
- `PccLessonEvidenceType`
- `PccLessonSourceSystem`
- `PccLessonAuditEventType`
- `PccLessonRedactionReason`

## Required Read Models

```ts
PccLessonsLearnedSummaryReadModel
PccLessonCandidateReadModel
PccLessonRecordCardReadModel
PccLessonDetailReadModel
PccLessonReviewQueueReadModel
PccLessonKnowledgeLibraryReadModel
PccLessonImprovementActionReadModel
PccLessonsLearnedMetricsReadModel
PccLessonRedactedRecordReadModel
```

## Required Reference JSONs

- `reference/lessons_learned_module_data_contract.json`
- `reference/lessons_learned_state_machine.json`
- `reference/field_permission_and_redaction_matrix.json`
- `reference/lessons_learned_validation_rules.json`
- `reference/default_lessons_learned_seed_structure.json`
- `reference/workbook_field_mapping_reference.json`
- `reference/hbi_lessons_learned_contracts.json`
- `reference/metric_dictionary.json`
- `reference/fixture_scenarios.json`
- `reference/source_research_urls.json`

## Required Future Tests

- state transition tests;
- submit/approve/publish validation tests;
- permission/action matrix tests;
- redaction-shape tests;
- HBI suggestion schema tests;
- source-lineage schema tests;
- metric dictionary tests;
- workbook field mapping completeness tests;
- fixture scenario tests;
- read-model envelope tests;
- no external writeback tests;
- no direct SPFx-to-source-system tests.
