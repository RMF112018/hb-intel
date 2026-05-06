/**
 * PCC Project Readiness Module Framework — deterministic sample fixtures.
 *
 * Phase 3 / Wave 8 / Prompt 02. Read-model only. No tenant URLs, no
 * secrets, no live UPNs, no non-deterministic identifiers.
 */

import type {
  IProjectReadinessBlockerSummary,
  IProjectReadinessDomainSummary,
  IProjectReadinessEvidenceSummary,
  IProjectReadinessFrameworkSnapshot,
  IProjectReadinessGateSummary,
  IProjectReadinessItem,
  IProjectReadinessOwnershipSummary,
  IProjectReadinessSourceHealthSummary,
  PccProjectReadinessFrameworkReadModel,
} from '../ProjectReadinessFramework.js';

export const SAMPLE_PROJECT_READINESS_ITEMS: readonly IProjectReadinessItem[] = [
  {
    id: 'fixture-pcc-readiness-001',
    domain: 'team-and-access',
    lifecycleGate: 'preconstruction',
    sourceModuleId: 'team-access',
    title: 'Project team access lineup posture',
    description:
      'Roster, lanes, and access map posture for the preconstruction phase, normalized from the Team and Access module.',
    ownerPersona: 'project-manager',
    assignedUserUpn: 'pm-sample@example.com',
    reviewerPersona: 'project-executive',
    dueDateUtc: '2026-04-28T17:00:00Z',
    status: 'in-progress',
    severity: 'medium',
    blockerState: 'none',
    posture: 'at-risk',
    confidence: 'medium',
    sourceHealthStatus: 'available',
    evidenceRequirement: {
      requirementId: 'evidence-team-access-001',
      description: 'Confirm assigned managers for the active project lanes.',
      evidenceState: 'pending',
    },
    sourceLineage: {
      sourceModuleId: 'team-access',
      sourceItemId: 'team-access-lane-001',
      sourceReferenceLabel: 'Team and Access — viewer lane',
    },
    dependencyItemIds: [],
    createdAtUtc: '2026-04-15T08:00:00Z',
    updatedAtUtc: '2026-04-20T09:00:00Z',
    lastActorPersona: 'project-manager',
  },
  {
    id: 'fixture-pcc-readiness-002',
    domain: 'documents-project-record',
    lifecycleGate: 'startup-mobilization',
    sourceModuleId: 'document-control',
    title: 'Project record document set readiness',
    description:
      'Posture of the project record document set normalized from the HB Document Control source registry.',
    ownerPersona: 'project-coordinator',
    reviewerPersona: 'project-manager',
    dueDateUtc: '2026-04-22T17:00:00Z',
    status: 'needs-review',
    severity: 'medium',
    blockerState: 'open',
    posture: 'at-risk',
    confidence: 'medium',
    sourceHealthStatus: 'available',
    evidenceRequirement: {
      requirementId: 'evidence-doc-control-001',
      description: 'Reference the project record source registry entry.',
      evidenceState: 'submitted',
      evidenceLocationLabel: 'HB Document Control source registry',
      documentControlSourceId: 'document-control-source-pr-001',
    },
    sourceLineage: {
      sourceModuleId: 'document-control',
      sourceItemId: 'document-control-pr-001',
      sourceReferenceLabel: 'HB Document Control — Project Record',
      sourceUrl: 'https://example.invalid/sites/pcc-readiness/source/document-control/pr-001',
    },
    dependencyItemIds: ['fixture-pcc-readiness-001'],
    createdAtUtc: '2026-04-16T08:00:00Z',
    updatedAtUtc: '2026-04-20T11:00:00Z',
    lastActorPersona: 'project-coordinator',
  },
  {
    id: 'fixture-pcc-readiness-003',
    domain: 'permits-jurisdiction',
    lifecycleGate: 'startup-mobilization',
    sourceModuleId: 'permit-log',
    title: 'Local jurisdiction permit posture',
    description:
      'Permit posture and AHJ contact readiness normalized from the permit log module for the active jurisdiction.',
    ownerPersona: 'project-manager',
    assignedUserUpn: 'pm-sample@example.com',
    reviewerPersona: 'project-executive',
    dueDateUtc: '2026-04-25T17:00:00Z',
    status: 'blocked',
    severity: 'high',
    blockerState: 'escalated',
    posture: 'blocked',
    confidence: 'low',
    sourceHealthStatus: 'stale',
    evidenceRequirement: {
      requirementId: 'evidence-permit-001',
      description: 'Reference the AHJ acknowledgement record.',
      evidenceState: 'pending',
    },
    sourceLineage: {
      sourceModuleId: 'permit-log',
      sourceItemId: 'permit-log-001',
      sourceReferenceLabel: 'Permit Log entry 001',
    },
    dependencyItemIds: ['fixture-pcc-readiness-001'],
    escalationPath: ['project-executive', 'manager-of-operational-excellence'],
    approvalCheckpointReference: 'checkpoint-permit-001',
    relatedPriorityActionId: 'priority-action-permit-001',
    createdAtUtc: '2026-04-17T08:00:00Z',
    updatedAtUtc: '2026-04-20T13:00:00Z',
    lastActorPersona: 'project-manager',
  },
  {
    id: 'fixture-pcc-readiness-004',
    domain: 'safety-qaqc',
    lifecycleGate: 'active-construction',
    sourceModuleId: 'project-lifecycle-readiness',
    title: 'Field safety readiness posture',
    description:
      'Safety readiness posture for the active phase, normalized from the project lifecycle readiness module.',
    ownerPersona: 'safety-qaqc',
    reviewerPersona: 'superintendent',
    dueDateUtc: '2026-04-30T17:00:00Z',
    status: 'in-progress',
    severity: 'medium',
    blockerState: 'mitigated',
    posture: 'at-risk',
    confidence: 'medium',
    sourceHealthStatus: 'available',
    sourceLineage: {
      sourceModuleId: 'project-lifecycle-readiness',
      sourceItemId: 'lifecycle-readiness-safety-001',
      sourceReferenceLabel: 'Project Lifecycle Readiness — Safety',
    },
    dependencyItemIds: [],
    createdAtUtc: '2026-04-18T08:00:00Z',
    updatedAtUtc: '2026-04-20T14:00:00Z',
    lastActorPersona: 'safety-qaqc',
  },
  {
    id: 'fixture-pcc-readiness-005',
    domain: 'procurement-buyout',
    lifecycleGate: 'preconstruction',
    sourceModuleId: 'buyout-log',
    title: 'Buyout package preparation posture',
    description: 'Buyout package preparation posture normalized from the buyout log module.',
    ownerPersona: 'project-executive',
    status: 'not-started',
    severity: 'medium',
    blockerState: 'none',
    posture: 'not-started',
    confidence: 'medium',
    sourceHealthStatus: 'source-unavailable',
    evidenceRequirement: {
      requirementId: 'evidence-buyout-001',
      description: 'Reference the buyout package draft.',
      evidenceState: 'pending',
    },
    sourceLineage: {
      sourceModuleId: 'buyout-log',
      sourceReferenceLabel: 'Buyout Log — package draft',
    },
    dependencyItemIds: ['fixture-pcc-readiness-001'],
    createdAtUtc: '2026-04-18T09:00:00Z',
    updatedAtUtc: '2026-04-20T15:00:00Z',
  },
  {
    id: 'fixture-pcc-readiness-006',
    domain: 'closeout-turnover',
    lifecycleGate: 'closeout-planning',
    sourceModuleId: 'external-systems',
    title: 'External platforms closeout posture',
    description:
      'External system closeout posture normalized from the external systems module; deferred until the source is online.',
    ownerPersona: 'project-manager',
    status: 'deferred',
    severity: 'low',
    blockerState: 'none',
    posture: 'unknown',
    confidence: 'unknown',
    sourceHealthStatus: 'source-unavailable',
    sourceLineage: {
      sourceModuleId: 'external-systems',
      sourceReferenceLabel: 'External Platforms closeout posture',
    },
    dependencyItemIds: ['fixture-pcc-readiness-007'],
    createdAtUtc: '2026-04-19T08:00:00Z',
    updatedAtUtc: '2026-04-20T16:00:00Z',
  },
  {
    id: 'fixture-pcc-readiness-007',
    domain: 'site-health',
    lifecycleGate: 'active-construction',
    sourceModuleId: 'site-health',
    title: 'Site health baseline posture',
    description:
      'Baseline site health posture for the project site, normalized from the site health module.',
    ownerPersona: 'superintendent',
    assignedUserUpn: 'super-sample@example.com',
    reviewerPersona: 'project-manager',
    status: 'complete',
    severity: 'low',
    blockerState: 'resolved',
    posture: 'ready',
    confidence: 'high',
    sourceHealthStatus: 'available',
    evidenceRequirement: {
      requirementId: 'evidence-site-health-001',
      description: 'Site health baseline reference.',
      evidenceState: 'approved',
    },
    sourceLineage: {
      sourceModuleId: 'site-health',
      sourceItemId: 'site-health-baseline-001',
      sourceReferenceLabel: 'Site Health — baseline check',
    },
    dependencyItemIds: [],
    createdAtUtc: '2026-04-19T09:00:00Z',
    updatedAtUtc: '2026-04-20T17:00:00Z',
    lastActorPersona: 'superintendent',
  },
];

