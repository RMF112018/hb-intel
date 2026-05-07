import {
  REQUIRED_PCC_EVIDENCE_IDS,
  type PccEvidenceCapturePhase,
  type PccEvidenceCategory,
  type PccEvidenceId,
  type PccEvidenceRecord,
} from './pcc-evidence.types';

function parseEvidenceNumber(id: string): number {
  return Number(id.replace('EV-', ''));
}

export function sortPccEvidenceRecords(records: readonly PccEvidenceRecord[]): PccEvidenceRecord[] {
  return [...records].sort((a, b) => parseEvidenceNumber(a.id) - parseEvidenceNumber(b.id));
}

function categoryFor(id: number): PccEvidenceCategory {
  if (id >= 37 && id <= 43) return 'governing-doctrine';
  if (id >= 44 && id <= 51) return 'mold-breaker-study';
  if (id >= 52 && id <= 58) return id === 58 ? 'package-version' : 'tenant-runtime';
  if (id >= 59 && id <= 68) return 'visual-surface';
  if (id >= 69 && id <= 76) return 'breakpoint-container';
  if (id >= 77 && id <= 84) return 'accessibility';
  if (id >= 85 && id <= 92) return 'interaction-workflow';
  if (id >= 93 && id <= 99) return 'state-model';
  if (id >= 100 && id <= 106) return 'source-of-record';
  return 'closure-reproducibility';
}

function capturePhaseFor(id: number): PccEvidenceCapturePhase {
  if (id >= 37 && id <= 51) return 'prompt-02-registry-and-manifest';
  if (id >= 52 && id <= 58) return 'live-runtime-capture';
  if (id >= 59 && id <= 76) return 'breakpoint-capture';
  if (id >= 77 && id <= 84) return 'accessibility-capture';
  if (id >= 85 && id <= 106) return 'state-capture';
  return 'final-report';
}

function statusFor(id: number): PccEvidenceRecord['status'] {
  if (id >= 37 && id <= 51) return 'foundation-ready';
  if (id >= 52 && id <= 58) return 'operator-pending';
  return 'not-started';
}

function hardStopsFor(id: number): PccEvidenceRecord['hardStopRefs'] {
  if (id >= 52 && id <= 58) return ['HS-08', 'HS-09'];
  if (id >= 77 && id <= 84) return ['HS-03'];
  if (id >= 125 && id <= 134) return ['HS-09', 'HS-10'];
  return [];
}

function titleFor(id: number): string {
  if (id >= 37 && id <= 43) return `EV-${id} Governing Doctrine Traceability Record`;
  if (id >= 44 && id <= 51) return `EV-${id} Mold Breaker Study Alignment Record`;
  if (id >= 52 && id <= 58) return `EV-${id} Tenant Runtime Evidence Contract`;
  if (id >= 59 && id <= 68) return `EV-${id} Surface Visual Evidence Contract`;
  if (id >= 69 && id <= 76) return `EV-${id} Breakpoint and Container Evidence Contract`;
  if (id >= 77 && id <= 84) return `EV-${id} Accessibility Evidence Contract`;
  if (id >= 85 && id <= 92) return `EV-${id} Interaction Workflow Evidence Contract`;
  if (id >= 93 && id <= 99) return `EV-${id} State Model Evidence Contract`;
  if (id >= 100 && id <= 106) return `EV-${id} Source-of-Record Evidence Contract`;
  return `EV-${id} Closure and Reproducibility Evidence Contract`;
}

function objectiveFor(id: number): string {
  if (id >= 37 && id <= 51) {
    return 'Define auditable evidence traceability to scorecard, doctrine, and study references before capture execution.';
  }
  if (id >= 52 && id <= 58) {
    return 'Reserve tenant-hosted runtime and package-version evidence slots with operator-reviewed capture requirements.';
  }
  if (id >= 59 && id <= 106) {
    return 'Specify reproducible capture and review requirements for surface, breakpoint, accessibility, workflow, state, and source evidence.';
  }
  return 'Define closure evidence requirements for reproducibility, hard-stop review, and Phase 4 readiness handoff.';
}

function sourceRefsFor(id: number): PccEvidenceRecord['sourceRefs'] {
  const refs: PccEvidenceRecord['sourceRefs'] = [
    {
      type: 'scorecard',
      ref: 'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard_v2.md',
    },
    { type: 'prompt', ref: 'Prompt 02 — Evidence Registry and Manifest Writer' },
  ];

  if (id <= 51) {
    refs.push(
      {
        type: 'doctrine',
        ref: 'docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md',
      },
      { type: 'study', ref: 'docs/explanation/design-decisions/con-tech-ui-study.md' },
    );
  }

  if (id >= 52 && id <= 58) {
    refs.push(
      { type: 'repo-path', ref: 'playwright.pcc-live.config.ts' },
      { type: 'repo-path', ref: 'e2e/pcc-live/pcc-live.runtime.spec.ts' },
    );
  }

  if (id >= 59 && id <= 106) {
    refs.push({ type: 'repo-path', ref: 'apps/project-control-center/src/' });
  }

  if (id >= 125) {
    refs.push({ type: 'operator', ref: 'docs/architecture/evidence/pcc-live/<run-id>/' });
  }

  return refs;
}

function artifactsFor(id: number): PccEvidenceRecord['requiredArtifacts'] {
  const base: PccEvidenceRecord['requiredArtifacts'] = [
    {
      kind: 'manifest-reference',
      description: `Manifest reference confirming EV-${id} traceability entry.`,
      requiredForCapturedStatus: true,
    },
    {
      kind: 'review-note',
      description: 'Reviewer note confirming artifact quality and scrubbed status.',
      requiredForCapturedStatus: true,
    },
  ];

  if (id >= 52 && id <= 58) {
    base.unshift({
      kind: 'console-summary',
      description: 'Sanitized runtime console/page-error summary for tenant-hosted validation.',
      requiredForCapturedStatus: true,
    });
  }

  if (id >= 59 && id <= 84) {
    base.unshift({
      kind: 'screenshot',
      description: 'Scrubbed screenshot evidence inventory linked to this EV entry.',
      requiredForCapturedStatus: true,
    });
  }

  if (id >= 125 && id <= 134) {
    base.unshift({
      kind: 'markdown-summary',
      description: 'Closure and reproducibility summary section for this EV item.',
      requiredForCapturedStatus: true,
    });
  }

  return base;
}

function createRecord(id: PccEvidenceId): PccEvidenceRecord {
  const number = parseEvidenceNumber(id);

  return {
    id,
    title: titleFor(number),
    objective: objectiveFor(number),
    pillarRefs: ['P1', 'P2'],
    hardStopRefs: hardStopsFor(number),
    evidenceCategory: categoryFor(number),
    automationLevel: number >= 125 ? 'manual-review' : 'semi-automated',
    status: statusFor(number),
    capturePhase: capturePhaseFor(number),
    requiredArtifacts: artifactsFor(number),
    reviewerNotes: '',
    sourceRefs: sourceRefsFor(number),
  };
}

export const PCC_EVIDENCE_REGISTRY: readonly PccEvidenceRecord[] = sortPccEvidenceRecords(
  REQUIRED_PCC_EVIDENCE_IDS.map((id) => createRecord(id)),
);
