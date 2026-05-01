/**
 * PCC Project Lifecycle Readiness Center — deterministic sample fixtures.
 *
 * Phase 3 / Wave 9 / Prompt 02. Read-model only. No tenant URLs, no
 * secrets, no live UPNs, no non-deterministic identifiers, no runtime
 * PDF parsing.
 *
 * Library cardinality (157 / 55 / 32 / 70) is preserved as canonical
 * metadata even though only ten representative template items appear in
 * fixtures. The ten templates cover all ten lifecycle item types, all
 * four ownership classifications, and a representative slice of
 * criticality, evidence policy, recurrence, gate-impact, and
 * external-reference vocabularies.
 */

import type {
  IProjectReadinessBlockerSummary,
  IProjectReadinessEvidenceSummary,
} from '../ProjectReadinessFramework.js';
import type {
  ILifecycleReadinessDomainSummary,
  ILifecycleReadinessGateSummary,
  ILifecycleReadinessPhaseSummary,
  ILifecycleReadinessProjectItem,
  ILifecycleReadinessReadModel,
  ILifecycleReadinessSourceLibraryMetadata,
  ILifecycleReadinessSummary,
  ILifecycleReadinessTemplateItem,
  PccLifecycleReadinessReadModel,
} from '../LifecycleReadiness.js';
import { LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS } from '../LifecycleReadiness.js';

const STARTUP_PDF = 'Project_Startup_Checklist(2).pdf';
const SAFETY_PDF = 'Project_Safety_Checklist(1).pdf';
const CLOSEOUT_PDF = 'Project_Closeout_Checklist(2).pdf';

export const LIFECYCLE_READINESS_LIBRARY_METADATA: ILifecycleReadinessSourceLibraryMetadata =
  {
    total: 157,
    familyCounts: LIFECYCLE_READINESS_LIBRARY_FAMILY_COUNTS,
    sourceDocuments: [
      { family: 'startup', sourceFile: STARTUP_PDF },
      { family: 'safety', sourceFile: SAFETY_PDF },
      { family: 'closeout', sourceFile: CLOSEOUT_PDF },
    ],
  };

