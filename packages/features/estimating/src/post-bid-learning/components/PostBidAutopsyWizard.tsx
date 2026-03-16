import React, { useEffect, useMemo, useState } from 'react';
import {
  usePostBidAutopsyQueue,
  usePostBidAutopsyReview,
  usePostBidAutopsySections,
  usePostBidAutopsyState,
} from '@hbc/post-bid-autopsy';
import { HbcStepProgress, useStepWizard, type IStepWizardConfig } from '@hbc/step-wizard';
import { HbcSmartEmptyState } from '@hbc/smart-empty-state';
import type { ISmartEmptyStateConfig } from '@hbc/smart-empty-state';
import {
  HbcBanner,
  HbcButton,
  HbcCard,
  HbcCheckbox,
  HbcFormSection,
  HbcModal,
  HbcPanel,
  HbcSpinner,
  HbcStatusBadge,
  HbcTabs,
  HbcTearsheet,
  HbcTextArea,
  HbcTextField,
  HbcTypography,
} from '@hbc/ui-kit';

import { estimatingPostBidLearningProfile } from '../profiles/index.js';
import { useEstimatingPostBidLearning } from '../hooks/index.js';
import {
  type AutopsyAiSuggestion,
  type AutopsyComparatorCallout,
  type AutopsyComplexityTier,
  type AutopsyDeepLink,
  type AutopsyImpactPreview,
  type AutopsyPursuitSnapshot,
  type PostBidAutopsyWizardSubmitPayload,
  createDefaultEditingActor,
  formatOutcomeLabel,
  formatStatusLabel,
  getOwnershipLabel,
  getQueueLabel,
  hasBlockingIssues,
  toConfidenceVariant,
  toLifecycleVariant,
  toOutcomeVariant,
  toSectionDraftRecord,
} from './displayModel.js';

export interface PostBidAutopsyWizardProps {
  readonly pursuitId: string;
  readonly complexityTier?: AutopsyComplexityTier;
  readonly pursuitSnapshot?: AutopsyPursuitSnapshot;
  readonly relatedExamples?: readonly AutopsyDeepLink[];
  readonly relatedFindingLinks?: readonly AutopsyDeepLink[];
  readonly seededIntelligenceLinks?: readonly AutopsyDeepLink[];
  readonly impactPreview?: AutopsyImpactPreview | null;
  readonly aiSuggestions?: readonly AutopsyAiSuggestion[];
  readonly comparatorCallouts?: readonly AutopsyComparatorCallout[];
  readonly onSubmitForApproval?: (payload: PostBidAutopsyWizardSubmitPayload) => Promise<void> | void;
}

type WizardStepId =
  | 'outcome-context'
  | 'evidence-references'
  | 'findings-recommendations'
  | 'disagreements-approval'
  | 'impact-preview-submit';

const STEP_ORDER: readonly WizardStepId[] = [
  'outcome-context',
  'evidence-references',
  'findings-recommendations',
  'disagreements-approval',
  'impact-preview-submit',
];

const STEP_LABELS: Record<WizardStepId, string> = {
  'outcome-context': 'Outcome + estimate context',
  'evidence-references': 'Evidence and linked references',
  'findings-recommendations': 'Findings, cost impact, and recommendation',
  'disagreements-approval': 'Disagreements, approvals, and readiness',
  'impact-preview-submit': 'Benchmark impact preview and submit',
};

const layoutStyles = {
  shell: {
    display: 'grid',
    gap: '16px',
  },
  wizard: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'minmax(220px, 280px) minmax(0, 1fr)',
    alignItems: 'start',
  } satisfies React.CSSProperties,
  sidebar: {
    display: 'grid',
    gap: '12px',
  } satisfies React.CSSProperties,
  stepButton: {
    width: '100%',
    textAlign: 'left' as const,
    borderRadius: '12px',
    border: '1px solid #d0d7de',
    background: '#fff',
    padding: '12px',
    display: 'grid',
    gap: '8px',
  },
  body: {
    display: 'grid',
    gap: '16px',
  } satisfies React.CSSProperties,
  twoColumn: {
    display: 'grid',
    gap: '16px',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
  } satisfies React.CSSProperties,
  chipRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    alignItems: 'center',
  },
  list: {
    display: 'grid',
    gap: '10px',
    paddingLeft: '18px',
    margin: 0,
  } satisfies React.CSSProperties,
  linkList: {
    display: 'grid',
    gap: '8px',
  } satisfies React.CSSProperties,
};