export const SAMPLE_PROJECT_READINESS_DOMAIN_SUMMARIES: readonly IProjectReadinessDomainSummary[] =
  [
    {
      domain: 'team-and-access',
      itemIds: ['fixture-pcc-readiness-001'],
      posture: 'at-risk',
      openBlockerCount: 0,
      pendingEvidenceCount: 1,
      confidence: 'medium',
    },
    {
      domain: 'documents-project-record',
      itemIds: ['fixture-pcc-readiness-002'],
      posture: 'at-risk',
      openBlockerCount: 1,
      pendingEvidenceCount: 0,
      confidence: 'medium',
    },
    {
      domain: 'permits-jurisdiction',
      itemIds: ['fixture-pcc-readiness-003'],
      posture: 'blocked',
      openBlockerCount: 1,
      pendingEvidenceCount: 1,
      confidence: 'low',
    },
    {
      domain: 'safety-qaqc',
      itemIds: ['fixture-pcc-readiness-004'],
      posture: 'at-risk',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      confidence: 'medium',
    },
    {
      domain: 'procurement-buyout',
      itemIds: ['fixture-pcc-readiness-005'],
      posture: 'not-started',
      openBlockerCount: 0,
      pendingEvidenceCount: 1,
      confidence: 'medium',
    },
    {
      domain: 'closeout-turnover',
      itemIds: ['fixture-pcc-readiness-006'],
      posture: 'unknown',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      confidence: 'unknown',
    },
    {
      domain: 'site-health',
      itemIds: ['fixture-pcc-readiness-007'],
      posture: 'ready',
      openBlockerCount: 0,
      pendingEvidenceCount: 0,
      confidence: 'high',
    },
  ];