export const SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS: readonly ILifecycleReadinessTemplateItem[] =
  [
    {
      templateItemId: 'tpl-startup-001',
      family: 'startup',
      normalizedTitle: 'Review Owner contract — split savings and contingency',
      sourceTrace: {
        family: 'startup',
        sourceFile: STARTUP_PDF,
        page: 1,
        section: "Review Owner's Contract",
        sourceId: '1.1',
        sourceItemId: 'startup.1.1',
        itemKey: 'startup.review-owners-contract.1.1',
        exactItemText:
          'Split savings clause if any & Contingency usage parameters',
        sourceTraceabilityRequirement:
          "Project_Startup_Checklist(2).pdf page 1, section 'Review Owner's Contract', item 1.1",
      },
      lifecyclePhase: 'contract-review',
      readinessDomain: 'contract-commercial',
      itemType: 'verification',
      criticality: 'high',
      riskTags: ['commercial-terms', 'savings-clause'],
      defaultOwnerPersona: 'project-manager',
      defaultReviewerPersona: 'project-executive',
      ownershipClassification: 'owned',
      evidencePolicy: 'optional',
      externalReferences: [],
      defaultGateImpact: ['contract-review-ready'],
      activeByDefault: true,
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'startup.1.1',
        sourceReferenceLabel:
          "Project Startup Checklist — Review Owner's Contract 1.1",
      },
    },
    {
      templateItemId: 'tpl-startup-002',
      family: 'startup',
      normalizedTitle: 'File Owner-required Certificates of Insurance',
      sourceTrace: {
        family: 'startup',
        sourceFile: STARTUP_PDF,
        page: 1,
        section: 'Insurance and Risk',
        sourceId: '1.2',
        sourceItemId: 'startup.1.2',
        itemKey: 'startup.insurance-and-risk.1.2',
        exactItemText:
          'Owner-required Certificates of Insurance filed with executed contract',
        responseOptions: 'Yes / No / N/A',
        sourceTraceabilityRequirement:
          "Project_Startup_Checklist(2).pdf page 1, section 'Insurance and Risk', item 1.2",
      },
      lifecyclePhase: 'startup-readiness',
      readinessDomain: 'insurance-risk',
      itemType: 'evidence-required',
      criticality: 'high',
      riskTags: ['insurance', 'compliance'],
      defaultOwnerPersona: 'project-coordinator',
      defaultReviewerPersona: 'project-manager',
      ownershipClassification: 'linked',
      evidencePolicy: 'required-before-complete',
      evidenceLink: {
        policy: 'required-before-complete',
        evidenceState: 'pending',
        referenceLabel: 'COI library — current project',
        documentControlSourceId: 'document-control-source-pcc-coi-001',
      },
      externalReferences: [
        {
          system: 'sharepoint',
          referenceLabel: 'COIs library',
        },
      ],
      defaultGateImpact: ['startup-ready'],
      activeByDefault: true,
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'startup.1.2',
        sourceReferenceLabel:
          'Project Startup Checklist — Insurance and Risk 1.2',
      },
    },
    {
      templateItemId: 'tpl-startup-003',
      family: 'startup',
      normalizedTitle: 'Establish project records in Sage and Procore',
      sourceTrace: {
        family: 'startup',
        sourceFile: STARTUP_PDF,
        page: 2,
        section: 'Systems Setup',
        sourceId: '2.1',
        sourceItemId: 'startup.2.1',
        itemKey: 'startup.systems-setup.2.1',
        exactItemText: 'Set up project in Sage and Procore',
        sourceTraceabilityRequirement:
          "Project_Startup_Checklist(2).pdf page 2, section 'Systems Setup', item 2.1",
      },
      lifecyclePhase: 'mobilization-readiness',
      readinessDomain: 'systems-setup',
      itemType: 'external-system-reference',
      criticality: 'medium',
      riskTags: ['external-systems'],
      defaultOwnerPersona: 'project-accounting',
      defaultReviewerPersona: 'project-manager',
      ownershipClassification: 'external-reference',
      evidencePolicy: 'external-reference-only',
      externalReferences: [
        {
          system: 'sage',
          referenceLabel: 'Sage project setup record',
        },
        {
          system: 'procore',
          referenceLabel: 'Procore project record',
        },
        {
          system: 'adobe-sign',
          referenceLabel: 'Subcontract signature workflow',
        },
      ],
      defaultGateImpact: ['mobilization-ready', 'startup-ready'],
      activeByDefault: true,
      classificationNotes:
        'Cross-system setup; signals only — no direct API integration in Wave 9.',
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'startup.2.1',
        sourceReferenceLabel:
          'Project Startup Checklist — Systems Setup 2.1',
      },
    },
    {
      templateItemId: 'tpl-startup-004',
      family: 'startup',
      normalizedTitle: 'Capture Notice-to-Proceed date',
      sourceTrace: {
        family: 'startup',
        sourceFile: STARTUP_PDF,
        page: 3,
        section: 'Schedule Anchors',
        sourceId: '3.1',
        sourceItemId: 'startup.3.1',
        itemKey: 'startup.schedule-anchors.3.1',
        exactItemText: 'Notice-to-Proceed date captured and shared',
        sourceTraceabilityRequirement:
          "Project_Startup_Checklist(2).pdf page 3, section 'Schedule Anchors', item 3.1",
      },
      lifecyclePhase: 'contract-review',
      readinessDomain: 'schedule-planning',
      itemType: 'date-capture',
      criticality: 'low',
      riskTags: ['schedule-anchor'],
      defaultOwnerPersona: 'project-manager',
      ownershipClassification: 'owned',
      evidencePolicy: 'none',
      externalReferences: [
        {
          system: 'manual',
          referenceLabel: 'NTP letter — manually captured',
        },
      ],
      defaultGateImpact: ['contract-review-ready'],
      activeByDefault: true,
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'startup.3.1',
        sourceReferenceLabel:
          'Project Startup Checklist — Schedule Anchors 3.1',
      },
    },
    {
      templateItemId: 'tpl-safety-001',
      family: 'safety',
      normalizedTitle: 'Inspect daily fall-exposure controls',
      sourceTrace: {
        family: 'safety',
        sourceFile: SAFETY_PDF,
        page: 1,
        section: 'Areas of Highest Risk',
        sourceId: '1.1',
        sourceItemId: 'safety.1.1',
        itemKey: 'safety.areas-of-highest-risk.1.1',
        exactItemText: 'Fall Exposures',
        responseOptions: 'Pass / Fail / N/A',
        sourceTraceabilityRequirement:
          "Project_Safety_Checklist(1).pdf page 1, section 'Areas of Highest Risk', item 1.1",
      },
      lifecyclePhase: 'safety-readiness',
      readinessDomain: 'safety-qaqc',
      itemType: 'recurring-inspection',
      criticality: 'critical',
      riskTags: ['fall-protection', 'leading-indicator'],
      defaultOwnerPersona: 'safety-qaqc',
      defaultReviewerPersona: 'superintendent',
      ownershipClassification: 'owned',
      evidencePolicy: 'required-before-approval',
      evidenceLink: {
        policy: 'required-before-approval',
        evidenceState: 'submitted',
        referenceLabel: 'Per-shift safety walk record',
      },
      recurrence: {
        cadence: 'per-shift',
        triggerEvent: 'shift-start',
      },
      externalReferences: [],
      defaultGateImpact: ['safety-ready'],
      activeByDefault: true,
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'safety.1.1',
        sourceReferenceLabel:
          'Project Safety Checklist — Areas of Highest Risk 1.1',
      },
    },
    {
      templateItemId: 'tpl-safety-002',
      family: 'safety',
      normalizedTitle: 'Verify hot-work permits posted',
      sourceTrace: {
        family: 'safety',
        sourceFile: SAFETY_PDF,
        page: 1,
        section: 'Permits and Controls',
        sourceId: '1.2',
        sourceItemId: 'safety.1.2',
        itemKey: 'safety.permits-and-controls.1.2',
        exactItemText: 'Hot Work permits posted and current',
        responseOptions: 'Pass / Fail / N/A',
        sourceTraceabilityRequirement:
          "Project_Safety_Checklist(1).pdf page 1, section 'Permits and Controls', item 1.2",
      },
      lifecyclePhase: 'safety-readiness',
      readinessDomain: 'safety-qaqc',
      itemType: 'risk-control',
      criticality: 'high',
      riskTags: ['hot-work', 'permit-control'],
      defaultOwnerPersona: 'safety-qaqc',
      ownershipClassification: 'owned',
      evidencePolicy: 'conditional',
      evidenceLink: {
        policy: 'conditional',
        evidenceState: 'pending',
        referenceLabel: 'Active hot-work permits binder',
      },
      recurrence: {
        cadence: 'daily',
      },
      externalReferences: [
        {
          system: 'ahj-utility',
          referenceLabel: 'OSHA hot-work guidance',
        },
      ],
      defaultGateImpact: ['safety-ready'],
      activeByDefault: true,
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'safety.1.2',
        sourceReferenceLabel:
          'Project Safety Checklist — Permits and Controls 1.2',
      },
    },
    {
      templateItemId: 'tpl-safety-003',
      family: 'safety',
      normalizedTitle: 'Approve daily pre-task plans',
      sourceTrace: {
        family: 'safety',
        sourceFile: SAFETY_PDF,
        page: 2,
        section: 'Pre-task Plans',
        sourceId: '2.1',
        sourceItemId: 'safety.2.1',
        itemKey: 'safety.pre-task-plans.2.1',
        exactItemText: 'Pre-task plans signed and reviewed',
        responseOptions: 'Pass / Fail / N/A',
        sourceTraceabilityRequirement:
          "Project_Safety_Checklist(1).pdf page 2, section 'Pre-task Plans', item 2.1",
      },
      lifecyclePhase: 'active-construction-controls',
      readinessDomain: 'safety-qaqc',
      itemType: 'approval-checkpoint',
      criticality: 'high',
      riskTags: ['pre-task-plan', 'daily-approval'],
      defaultOwnerPersona: 'superintendent',
      defaultReviewerPersona: 'safety-qaqc',
      ownershipClassification: 'linked',
      evidencePolicy: 'required-before-approval',
      evidenceLink: {
        policy: 'required-before-approval',
        evidenceState: 'pending',
        referenceLabel: 'Pre-task plan repository',
      },
      recurrence: {
        cadence: 'daily',
      },
      externalReferences: [
        {
          system: 'document-crunch',
          referenceLabel: 'Pre-task plan template repository',
        },
      ],
      defaultGateImpact: ['safety-ready'],
      activeByDefault: true,
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'safety.2.1',
        sourceReferenceLabel:
          'Project Safety Checklist — Pre-task Plans 2.1',
      },
    },
    {
      templateItemId: 'tpl-closeout-001',
      family: 'closeout',
      normalizedTitle: 'Track owner-led utility/comm setup',
      sourceTrace: {
        family: 'closeout',
        sourceFile: CLOSEOUT_PDF,
        page: 1,
        section: 'Tasks',
        sourceId: '1.1',
        sourceItemId: 'closeout.1.1',
        itemKey: 'closeout.tasks.1.1',
        exactItemText:
          'Installation of phone lines for Fire Alarm & Elevator-by owner to set up account',
        responseOptions: 'N/A / Yes / No',
        sourceTraceabilityRequirement:
          "Project_Closeout_Checklist(2).pdf page 1, section 'Tasks', item 1.1",
      },
      lifecyclePhase: 'pre-co-readiness',
      readinessDomain: 'documents-records',
      itemType: 'document-tracking',
      criticality: 'medium',
      riskTags: ['owner-coordination', 'pre-co'],
      defaultOwnerPersona: 'project-coordinator',
      defaultReviewerPersona: 'project-manager',
      ownershipClassification: 'linked',
      evidencePolicy: 'required-before-complete',
      evidenceLink: {
        policy: 'required-before-complete',
        evidenceState: 'pending',
        referenceLabel: 'Closeout binder — owner setup confirmations',
        documentControlSourceId: 'document-control-source-pcc-closeout-001',
      },
      externalReferences: [
        {
          system: 'sharepoint',
          referenceLabel: 'Closeout binder library',
        },
        {
          system: 'document-crunch',
          referenceLabel: 'Closeout document set',
        },
      ],
      defaultGateImpact: ['pre-co-ready'],
      activeByDefault: true,
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'closeout.1.1',
        sourceReferenceLabel: 'Project Closeout Checklist — Tasks 1.1',
      },
    },
    {
      templateItemId: 'tpl-closeout-002',
      family: 'closeout',
      normalizedTitle: 'Surface unresolved liens (future closeout exposure)',
      sourceTrace: {
        family: 'closeout',
        sourceFile: CLOSEOUT_PDF,
        page: 2,
        section: 'Financial Closeout',
        sourceId: '2.1',
        sourceItemId: 'closeout.2.1',
        itemKey: 'closeout.financial-closeout.2.1',
        exactItemText: 'Lien releases captured for all subcontractors',
        sourceTraceabilityRequirement:
          "Project_Closeout_Checklist(2).pdf page 2, section 'Financial Closeout', item 2.1",
      },
      lifecyclePhase: 'post-turnover-closeout',
      readinessDomain: 'closeout-compliance',
      itemType: 'future-closeout-exposure',
      criticality: 'informational',
      riskTags: ['lien-release', 'closeout-exposure'],
      defaultOwnerPersona: 'project-manager',
      defaultReviewerPersona: 'project-accounting',
      ownershipClassification: 'deferred',
      evidencePolicy: 'none',
      externalReferences: [
        {
          system: 'other',
          referenceLabel: 'Subcontractor lien tracker',
        },
      ],
      defaultGateImpact: [
        'project-closeout-complete',
        'financial-closeout-ready',
      ],
      activeByDefault: true,
      classificationNotes:
        'Surfaces during active construction so closeout exposure is visible early.',
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'closeout.2.1',
        sourceReferenceLabel:
          'Project Closeout Checklist — Financial Closeout 2.1',
      },
    },
    {
      templateItemId: 'tpl-closeout-003',
      family: 'closeout',
      normalizedTitle: 'Schedule warranty walk meeting (reference-only)',
      sourceTrace: {
        family: 'closeout',
        sourceFile: CLOSEOUT_PDF,
        page: 3,
        section: 'Warranty',
        sourceId: '3.1',
        sourceItemId: 'closeout.3.1',
        itemKey: 'closeout.warranty.3.1',
        exactItemText: 'Schedule warranty walk meeting',
        sourceTraceabilityRequirement:
          "Project_Closeout_Checklist(2).pdf page 3, section 'Warranty', item 3.1",
      },
      lifecyclePhase: 'warranty-lessons-learned',
      readinessDomain: 'knowledge-performance',
      itemType: 'reference-only',
      criticality: 'low',
      riskTags: ['warranty', 'lessons-learned'],
      defaultOwnerPersona: 'manager-of-operational-excellence',
      ownershipClassification: 'external-reference',
      evidencePolicy: 'none',
      externalReferences: [
        {
          system: 'outlook',
          referenceLabel: 'Warranty walk calendar invite',
        },
      ],
      defaultGateImpact: ['turnover-ready'],
      activeByDefault: true,
      sourceLineage: {
        sourceModuleId: 'project-lifecycle-readiness',
        sourceItemId: 'closeout.3.1',
        sourceReferenceLabel: 'Project Closeout Checklist — Warranty 3.1',
      },
    },
  ];