const createStepValidationMessage = (
  stepId: WizardStepId,
  draftValues: Record<string, string>,
  blockers: readonly string[],
  approvalChecked: boolean
): string | null => {
  switch (stepId) {
    case 'outcome-context':
      return draftValues[stepId]?.trim() ? null : 'Document the estimate context before continuing.';
    case 'evidence-references':
      return draftValues[stepId]?.trim() ? null : 'Add cost and evidence references before continuing.';
    case 'findings-recommendations':
      return draftValues[stepId]?.trim() ? null : 'Capture findings and estimate recommendations before continuing.';
    case 'disagreements-approval':
      if (blockers.length > 0) {
        return 'Resolve publication blockers before continuing.';
      }
      return approvalChecked ? null : 'Explicit approval is required before publication persistence.';
    case 'impact-preview-submit':
      return approvalChecked ? null : 'Approval must remain checked before final submission.';
  }
};

const linkKey = (link: AutopsyDeepLink): string => link.linkId;

const AUTOPSY_UNAVAILABLE_CONFIG: ISmartEmptyStateConfig = {
  resolve: (context) => ({
    module: context.module,
    view: context.view,
    classification: 'truly-empty',
    heading: 'No post-bid autopsy is available',
    description: 'A pursuit must reach Won, Lost, or No-Bid before the autopsy wizard can resume.',
    coachingTip: 'Post-bid autopsies become available after a pursuit outcome is recorded.',
  }),
};

