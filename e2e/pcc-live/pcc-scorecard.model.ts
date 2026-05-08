import {
  type PccHardStopId,
  type PccHardStopModel,
  type PccScorecardPillarId,
  type PccScorecardPillarModel,
} from './pcc-scorecard.types';

export const PCC_SCORECARD_PILLARS: readonly PccScorecardPillarModel[] = [
  {
    id: 'P1',
    title: 'PCC Product Strategy and Command-Center Clarity',
    weight: 15,
    purpose: 'Validate command-center product intent and first-glance operational clarity.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P1',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'P2',
    title: 'Construction-Tech Mold Breaker Differentiation',
    weight: 20,
    purpose:
      'Assess whether PCC breaks incumbent construction-tech interaction and information patterns.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P2',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'P3',
    title: 'Shell, Navigation, and Project Context',
    weight: 12,
    purpose: 'Assess shell cohesion, navigation clarity, and project-context continuity.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P3',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'P4',
    title: 'Layout, Bento, Card Hierarchy, and Density',
    weight: 12,
    purpose: 'Assess bento/card hierarchy, density control, and layout signal prioritization.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P4',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'P5',
    title: 'Workflow, Interaction, and Next-Action Clarity',
    weight: 12,
    purpose:
      'Assess action clarity, progression confidence, and interaction cues for operational workflows.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P5',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'P6',
    title: 'State Model, Read-Only, Preview, Degraded, and Source Confidence',
    weight: 10,
    purpose:
      'Assess state distinction integrity and source-confidence communication under degraded/read-only conditions.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P6',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'P7',
    title: 'Responsive, Field, Touch, and Host-Fit Behavior',
    weight: 8,
    purpose: 'Assess field-context usability, responsive behavior, and SharePoint-host fit.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P7',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'P8',
    title: 'Accessibility, Visual Semantics, and Inclusive Use',
    weight: 6,
    purpose: 'Assess accessibility conformance, semantics, and inclusive interaction support.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P8',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'P9',
    title: 'Evidence, Validation, and Phase 4 Readiness',
    weight: 5,
    purpose:
      'Assess reproducible evidence coverage and validation quality for Phase 4 review readiness.',
    manualScoringRequired: true,
    scorecardSectionRef: 'P9',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
];

export const PCC_HARD_STOPS: readonly PccHardStopModel[] = [
  {
    id: 'HS-01',
    title: 'Incumbent mimicry failure',
    failure:
      'PCC reproduces dense, module-heavy construction-tech UX patterns without meaningful improvement.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-01',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-02',
    title: 'Command-center failure',
    failure: 'Users cannot quickly identify status, risk, priority, and next action.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-02',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-03',
    title: 'Cognitive-overload failure',
    failure: 'Equal-weight signals overwhelm prioritization and impede operational comprehension.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-03',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-04',
    title: 'False-affordance failure',
    failure: 'Read-only, preview, deferred, or unavailable controls appear executable.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-04',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-05',
    title: 'Field-office divergence failure',
    failure: 'PCC materially degrades on tablet, touch, high-zoom, or constrained field contexts.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-05',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-06',
    title: 'State-model failure',
    failure:
      'State distinctions are not reliable across live/mock/read-only/stale/degraded/deferred/unauthorized scenarios.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-06',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-07',
    title: 'Accessibility failure',
    failure: 'Keyboard, focus, contrast, target size, or semantics block primary usage.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-07',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-08',
    title: 'SharePoint host-fit failure',
    failure: 'PCC conflicts with SharePoint chrome or fails hosted runtime expectations.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-08',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-09',
    title: 'Evidence failure',
    failure:
      'Score claims are unsupported by reproducible source, visual, runtime, accessibility, and validation evidence.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-09',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
  {
    id: 'HS-10',
    title: 'HBI authority failure',
    failure:
      'HBI appears to approve, reject, mutate, or certify beyond intended authority boundaries.',
    blocksPhase4: true,
    manualReviewRequired: true,
    scorecardSectionRef: 'HS-10',
    sourceRefs: [
      'docs/reference/spfx-surfaces/project-control-center/PCC_100_Point_UIUX_Mold_Breaker_Scorecard.md',
    ],
  },
];

export function getPccScorecardPillarById(
  id: PccScorecardPillarId,
): PccScorecardPillarModel | undefined {
  return PCC_SCORECARD_PILLARS.find((pillar) => pillar.id === id);
}

export function getPccHardStopById(id: PccHardStopId): PccHardStopModel | undefined {
  return PCC_HARD_STOPS.find((hardStop) => hardStop.id === id);
}

export function getPccTotalScorecardWeight(): number {
  return PCC_SCORECARD_PILLARS.reduce((sum, pillar) => sum + pillar.weight, 0);
}