const PROJECT_ID = 'project-fixture-pcc-readiness-001';

export const SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS: readonly ILifecycleReadinessProjectItem[] =
  [
    {
      projectItemId: 'inst-startup-001',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-startup-001',
      family: 'startup',
      status: 'not-started',
      ownerPersona: 'project-manager',
      reviewerPersona: 'project-executive',
      dueDateUtc: '2026-05-12T17:00:00Z',
      posture: 'not-started',
      severity: 'medium',
      blockerState: 'none',
      confidence: 'medium',
      lastUpdatedAtUtc: '2026-05-01T10:00:00Z',
    },
    {
      projectItemId: 'inst-startup-002',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-startup-002',
      family: 'startup',
      status: 'needs-evidence',
      ownerPersona: 'project-coordinator',
      reviewerPersona: 'project-manager',
      dueDateUtc: '2026-05-08T17:00:00Z',
      exceptionCode: 'evidence-missing',
      evidenceLink: {
        policy: 'required-before-complete',
        evidenceState: 'pending',
        referenceLabel: 'COI library — current project',
        documentControlSourceId: 'document-control-source-pcc-coi-001',
      },
      posture: 'at-risk',
      severity: 'high',
      blockerState: 'open',
      confidence: 'medium',
      lastUpdatedAtUtc: '2026-05-01T11:00:00Z',
      lastActorPersona: 'project-coordinator',
    },
    {
      projectItemId: 'inst-startup-003',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-startup-003',
      family: 'startup',
      status: 'in-progress',
      ownerPersona: 'project-accounting',
      reviewerPersona: 'project-manager',
      dueDateUtc: '2026-05-15T17:00:00Z',
      posture: 'at-risk',
      severity: 'medium',
      blockerState: 'mitigated',
      confidence: 'medium',
      lastUpdatedAtUtc: '2026-05-01T12:00:00Z',
      lastActorPersona: 'project-accounting',
      projectOverrideNotes:
        'Sage record created; Procore record pending owner approval.',
    },
    {
      projectItemId: 'inst-startup-004',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-startup-004',
      family: 'startup',
      status: 'complete',
      ownerPersona: 'project-manager',
      completedAtUtc: '2026-04-22T16:00:00Z',
      completedByPersona: 'project-manager',
      posture: 'ready',
      severity: 'low',
      blockerState: 'resolved',
      confidence: 'high',
      lastUpdatedAtUtc: '2026-04-22T16:05:00Z',
      lastActorPersona: 'project-manager',
    },
    {
      projectItemId: 'inst-safety-001',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-safety-001',
      family: 'safety',
      status: 'approved',
      ownerPersona: 'safety-qaqc',
      reviewerPersona: 'superintendent',
      evidenceLink: {
        policy: 'required-before-approval',
        evidenceState: 'approved',
        referenceLabel: 'Per-shift safety walk record — 2026-05-01',
      },
      posture: 'ready',
      severity: 'medium',
      blockerState: 'none',
      confidence: 'high',
      lastUpdatedAtUtc: '2026-05-01T07:30:00Z',
      lastActorPersona: 'safety-qaqc',
    },
    {
      projectItemId: 'inst-safety-002',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-safety-002',
      family: 'safety',
      status: 'returned',
      ownerPersona: 'safety-qaqc',
      reviewerPersona: 'superintendent',
      evidenceLink: {
        policy: 'conditional',
        evidenceState: 'submitted',
        referenceLabel: 'Active hot-work permits binder',
      },
      posture: 'at-risk',
      severity: 'high',
      blockerState: 'open',
      confidence: 'medium',
      lastUpdatedAtUtc: '2026-05-01T08:30:00Z',
      lastActorPersona: 'superintendent',
    },
    {
      projectItemId: 'inst-safety-003',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-safety-003',
      family: 'safety',
      status: 'failed',
      ownerPersona: 'superintendent',
      reviewerPersona: 'safety-qaqc',
      exceptionCode: 'failed-safety-check',
      blockedReason:
        'Pre-task plan returned without controls for elevated work zone.',
      evidenceLink: {
        policy: 'required-before-approval',
        evidenceState: 'rejected',
        referenceLabel: 'Pre-task plan — 2026-05-01 morning',
      },
      posture: 'blocked',
      severity: 'critical',
      blockerState: 'escalated',
      confidence: 'high',
      lastUpdatedAtUtc: '2026-05-01T09:00:00Z',
      lastActorPersona: 'safety-qaqc',
    },
    {
      projectItemId: 'inst-closeout-001',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-closeout-001',
      family: 'closeout',
      status: 'blocked',
      ownerPersona: 'project-coordinator',
      reviewerPersona: 'project-manager',
      dueDateUtc: '2026-06-15T17:00:00Z',
      exceptionCode: 'awaiting-external-system-setup',
      blockedReason:
        'Awaiting owner to set up phone-line accounts for fire alarm and elevator vendors.',
      evidenceLink: {
        policy: 'required-before-complete',
        evidenceState: 'pending',
        referenceLabel: 'Closeout binder — owner setup confirmations',
        documentControlSourceId: 'document-control-source-pcc-closeout-001',
      },
      posture: 'blocked',
      severity: 'high',
      blockerState: 'open',
      confidence: 'medium',
      lastUpdatedAtUtc: '2026-05-01T13:00:00Z',
      lastActorPersona: 'project-coordinator',
    },
    {
      projectItemId: 'inst-closeout-002',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-closeout-002',
      family: 'closeout',
      status: 'deferred',
      ownerPersona: 'project-manager',
      reviewerPersona: 'project-accounting',
      deferredReason:
        'Future closeout exposure; surfaced for awareness, not yet actionable.',
      posture: 'not-started',
      severity: 'low',
      blockerState: 'none',
      confidence: 'low',
      lastUpdatedAtUtc: '2026-05-01T13:30:00Z',
      lastActorPersona: 'project-manager',
    },
    {
      projectItemId: 'inst-closeout-003',
      projectId: PROJECT_ID,
      templateItemId: 'tpl-closeout-003',
      family: 'closeout',
      status: 'waived',
      ownerPersona: 'manager-of-operational-excellence',
      notApplicableReason:
        'Owner waived warranty walk; lessons-learned still scheduled.',
      posture: 'not-applicable',
      severity: 'low',
      blockerState: 'resolved',
      confidence: 'high',
      lastUpdatedAtUtc: '2026-05-01T14:00:00Z',
      lastActorPersona: 'manager-of-operational-excellence',
    },
  ];

