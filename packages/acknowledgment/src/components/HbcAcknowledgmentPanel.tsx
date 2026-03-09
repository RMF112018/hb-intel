import * as React from 'react';
import { useComplexity, type ComplexityTier } from '@hbc/complexity';
import { useAcknowledgment } from '../hooks/useAcknowledgment';
import { useAcknowledgmentGate } from '../hooks/useAcknowledgmentGate';
import { HbcAcknowledgmentModal } from './HbcAcknowledgmentModal';
import { EssentialCTA } from './panel/EssentialCTA';
import { StandardPartyList } from './panel/StandardPartyList';
import { ExpertAuditTrail } from './panel/ExpertAuditTrail';
import type { IAcknowledgmentConfig, IAcknowledgmentEvent, IAcknowledgmentParty } from '../types';

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
  return (
    <div className="hbc-ack-panel hbc-ack-panel--loading" aria-busy="true">
      <p className="hbc-ack-panel__skeleton">Loading acknowledgment data…</p>
    </div>
  );
}

function DeclineBlockedBanner({ events }: { events: IAcknowledgmentEvent[] }) {
  const declineEvent = events.find((e) => e.status === 'declined');
  return (
    <div className="hbc-ack-panel__decline-banner" role="alert">
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
  return (
    <div className="hbc-ack-panel__completion-banner" role="status">
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
    <div className="hbc-ack-panel" aria-label={config.label}>
      <h3 className="hbc-ack-panel__label">{config.label}</h3>

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