export const SAMPLE_PROJECT_READINESS_GATE_SUMMARIES: readonly IProjectReadinessGateSummary[] = [
  {
    lifecycleGate: 'preconstruction',
    itemIds: ['fixture-pcc-readiness-001', 'fixture-pcc-readiness-005'],
    posture: 'at-risk',
    openBlockerCount: 0,
    pendingEvidenceCount: 2,
  },
  {
    lifecycleGate: 'startup-mobilization',
    itemIds: ['fixture-pcc-readiness-002', 'fixture-pcc-readiness-003'],
    posture: 'blocked',
    openBlockerCount: 2,
    pendingEvidenceCount: 1,
  },
  {
    lifecycleGate: 'active-construction',
    itemIds: ['fixture-pcc-readiness-004', 'fixture-pcc-readiness-007'],
    posture: 'at-risk',
    openBlockerCount: 0,
    pendingEvidenceCount: 0,
  },
  {
    lifecycleGate: 'closeout-planning',
    itemIds: ['fixture-pcc-readiness-006'],
    posture: 'unknown',
    openBlockerCount: 0,
    pendingEvidenceCount: 0,
  },
];

export const SAMPLE_PROJECT_READINESS_OWNERSHIP_SUMMARIES: readonly IProjectReadinessOwnershipSummary[] =
  [
    {
      ownerPersona: 'project-manager',
      assignedItemIds: [
        'fixture-pcc-readiness-001',
        'fixture-pcc-readiness-003',
        'fixture-pcc-readiness-006',
      ],
      openBlockerCount: 1,
      nextDueDateUtc: '2026-04-25T17:00:00Z',
    },
    {
      ownerPersona: 'project-coordinator',
      assignedItemIds: ['fixture-pcc-readiness-002'],
      openBlockerCount: 1,
      nextDueDateUtc: '2026-04-22T17:00:00Z',
    },
    {
      ownerPersona: 'safety-qaqc',
      assignedItemIds: ['fixture-pcc-readiness-004'],
      openBlockerCount: 0,
      nextDueDateUtc: '2026-04-30T17:00:00Z',
    },
    {
      ownerPersona: 'project-executive',
      assignedItemIds: ['fixture-pcc-readiness-005'],
      openBlockerCount: 0,
    },
    {
      ownerPersona: 'superintendent',
      assignedItemIds: ['fixture-pcc-readiness-007'],
      openBlockerCount: 0,
    },
  ];