export const SAMPLE_LIFECYCLE_READINESS_GATE_SUMMARIES: readonly ILifecycleReadinessGateSummary[] =
  [
    {
      gateId: 'contract-review-ready',
      projectItemIds: ['inst-startup-001', 'inst-startup-004'],
      posture: 'at-risk',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      criticalCount: 0,
    },
    {
      gateId: 'startup-ready',
      projectItemIds: ['inst-startup-002', 'inst-startup-003'],
      posture: 'at-risk',
      openBlockerCount: 1,
      pendingEvidenceCount: 1,
      criticalCount: 0,
    },
    {
      gateId: 'safety-ready',
      projectItemIds: ['inst-safety-001', 'inst-safety-002', 'inst-safety-003'],
      posture: 'blocked',
      openBlockerCount: 2,
      pendingEvidenceCount: 0,
      criticalCount: 1,
    },
    {
      gateId: 'pre-co-ready',
      projectItemIds: ['inst-closeout-001'],
      posture: 'blocked',
      openBlockerCount: 1,
      pendingEvidenceCount: 1,
      criticalCount: 0,
    },
    {
      gateId: 'project-closeout-complete',
      projectItemIds: ['inst-closeout-002'],
      posture: 'not-started',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      criticalCount: 0,
    },
  ];

