import * as React from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import { useComplexity, type ComplexityTier } from '@hbc/complexity';
import {
  HBC_SURFACE_LIGHT,
  HBC_STATUS_RAMP_RED,
  HBC_STATUS_RAMP_GREEN,
  HBC_SPACE_SM,
  HBC_SPACE_MD,
  HBC_RADIUS_LG,
  HBC_RADIUS_MD,
  label as labelTypo,
} from '@hbc/ui-kit/theme';
import { useAcknowledgment } from '../hooks/useAcknowledgment';
import { useAcknowledgmentGate } from '../hooks/useAcknowledgmentGate';
import { HbcAcknowledgmentModal } from './HbcAcknowledgmentModal';
import { EssentialCTA } from './panel/EssentialCTA';
import { StandardPartyList } from './panel/StandardPartyList';
import { ExpertAuditTrail } from './panel/ExpertAuditTrail';
import type { IAcknowledgmentConfig, IAcknowledgmentEvent, IAcknowledgmentParty } from '../types';

// ─── Styles ──────────────────────────────────────────────────────────────────

const useStyles = makeStyles({
  panel: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    borderRadius: HBC_RADIUS_LG,
    paddingTop: `${HBC_SPACE_MD}px`,
    paddingRight: `${HBC_SPACE_MD}px`,
    paddingBottom: `${HBC_SPACE_MD}px`,
    paddingLeft: `${HBC_SPACE_MD}px`,
  },
  loading: {
    opacity: 0.6,
  },
  skeleton: {
    animationName: {
      from: { opacity: 0.4 },
      to: { opacity: 1 },
    },
    animationDuration: '1.2s',
    animationIterationCount: 'infinite',
    animationDirection: 'alternate',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  label: {
    fontFamily: labelTypo.fontFamily,
    fontSize: labelTypo.fontSize,
    fontWeight: labelTypo.fontWeight as React.CSSProperties['fontWeight'],
    lineHeight: labelTypo.lineHeight,
    letterSpacing: labelTypo.letterSpacing,
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginTop: '0',
    marginBottom: `${HBC_SPACE_SM}px`,
  },
  declineBanner: {
    backgroundColor: HBC_STATUS_RAMP_RED[90],
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_MD,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
  completionBanner: {
    backgroundColor: HBC_STATUS_RAMP_GREEN[90],
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingRight: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: `${HBC_SPACE_SM}px`,
    borderRadius: HBC_RADIUS_MD,
    color: HBC_SURFACE_LIGHT['text-primary'],
  },
});

// ─── Props ──────────────────────────────────────────────────────────────────

interface HbcAcknowledgmentPanelProps<T> {
  item: T;
  config: IAcknowledgmentConfig<T>;
  contextId: string;
  currentUserId: string;
  /** Whether the current user can interact (vs. read-only viewer). */
  canAcknowledge?: boolean;
  /** Override complexity tier for testing/Storybook. Uses useComplexity() if absent. */
  complexityTier?: ComplexityTier;
}

// ─── Inline Banners ─────────────────────────────────────────────────────────

function PanelSkeleton() {
  const styles = useStyles();
  return (
    <div className={mergeClasses(styles.panel, styles.loading)} aria-busy="true">
      <p className={styles.skeleton}>Loading acknowledgment data…</p>
    </div>
  );
}

function DeclineBlockedBanner({ events }: { events: IAcknowledgmentEvent[] }) {
  const styles = useStyles();
  const declineEvent = events.find((e) => e.status === 'declined');
  return (
    <div className={styles.declineBanner} role="alert">
      <p>
        ✗ Workflow blocked — declined by{' '}
        {declineEvent?.partyDisplayName ?? 'a party'}
        {declineEvent?.declineReason && (
          <>
            : <em>{declineEvent.declineReason}</em>
          </>
        )}
      </p>
    </div>
  );
}

function CompletionBanner({ label }: { label: string }) {
  const styles = useStyles();
  return (
    <div className={styles.completionBanner} role="status">
      <p>✓ {label} — all required sign-offs complete</p>
    </div>
  );
}

// ─── Panel ──────────────────────────────────────────────────────────────────

export function HbcAcknowledgmentPanel<T>({
  item,
  config,
  contextId,
  currentUserId,
  canAcknowledge: canAcknowledgeProp,
  complexityTier: complexityTierProp,
}: HbcAcknowledgmentPanelProps<T>) {
  const styles = useStyles();
  const { tier: contextTier } = useComplexity();
  const tier: ComplexityTier = complexityTierProp ?? contextTier;

  const { state, isLoading, isSubmitting, submit } = useAcknowledgment(
    config,
    contextId,
    currentUserId,
  );
  const gate = useAcknowledgmentGate(config, state, item, currentUserId);
  const canAct = canAcknowledgeProp ?? gate.canAcknowledge;

  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalIntent, setModalIntent] = React.useState<'acknowledge' | 'decline'>(
    'acknowledge',
  );

  const openModal = (intent: 'acknowledge' | 'decline') => {
    setModalIntent(intent);
    setModalOpen(true);
  };

  const handleConfirm = async () => {
    setModalOpen(false);
    await submit({ status: 'acknowledged' });
  };

  const handleDecline = async (reason: string, category?: string) => {
    setModalOpen(false);
    await submit({ status: 'declined', declineReason: reason, declineCategory: category });
  };

  if (isLoading) return <PanelSkeleton />;
  if (!state) return null;

  const parties: IAcknowledgmentParty[] = config.resolveParties(item);
  const promptMessage = gate.party
    ? config.resolvePromptMessage(item, gate.party)
    : '';

  return (
    <div className={styles.panel} aria-label={config.label}>
      <h3 className={styles.label}>{config.label}</h3>

      {/* Essential: CTA only (D-07) */}
      {tier === 'essential' && (
        <EssentialCTA
          state={state}
          canAct={canAct}
          isSubmitting={isSubmitting}
          onAcknowledge={() => openModal('acknowledge')}
          onDecline={config.allowDecline ? () => openModal('decline') : undefined}
        />
      )}

      {/* Standard: full party list (D-07) */}
      {tier === 'standard' && (
        <StandardPartyList
          config={config as IAcknowledgmentConfig<unknown>}
          state={state}
          parties={parties}
          currentUserId={currentUserId}
          canAct={canAct}
          isCurrentTurn={gate.isCurrentTurn}
          isSubmitting={isSubmitting}
          onAcknowledge={() => openModal('acknowledge')}
          onDecline={config.allowDecline ? () => openModal('decline') : undefined}
        />
      )}

      {/* Expert: full audit trail with timestamps + bypassed flags (D-07, D-01) */}
      {tier === 'expert' && (
        <ExpertAuditTrail
          config={config as IAcknowledgmentConfig<unknown>}
          state={state}
          parties={parties}
          currentUserId={currentUserId}
          canAct={canAct}
          isCurrentTurn={gate.isCurrentTurn}
          isSubmitting={isSubmitting}
          onAcknowledge={() => openModal('acknowledge')}
          onDecline={config.allowDecline ? () => openModal('decline') : undefined}
        />
      )}

      {/* Decline-blocked banner */}
      {state.overallStatus === 'declined' && (
        <DeclineBlockedBanner events={state.events} />
      )}

      {/* Completion banner */}
      {state.isComplete && <CompletionBanner label={config.label} />}

      <HbcAcknowledgmentModal
        isOpen={modalOpen}
        intent={modalIntent}
        promptMessage={promptMessage}
        requireConfirmationPhrase={config.requireConfirmationPhrase}
        confirmationPhrase={config.confirmationPhrase}
        allowDecline={config.allowDecline}
        declineReasons={config.declineReasons}
        onConfirm={handleConfirm}
        onDecline={handleDecline}
        onCancel={() => setModalOpen(false)}
      />
    </div>
  );
}