export const PostBidAutopsyWizard: React.FC<PostBidAutopsyWizardProps> = ({
  pursuitId,
  complexityTier = 'Standard',
  pursuitSnapshot,
  relatedExamples = [],
  relatedFindingLinks = [],
  seededIntelligenceLinks = [],
  impactPreview = null,
  aiSuggestions = [],
  comparatorCallouts = [],
  onSubmitForApproval,
}) => {
  const actor = useMemo(() => createDefaultEditingActor(), []);
  const primitiveState = usePostBidAutopsyState({ pursuitId });
  const sections = usePostBidAutopsySections({ pursuitId });
  const review = usePostBidAutopsyReview({ pursuitId });
  const queue = usePostBidAutopsyQueue({ pursuitId });
  const adapter = useEstimatingPostBidLearning({
    pursuitId,
    profile: estimatingPostBidLearningProfile,
  });

  const [isEssentialExpanded, setIsEssentialExpanded] = useState(complexityTier !== 'Essential');
  const [approvalChecked, setApprovalChecked] = useState(false);
  const [explainabilityOpen, setExplainabilityOpen] = useState(false);
  const [disagreementOpen, setDisagreementOpen] = useState(false);
  const [impactOpen, setImpactOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [activeAiSuggestionId, setActiveAiSuggestionId] = useState<string | null>(null);
  const [activeExpertTab, setActiveExpertTab] = useState<'diagnostics' | 'comparators'>('diagnostics');
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const nextDrafts = toSectionDraftRecord(sections.state.sections);
    setDraftValues((current) => ({ ...nextDrafts, ...current }));
  }, [sections.state.sections]);

  const validationBlockers = useMemo(
    () => [...primitiveState.publicationBlockers.blockers],
    [primitiveState.publicationBlockers.blockers]
  );

  const wizardItem = useMemo(
    () => ({
      pursuitId,
      autopsyId: primitiveState.state.autopsy?.autopsyId ?? null,
    }),
    [primitiveState.state.autopsy?.autopsyId, pursuitId]
  );

  const wizardConfig = useMemo<IStepWizardConfig<typeof wizardItem>>(
    () => ({
      title: 'Post-bid autopsy wizard',
      orderMode: 'sequential',
      allowReopen: true,
      draftKey: (item) => `estimating-post-bid-learning:${item.pursuitId}`,
      steps: STEP_ORDER.map((stepId, index) => ({
        stepId,
        label: STEP_LABELS[stepId],
        required: true,
        order: index + 1,
        resolveAssignee: () => sections.state.sections[index]?.owner ?? null,
        validate: () =>
          createStepValidationMessage(stepId, draftValues, validationBlockers, approvalChecked),
      })),
    }),
    [approvalChecked, draftValues, sections.state.sections, validationBlockers, wizardItem]
  );

  const wizard = useStepWizard(wizardConfig, wizardItem);
  const activeStepId = (wizard.state.activeStepId ?? STEP_ORDER[0]) as WizardStepId;

  const loading = primitiveState.loading || sections.loading || review.loading || queue.loading || adapter.loading;
  const error = primitiveState.error ?? sections.error ?? review.error ?? queue.error ?? adapter.error;

  if (loading && !primitiveState.state.autopsy) {
    return (
      <HbcCard header={<HbcTypography intent="heading2">Post-bid autopsy</HbcTypography>}>
        <HbcSpinner label="Loading estimating post-bid autopsy wizard..." />
      </HbcCard>
    );
  }

  if (error) {
    return (
      <HbcCard header={<HbcTypography intent="heading2">Post-bid autopsy</HbcTypography>}>
        <HbcBanner variant="error">{error}</HbcBanner>
      </HbcCard>
    );
  }

  if (!primitiveState.state.autopsy) {
    return (
      <HbcSmartEmptyState
        config={AUTOPSY_UNAVAILABLE_CONFIG}
        context={{
          module: 'estimating',
          view: 'autopsy-wizard',
          hasActiveFilters: false,
          hasPermission: true,
          isFirstVisit: false,
          currentUserRole: 'estimator',
          isLoadError: false,
        }}
        variant="inline"
      />
    );
  }

  const autopsy = primitiveState.state.autopsy;
  const stepError = wizard.getValidationError(activeStepId);
  const stepValidationMessage = createStepValidationMessage(
    activeStepId,
    draftValues,
    validationBlockers,
    approvalChecked
  );
  const queueLabel = getQueueLabel(queue.state);
  const canSubmit =
    approvalChecked &&
    !hasBlockingIssues(primitiveState.publicationBlockers, review.triage) &&
    validationBlockers.length === 0;

  const submitForApproval = async (): Promise<void> => {
    if (!canSubmit) {
      return;
    }

    await onSubmitForApproval?.({
      pursuitId,
      autopsyId: autopsy.autopsyId,
      approved: approvalChecked,
      activeStepId,
      draftValues: Object.entries(draftValues).map(([sectionKey, draftValue]) => ({
        sectionKey,
        draftValue,
      })),
    });
  };

  const handleDraftChange = async (sectionKey: string, value: string): Promise<void> => {
    setDraftValues((current) => ({ ...current, [sectionKey]: value }));
    await sections.updateSectionDraft(sectionKey, value, actor, new Date().toISOString());
  };

  const currentSuggestion = aiSuggestions.find((suggestion) => suggestion.suggestionId === activeAiSuggestionId) ?? null;

  const renderStepSidebar = () => (
    <HbcCard
      header={<HbcTypography intent="heading3">Guided flow</HbcTypography>}
      footer={<HbcStepProgress item={wizardItem} config={wizardConfig} variant="fraction" />}
    >
      <div style={layoutStyles.sidebar}>
        {wizard.state.steps.map((step) => (
          <button
            key={step.stepId}
            type="button"
            style={layoutStyles.stepButton}
            onClick={() => wizard.goTo(step.stepId)}
            aria-label={`Go to ${step.label}`}
          >
            <div style={layoutStyles.chipRow}>
              <HbcStatusBadge
                variant={step.validationError ? 'warning' : step.status === 'complete' ? 'success' : 'draft'}
                label={step.status === 'complete' ? 'Complete' : step.validationError ? 'Needs attention' : 'In progress'}
              />
              {step.assignee && (
                <HbcTypography intent="bodySmall">
                  Owner: {step.assignee.displayName}
                </HbcTypography>
              )}
            </div>
            <HbcTypography intent="heading4">{step.label}</HbcTypography>
            {step.validationError && (
              <HbcTypography intent="bodySmall">{step.validationError}</HbcTypography>
            )}
          </button>
        ))}
      </div>
    </HbcCard>
  );

  const renderOwnershipMarkers = () => (
    <HbcCard header={<HbcTypography intent="heading3">Section ownership</HbcTypography>}>
      <div style={layoutStyles.twoColumn}>
        {sections.state.sections.map((section) => (
          <div key={section.sectionKey}>
            <HbcTypography intent="label">{section.title}</HbcTypography>
            <HbcTypography intent="bodySmall">
              Avatar ownership: {getOwnershipLabel(section.owner)}
            </HbcTypography>
            <HbcStatusBadge
              variant={section.evidenceComplete ? 'success' : 'warning'}
              label={section.evidenceComplete ? 'Evidence ready' : 'Evidence incomplete'}
            />
          </div>
        ))}
      </div>
    </HbcCard>
  );

  const renderAiSuggestions = () => (
    <HbcCard header={<HbcTypography intent="heading3">Inline AI actions</HbcTypography>}>
      <div style={layoutStyles.linkList}>
        {aiSuggestions.length === 0 ? (
          <HbcTypography intent="bodySmall">
            Inline AI actions remain available when suggestion payloads are provided.
          </HbcTypography>
        ) : (
          aiSuggestions.map((suggestion) => (
            <div key={suggestion.suggestionId}>
              <div style={layoutStyles.chipRow}>
                <HbcStatusBadge variant="info" label={suggestion.action} />
                <HbcButton
                  variant="secondary"
                  onClick={() => setActiveAiSuggestionId(suggestion.suggestionId)}
                  disabled={suggestion.citations.length === 0}
                >
                  Insert suggestion
                </HbcButton>
              </div>
              <HbcTypography intent="body">{suggestion.text}</HbcTypography>
              <HbcTypography intent="bodySmall">
                {suggestion.citations.length > 0
                  ? `Source citations: ${suggestion.citations.join(', ')}`
                  : 'Source citation required before this AI suggestion can be applied.'}
              </HbcTypography>
            </div>
          ))
        )}
      </div>
    </HbcCard>
  );

  const renderStepContent = (): React.ReactElement => {
    switch (activeStepId) {
      case 'outcome-context':
        return (
          <HbcFormSection
            title="Outcome and estimate context"
            description="Resume the autopsy with scope, estimate class, and confidence framing."
          >
            <div style={layoutStyles.chipRow}>
              <HbcStatusBadge variant={toOutcomeVariant(autopsy.outcome)} label={formatOutcomeLabel(autopsy.outcome)} />
              <HbcStatusBadge variant={toLifecycleVariant(autopsy.status)} label={formatStatusLabel(autopsy.status)} />
              <HbcStatusBadge variant={toConfidenceVariant(autopsy.confidence.tier)} label={`Confidence ${autopsy.confidence.tier}`} />
            </div>
            <div style={layoutStyles.twoColumn}>
              <HbcTextField
                label="Pursuit"
                value={pursuitSnapshot?.pursuitName ?? autopsy.pursuitId}
                onChange={() => {}}
                disabled
              />
              <HbcTextField
                label="Estimate class"
                value={pursuitSnapshot?.estimateClass ?? 'Estimate class not provided'}
                onChange={() => {}}
                disabled
              />
            </div>
            <HbcTextArea
              label="Outcome narrative"
              value={draftValues['outcome-context'] ?? ''}
              onChange={(value) => {
                void handleDraftChange('outcome-context', value);
              }}
              placeholder="Summarize the estimate outcome, cost context, and what changed."
            />
            <HbcTypography intent="bodySmall">
              Confidence reasons: {autopsy.confidence.reasons.join(', ') || 'Pending confidence reasons'}
            </HbcTypography>
          </HbcFormSection>
        );
      case 'evidence-references':
        return (
          <HbcFormSection
            title="Evidence and linked references"
            description="Evidence completeness remains primitive-derived and benchmark-ready."
          >
            <HbcTextArea
              label="Evidence summary"
              value={draftValues['evidence-references'] ?? ''}
              onChange={(value) => {
                void handleDraftChange('evidence-references', value);
              }}
              placeholder="Document cost artifacts, scope assumptions, and supporting estimate references."
            />
            <div style={layoutStyles.twoColumn}>
              {sections.state.sections.map((section) => (
                <HbcCard key={section.sectionKey}>
                  <HbcTypography intent="heading4">{section.title}</HbcTypography>
                  <HbcTypography intent="bodySmall">
                    Owner: {getOwnershipLabel(section.owner)}
                  </HbcTypography>
                  <HbcStatusBadge
                    variant={section.evidenceComplete ? 'success' : 'warning'}
                    label={section.evidenceComplete ? 'Evidence complete' : 'Evidence incomplete'}
                  />
                  {section.validationErrors.length > 0 && (
                    <HbcTypography intent="bodySmall">
                      Validation: {section.validationErrors.join(', ')}
                    </HbcTypography>
                  )}
                </HbcCard>
              ))}
            </div>
          </HbcFormSection>
        );
      case 'findings-recommendations':
        return (
          <HbcFormSection
            title="Findings, root cause, and estimate recommendation"
            description="Show cost evidence, confidence reasons, and benchmark-readiness together."
          >
            <HbcTextArea
              label="Findings and recommendation"
              value={draftValues['findings-recommendations'] ?? ''}
              onChange={(value) => {
                void handleDraftChange('findings-recommendations', value);
              }}
              placeholder="Capture the primary factor, recommendation, and cost-relevant finding."
            />
            {renderAiSuggestions()}
            <HbcButton variant="ghost" onClick={() => setExplainabilityOpen(true)}>
              Open explainability panel
            </HbcButton>
            {relatedFindingLinks.length > 0 && (
              <div style={layoutStyles.linkList}>
                {relatedFindingLinks.map((link) => (
                  <AutopsyLink key={linkKey(link)} link={link} />
                ))}
              </div>
            )}
            {complexityTier === 'Expert' && comparatorCallouts.length > 0 && (
              <HbcCard header={<HbcTypography intent="heading3">Comparator callouts</HbcTypography>}>
                {comparatorCallouts.map((callout) => (
                  <div key={callout.title}>
                    <HbcTypography intent="label">{callout.title}</HbcTypography>
                    <HbcTypography intent="bodySmall">{callout.summary}</HbcTypography>
                    {callout.detail && (
                      <HbcTypography intent="bodySmall">{callout.detail}</HbcTypography>
                    )}
                  </div>
                ))}
              </HbcCard>
            )}
          </HbcFormSection>
        );
      case 'disagreements-approval':
        return (
          <HbcFormSection
            title="Disagreements, approvals, and publication readiness"
            description="Trust copy emphasizes evidence completeness, confidence, and benchmark readiness."
          >
            <div style={layoutStyles.chipRow}>
              <HbcStatusBadge
                variant={review.triage.hasOpenDisagreements ? 'warning' : 'success'}
                label={review.triage.hasOpenDisagreements ? 'Open disagreements' : 'No open disagreements'}
              />
              <HbcStatusBadge
                variant={primitiveState.publicationBlockers.publishable ? 'success' : 'warning'}
                label={primitiveState.publicationBlockers.publishable ? 'Benchmark ready' : 'Benchmark blocked'}
              />
            </div>
            <HbcCheckbox
              label="I explicitly approve publication persistence once benchmark blockers are cleared."
              checked={approvalChecked}
              onChange={setApprovalChecked}
            />
            <HbcButton variant="secondary" onClick={() => setDisagreementOpen(true)}>
              Capture disagreement or escalation
            </HbcButton>
            <ul style={layoutStyles.list}>
              {review.state.disagreements.map((disagreement) => (
                <li key={disagreement.disagreementId}>
                  <HbcTypography intent="body">
                    {disagreement.criterion}: {disagreement.summary}
                  </HbcTypography>
                </li>
              ))}
              {review.state.disagreements.length === 0 && (
                <li>
                  <HbcTypography intent="bodySmall">
                    No disagreements are currently blocking approval.
                  </HbcTypography>
                </li>
              )}
            </ul>
          </HbcFormSection>
        );
      case 'impact-preview-submit':
      default:
        return (
          <HbcFormSection
            title="Benchmark impact preview and submit"
            description="Benchmark update and seeded intelligence impacts are previewed before submission."
          >
            <HbcBanner variant={canSubmit ? 'info' : 'warning'}>
              {canSubmit
                ? 'Submission is available. Explicit approval is visible and blockers are clear.'
                : 'Submission remains blocked until approval is checked and all publication blockers are cleared.'}
            </HbcBanner>
            {impactPreview && (
              <HbcCard header={<HbcTypography intent="heading3">{impactPreview.title}</HbcTypography>}>
                <HbcTypography intent="body">{impactPreview.summary}</HbcTypography>
                {impactPreview.warning && (
                  <HbcTypography intent="bodySmall">{impactPreview.warning}</HbcTypography>
                )}
                {impactPreview.metrics && (
                  <ul style={layoutStyles.list}>
                    {impactPreview.metrics.map((metric) => (
                      <li key={metric.label}>
                        <HbcTypography intent="bodySmall">
                          {metric.label}: {metric.value}
                        </HbcTypography>
                      </li>
                    ))}
                  </ul>
                )}
              </HbcCard>
            )}
            <div style={layoutStyles.linkList}>
              {relatedExamples.map((example) => (
                <AutopsyLink key={linkKey(example)} link={example} />
              ))}
              {seededIntelligenceLinks.map((link) => (
                <AutopsyLink key={linkKey(link)} link={link} />
              ))}
            </div>
          </HbcFormSection>
        );
    }
  };

  const coreWizard = (
    <div style={layoutStyles.body} data-testid="estimating-post-bid-autopsy-wizard">
      <HbcCard
        header={
          <div style={layoutStyles.chipRow}>
            <HbcTypography intent="heading2">PostBidAutopsyWizard</HbcTypography>
            <HbcStatusBadge variant="info" label={complexityTier} />
            <HbcStatusBadge variant={toConfidenceVariant(autopsy.confidence.tier)} label={`Confidence ${autopsy.confidence.tier}`} />
            <HbcStatusBadge variant={queueLabel === 'Synced' ? 'success' : 'warning'} label={queueLabel} />
          </div>
        }
        footer={
          <div style={layoutStyles.chipRow}>
            <HbcButton
              variant="secondary"
              onClick={() => wizard.goTo(STEP_ORDER[Math.max(STEP_ORDER.indexOf(activeStepId) - 1, 0)])}
              disabled={STEP_ORDER.indexOf(activeStepId) === 0}
            >
              Back
            </HbcButton>
            <HbcButton
              variant="secondary"
              onClick={() => void wizard.markComplete(activeStepId)}
            >
              Validate step
            </HbcButton>
            <HbcButton
              variant="secondary"
              onClick={async () => {
                await wizard.markComplete(activeStepId);
                if (!stepValidationMessage) {
                  wizard.advance();
                }
              }}
              disabled={STEP_ORDER.indexOf(activeStepId) === STEP_ORDER.length - 1}
            >
              Next step
            </HbcButton>
            <HbcButton variant="primary" onClick={() => void submitForApproval()} disabled={!canSubmit}>
              Submit for approval
            </HbcButton>
          </div>
        }
      >
        <div style={layoutStyles.chipRow}>
          <HbcStatusBadge variant={toOutcomeVariant(autopsy.outcome)} label={formatOutcomeLabel(autopsy.outcome)} />
          <HbcStatusBadge variant={toLifecycleVariant(autopsy.status)} label={formatStatusLabel(autopsy.status)} />
          <HbcTypography intent="bodySmall">
            Trust indicator: {adapter.state.trustIndicator.confidenceTier ?? 'Unavailable'} / blockers {adapter.state.trustIndicator.blockerCount}
          </HbcTypography>
        </div>
        {stepError && <HbcBanner variant="warning">{stepError}</HbcBanner>}
        {validationBlockers.length > 0 && (
          <HbcBanner variant="warning">
            Publication blockers: {validationBlockers.join(', ')}
          </HbcBanner>
        )}
        <div style={complexityTier === 'Essential' ? layoutStyles.body : layoutStyles.wizard}>
          {complexityTier !== 'Essential' && renderStepSidebar()}
          <div style={layoutStyles.body}>
            {renderStepContent()}
            {renderOwnershipMarkers()}
            <HbcCard header={<HbcTypography intent="heading3">My Work placement</HbcTypography>}>
              <HbcTypography intent="bodySmall">
                Bucket: {adapter.state.myWorkPlacement.bucket}
              </HbcTypography>
              <HbcTypography intent="bodySmall">
                Avatar ownership: {adapter.state.avatarOwnership.primaryOwner ?? 'Unassigned'}
              </HbcTypography>
              <HbcTypography intent="bodySmall">
                Escalation owner: {adapter.state.avatarOwnership.escalationOwner ?? 'Not escalated'}
              </HbcTypography>
            </HbcCard>
          </div>
        </div>
      </HbcCard>
    </div>
  );

  return (
    <>
      <div style={layoutStyles.shell}>
        {complexityTier === 'Essential' && !isEssentialExpanded ? (
          <HbcCard
            header={<HbcTypography intent="heading2">Collapsed autopsy badge</HbcTypography>}
            footer={
              <HbcButton variant="primary" onClick={() => setIsEssentialExpanded(true)}>
                Resume guided autopsy
              </HbcButton>
            }
          >
            <div style={layoutStyles.chipRow}>
              <HbcStatusBadge variant={toOutcomeVariant(autopsy.outcome)} label={formatOutcomeLabel(autopsy.outcome)} />
              <HbcStatusBadge variant={toConfidenceVariant(autopsy.confidence.tier)} label={`Confidence ${autopsy.confidence.tier}`} />
              <HbcStatusBadge variant={toLifecycleVariant(autopsy.status)} label={formatStatusLabel(autopsy.status)} />
            </div>
            <HbcTypography intent="bodySmall">
              Essential mode keeps the autopsy collapsed until the estimator resumes the guided flow.
            </HbcTypography>
          </HbcCard>
        ) : (
          coreWizard
        )}
      </div>

      <HbcPanel
        open={explainabilityOpen}
        onClose={() => setExplainabilityOpen(false)}
        title="Explainability"
      >
        <HbcTypography intent="heading3">Why this recommendation</HbcTypography>
        <HbcTypography intent="bodySmall">
          Confidence reasons: {autopsy.confidence.reasons.join(', ') || 'No confidence reasons available.'}
        </HbcTypography>
        <HbcTypography intent="heading3">What changed</HbcTypography>
        <HbcTypography intent="bodySmall">
          Publication blockers: {primitiveState.publicationBlockers.blockers.join(', ') || 'No publication blockers.'}
        </HbcTypography>
      </HbcPanel>

      <HbcModal
        open={disagreementOpen}
        onClose={() => setDisagreementOpen(false)}
        title="Disagreement capture"
        footer={
          <>
            <HbcButton variant="secondary" onClick={() => setDisagreementOpen(false)}>
              Cancel
            </HbcButton>
            <HbcButton
              variant="primary"
              onClick={() => {
                void review.escalateDeadlock(new Date().toISOString(), escalationReason || 'Manual escalation requested from wizard.');
                setDisagreementOpen(false);
              }}
            >
              Escalate disagreement
            </HbcButton>
          </>
        }
      >
        <HbcTypography intent="bodySmall">
          Escalation required: {review.triage.escalationRequired ? 'Yes' : 'No'}
        </HbcTypography>
        <HbcTextArea
          label="Escalation reason"
          value={escalationReason}
          onChange={setEscalationReason}
          placeholder="Describe the disagreement and why escalation is required."
        />
      </HbcModal>

      {complexityTier === 'Expert' && impactPreview ? (
        <HbcTearsheet
          open={impactOpen}
          onClose={() => setImpactOpen(false)}
          title="Benchmark impact preview"
          steps={[
            {
              id: 'impact',
              label: 'Impact',
              content: (
                <HbcTypography intent="body">
                  {impactPreview.summary}
                </HbcTypography>
              ),
            },
          ]}
        />
      ) : (
        <HbcPanel
          open={impactOpen}
          onClose={() => setImpactOpen(false)}
          title="Benchmark impact preview"
        >
          <HbcTypography intent="body">
            {impactPreview?.summary ?? 'Impact preview becomes available when downstream projections are supplied.'}
          </HbcTypography>
          {complexityTier === 'Expert' && (
            <HbcTabs
              tabs={[
                { id: 'diagnostics', label: 'Diagnostics' },
                { id: 'comparators', label: 'Comparators' },
              ]}
              activeTabId={activeExpertTab}
              onTabChange={(tabId) => setActiveExpertTab(tabId as 'diagnostics' | 'comparators')}
              panels={[
                {
                  tabId: 'diagnostics',
                  content: (
                    <HbcTypography intent="bodySmall">
                      Benchmark hint: {impactPreview?.benchmarkHint ?? 'No benchmark hint available.'}
                    </HbcTypography>
                  ),
                },
                {
                  tabId: 'comparators',
                  content: (
                    <HbcTypography intent="bodySmall">
                      Comparator callouts: {comparatorCallouts.map((callout) => callout.title).join(', ') || 'None'}
                    </HbcTypography>
                  ),
                },
              ]}
            />
          )}
        </HbcPanel>
      )}

      {!impactOpen && (
        <div>
          <HbcButton variant="ghost" onClick={() => setImpactOpen(true)}>
            Open benchmark impact preview
          </HbcButton>
        </div>
      )}

      {currentSuggestion && (
        <HbcModal
          open
          onClose={() => setActiveAiSuggestionId(null)}
          title="Inline AI suggestion"
          footer={
            <>
              <HbcButton variant="secondary" onClick={() => setActiveAiSuggestionId(null)}>
                Close
              </HbcButton>
              <HbcButton
                variant="primary"
                onClick={() => {
                  void handleDraftChange(activeStepId, `${draftValues[activeStepId] ?? ''}\n${currentSuggestion.text}`.trim());
                  setActiveAiSuggestionId(null);
                }}
                disabled={currentSuggestion.citations.length === 0}
              >
                Insert suggestion
              </HbcButton>
            </>
          }
        >
          <HbcTypography intent="body">{currentSuggestion.text}</HbcTypography>
          <HbcTypography intent="bodySmall">
            Source citations: {currentSuggestion.citations.join(', ') || 'Source citation required'}
          </HbcTypography>
        </HbcModal>
      )}
    </>
  );
};

const AutopsyLink: React.FC<{ link: AutopsyDeepLink }> = ({ link }) => {
  if (link.href) {
    return (
      <a href={link.href} aria-label={link.label}>
        {link.label}
      </a>
    );
  }

  return (
    <button type="button" onClick={link.onClick} aria-label={link.label}>
      {link.label}
    </button>
  );
};