export const SAMPLE_LIFECYCLE_READINESS_DOMAIN_SUMMARIES: readonly ILifecycleReadinessDomainSummary[] =
  [
    {
      domain: 'contract-commercial',
      projectItemIds: ['inst-startup-001'],
      posture: 'not-started',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      confidence: 'medium',
    },
    {
      domain: 'insurance-risk',
      projectItemIds: ['inst-startup-002'],
      posture: 'at-risk',
      openBlockerCount: 1,
      pendingEvidenceCount: 1,
      confidence: 'medium',
    },
    {
      domain: 'safety-qaqc',
      projectItemIds: ['inst-safety-001', 'inst-safety-002', 'inst-safety-003'],
      posture: 'blocked',
      openBlockerCount: 2,
      pendingEvidenceCount: 0,
      confidence: 'high',
    },
    {
      domain: 'documents-records',
      projectItemIds: ['inst-closeout-001'],
      posture: 'blocked',
      openBlockerCount: 1,
      pendingEvidenceCount: 1,
      confidence: 'medium',
    },
    {
      domain: 'closeout-compliance',
      projectItemIds: ['inst-closeout-002'],
      posture: 'not-started',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      confidence: 'low',
    },
  ];

export const SAMPLE_LIFECYCLE_READINESS_PHASE_SUMMARIES: readonly ILifecycleReadinessPhaseSummary[] =
  [
    {
      phase: 'contract-review',
      projectItemIds: ['inst-startup-001', 'inst-startup-004'],
      posture: 'at-risk',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      criticalCount: 0,
    },
    {
      phase: 'safety-readiness',
      projectItemIds: ['inst-safety-001', 'inst-safety-002'],
      posture: 'at-risk',
      openBlockerCount: 1,
      pendingEvidenceCount: 0,
      criticalCount: 0,
    },
    {
      phase: 'active-construction-controls',
      projectItemIds: ['inst-safety-003'],
      posture: 'blocked',
      openBlockerCount: 1,
      pendingEvidenceCount: 0,
      criticalCount: 1,
    },
    {
      phase: 'pre-co-readiness',
      projectItemIds: ['inst-closeout-001'],
      posture: 'blocked',
      openBlockerCount: 1,
      pendingEvidenceCount: 1,
      criticalCount: 0,
    },
    {
      phase: 'warranty-lessons-learned',
      projectItemIds: ['inst-closeout-003'],
      posture: 'not-applicable',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      criticalCount: 0,
    },
  ];