export const SAMPLE_PROJECT_READINESS_EVIDENCE_SUMMARY: readonly IProjectReadinessEvidenceSummary[] =
  [
    {
      evidenceState: 'pending',
      itemIds: [
        'fixture-pcc-readiness-001',
        'fixture-pcc-readiness-003',
        'fixture-pcc-readiness-005',
      ],
      documentControlSourceIds: [],
    },
    {
      evidenceState: 'submitted',
      itemIds: ['fixture-pcc-readiness-002'],
      documentControlSourceIds: ['document-control-source-pr-001'],
    },
    {
      evidenceState: 'approved',
      itemIds: ['fixture-pcc-readiness-007'],
      documentControlSourceIds: [],
    },
  ];

export const SAMPLE_PROJECT_READINESS_BLOCKER_SUMMARY: readonly IProjectReadinessBlockerSummary[] =
  [
    {
      blockerState: 'none',
      itemIds: [
        'fixture-pcc-readiness-001',
        'fixture-pcc-readiness-005',
        'fixture-pcc-readiness-006',
      ],
      severityCounts: { low: 1, medium: 2, high: 0, critical: 0 },
    },
    {
      blockerState: 'open',
      itemIds: ['fixture-pcc-readiness-002'],
      severityCounts: { low: 0, medium: 1, high: 0, critical: 0 },
    },
    {
      blockerState: 'mitigated',
      itemIds: ['fixture-pcc-readiness-004'],
      severityCounts: { low: 0, medium: 1, high: 0, critical: 0 },
    },
    {
      blockerState: 'resolved',
      itemIds: ['fixture-pcc-readiness-007'],
      severityCounts: { low: 1, medium: 0, high: 0, critical: 0 },
    },
    {
      blockerState: 'escalated',
      itemIds: ['fixture-pcc-readiness-003'],
      severityCounts: { low: 0, medium: 0, high: 1, critical: 0 },
    },
  ];

export const SAMPLE_PROJECT_READINESS_SOURCE_HEALTH_SUMMARY: readonly IProjectReadinessSourceHealthSummary[] =
  [
    {
      sourceModuleId: 'team-access',
      sourceHealthStatus: 'available',
      itemIds: ['fixture-pcc-readiness-001'],
      warningCount: 0,
    },
    {
      sourceModuleId: 'document-control',
      sourceHealthStatus: 'available',
      itemIds: ['fixture-pcc-readiness-002'],
      warningCount: 0,
    },
    {
      sourceModuleId: 'permit-log',
      sourceHealthStatus: 'stale',
      itemIds: ['fixture-pcc-readiness-003'],
      warningCount: 1,
    },
    {
      sourceModuleId: 'project-lifecycle-readiness',
      sourceHealthStatus: 'available',
      itemIds: ['fixture-pcc-readiness-004'],
      warningCount: 0,
    },
    {
      sourceModuleId: 'buyout-log',
      sourceHealthStatus: 'source-unavailable',
      itemIds: ['fixture-pcc-readiness-005'],
      warningCount: 1,
    },
    {
      sourceModuleId: 'external-systems',
      sourceHealthStatus: 'source-unavailable',
      itemIds: ['fixture-pcc-readiness-006'],
      warningCount: 1,
    },
    {
      sourceModuleId: 'site-health',
      sourceHealthStatus: 'available',
      itemIds: ['fixture-pcc-readiness-007'],
      warningCount: 0,
    },
  ];

export const SAMPLE_PROJECT_READINESS_FRAMEWORK_SNAPSHOT: IProjectReadinessFrameworkSnapshot = {
  items: SAMPLE_PROJECT_READINESS_ITEMS,
  domainSummaries: SAMPLE_PROJECT_READINESS_DOMAIN_SUMMARIES,
  gateSummaries: SAMPLE_PROJECT_READINESS_GATE_SUMMARIES,
  ownershipSummaries: SAMPLE_PROJECT_READINESS_OWNERSHIP_SUMMARIES,
  evidenceSummary: SAMPLE_PROJECT_READINESS_EVIDENCE_SUMMARY,
  blockerSummary: SAMPLE_PROJECT_READINESS_BLOCKER_SUMMARY,
  sourceHealthSummary: SAMPLE_PROJECT_READINESS_SOURCE_HEALTH_SUMMARY,
};

export const SAMPLE_PROJECT_READINESS_FRAMEWORK_READ_MODEL: PccProjectReadinessFrameworkReadModel =
  SAMPLE_PROJECT_READINESS_FRAMEWORK_SNAPSHOT;