export const SAMPLE_LIFECYCLE_READINESS_EVIDENCE_SUMMARY: readonly IProjectReadinessEvidenceSummary[] =
  [
    {
      evidenceState: 'pending',
      itemIds: ['inst-startup-002', 'inst-closeout-001'],
      documentControlSourceIds: [
        'document-control-source-pcc-coi-001',
        'document-control-source-pcc-closeout-001',
      ],
    },
    {
      evidenceState: 'submitted',
      itemIds: ['inst-safety-002'],
      documentControlSourceIds: [],
    },
    {
      evidenceState: 'approved',
      itemIds: ['inst-safety-001'],
      documentControlSourceIds: [],
    },
    {
      evidenceState: 'rejected',
      itemIds: ['inst-safety-003'],
      documentControlSourceIds: [],
    },
  ];

export const SAMPLE_LIFECYCLE_READINESS_BLOCKER_SUMMARY: readonly IProjectReadinessBlockerSummary[] =
  [
    {
      blockerState: 'open',
      itemIds: ['inst-startup-002', 'inst-closeout-001'],
      severityCounts: { low: 0, medium: 0, high: 2, critical: 0 },
    },
    {
      blockerState: 'escalated',
      itemIds: ['inst-safety-003'],
      severityCounts: { low: 0, medium: 0, high: 0, critical: 1 },
    },
    {
      blockerState: 'mitigated',
      itemIds: ['inst-startup-003'],
      severityCounts: { low: 0, medium: 1, high: 0, critical: 0 },
    },
    {
      blockerState: 'resolved',
      itemIds: ['inst-startup-004', 'inst-closeout-003'],
      severityCounts: { low: 2, medium: 0, high: 0, critical: 0 },
    },
    {
      blockerState: 'none',
      itemIds: ['inst-startup-001', 'inst-safety-001', 'inst-closeout-002'],
      severityCounts: { low: 1, medium: 2, high: 0, critical: 0 },
    },
  ];

export const SAMPLE_LIFECYCLE_READINESS_SUMMARY: ILifecycleReadinessSummary = {
  totalProjectItems: 10,
  statusCounts: {
    'not-started': 1,
    'in-progress': 1,
    blocked: 1,
    'needs-evidence': 1,
    'needs-review': 0,
    approved: 1,
    returned: 1,
    complete: 1,
    failed: 1,
    deferred: 1,
    'not-applicable': 0,
    waived: 1,
  },
  headlinePosture: 'at-risk',
};

export const SAMPLE_LIFECYCLE_READINESS_READ_MODEL: ILifecycleReadinessReadModel =
  {
    summary: SAMPLE_LIFECYCLE_READINESS_SUMMARY,
    templateLibraryMetadata: LIFECYCLE_READINESS_LIBRARY_METADATA,
    sampleTemplateItems: SAMPLE_LIFECYCLE_READINESS_TEMPLATE_ITEMS,
    sampleProjectItems: SAMPLE_LIFECYCLE_READINESS_PROJECT_ITEMS,
    gates: SAMPLE_LIFECYCLE_READINESS_GATE_SUMMARIES,
    domains: SAMPLE_LIFECYCLE_READINESS_DOMAIN_SUMMARIES,
    phases: SAMPLE_LIFECYCLE_READINESS_PHASE_SUMMARIES,
    evidenceSummary: SAMPLE_LIFECYCLE_READINESS_EVIDENCE_SUMMARY,
    blockerSummary: SAMPLE_LIFECYCLE_READINESS_BLOCKER_SUMMARY,
  };

export const SAMPLE_LIFECYCLE_READINESS_READ_MODEL_ALIAS: PccLifecycleReadinessReadModel =
  SAMPLE_LIFECYCLE_READINESS_READ_MODEL;
