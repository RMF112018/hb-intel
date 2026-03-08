import React, { useState } from 'react';
import { useComplexity } from '@hbc/ui-kit';           // Full ui-kit — PWA/non-SPFx only
import type {
  IBicNextMoveConfig,
  IBicNextMoveState,
  IBicTransfer,
  IBicOwner,
  BicComplexityVariant,
} from '../types/IBicNextMove';
import { resolveFullBicState } from '../hooks/useBicNextMove';
import { relativeDate, resolveVariant } from './_utils';
import { HbcBicBlockedBanner } from './HbcBicBlockedBanner';

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface HbcBicDetailProps<T> {
  item: T;
  config: IBicNextMoveConfig<T>;
  /** Whether to show the previous owner + next owner chain (D-08 context) */
  showChain?: boolean;
  /** Complexity override (D-05) */
  forceVariant?: BicComplexityVariant;
  /**
   * Router-agnostic navigation callback for blocked-by cross-module links (D-09).
   * When absent, HbcBicBlockedBanner falls back to plain <a> tag.
   */
  onNavigate?: (href: string) => void;
  /** Optional blocked-by item link shown in HbcBicBlockedBanner */
  blockedByItem?: { label: string; href: string };
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Complexity tier rendering matrix (D-05)
//
// Essential: Current owner + expected action
// Standard:  + due date + HbcBicBlockedBanner if blocked
// Expert:    + previous owner + next owner + escalation owner
//            + collapsible transfer history (D-08, when resolver present)
// ─────────────────────────────────────────────────────────────────────────────

export function HbcBicDetail<T>({
  item,
  config,
  showChain = false,
  forceVariant,
  onNavigate,
  blockedByItem,
  className = '',
}: HbcBicDetailProps<T>): React.ReactElement {
  const { variant: contextVariant } = useComplexity();
  const variant = resolveVariant(forceVariant, contextVariant);
  const [historyExpanded, setHistoryExpanded] = useState(false);

  const state: IBicNextMoveState = resolveFullBicState(item, config);

  // ── D-04: Unassigned state ───────────────────────────────────────────────
  if (state.currentOwner === null) {
    return (
      <section className={`hbc-bic-detail hbc-bic-detail--unassigned ${className}`} aria-label="Next Move">
        <div className="hbc-bic-detail__unassigned-callout" role="alert">
          <span className="hbc-bic-detail__unassigned-icon" aria-hidden="true">⚠️</span>
          <div>
            <strong>This item has no current owner.</strong>
            <p>Assign one to keep it moving.</p>
          </div>
        </div>
      </section>
    );
  }

  const {
    currentOwner,
    expectedAction,
    dueDate,
    isOverdue,
    isBlocked,
    blockedReason,
    previousOwner,
    nextOwner,
    escalationOwner,
    transferHistory,
  } = state;

  return (
    <section className={`hbc-bic-detail ${className}`} aria-label="Next Move">

      {/* ── Current Owner (all variants) ───────────────────────────────── */}
      <div className="hbc-bic-detail__current">
        <OwnerChip owner={currentOwner} label="Current owner" size="large" />
        <p className="hbc-bic-detail__action">{expectedAction}</p>
      </div>

      {/* ── Due Date (Standard + Expert) ──────────────────────────────── */}
      {variant !== 'essential' && dueDate && (
        <p
          className={`hbc-bic-detail__due ${isOverdue ? 'hbc-bic-detail__due--overdue' : ''}`}
          aria-label={`Due date: ${relativeDate(dueDate)}`}
        >
          {relativeDate(dueDate)}
        </p>
      )}

      {/* ── Blocked Banner (Standard + Expert) ────────────────────────── */}
      {variant !== 'essential' && isBlocked && blockedReason && (
        <HbcBicBlockedBanner
          blockedReason={blockedReason}
          blockedByItem={blockedByItem}
          onNavigate={onNavigate}
          forceVariant={variant}
        />
      )}

      {/* ── Ownership Chain (Expert + showChain) ──────────────────────── */}
      {(variant === 'expert' || showChain) && (
        <div className="hbc-bic-detail__chain" aria-label="Ownership chain">
          {previousOwner && (
            <ChainNode owner={previousOwner} label="Previous owner" direction="from" />
          )}
          <ChainNode owner={currentOwner} label="Current owner" direction="current" />
          {nextOwner && (
            <ChainNode owner={nextOwner} label="Next owner" direction="to" />
          )}
        </div>
      )}

      {/* ── Escalation Owner (Expert only) ────────────────────────────── */}
      {variant === 'expert' && escalationOwner && dueDate && (
        <p className="hbc-bic-detail__escalation">
          Escalates to{' '}
          <strong>{escalationOwner.displayName}</strong>{' '}
          ({escalationOwner.role}) if not actioned by{' '}
          <time dateTime={dueDate}>{new Date(dueDate).toLocaleDateString()}</time>
        </p>
      )}

      {/* ── Transfer History (Expert + D-08 resolver present) ─────────── */}
      {variant === 'expert' && transferHistory.length > 0 && (
        <div className="hbc-bic-detail__history">
          <button
            className="hbc-bic-detail__history-toggle"
            aria-expanded={historyExpanded}
            onClick={() => setHistoryExpanded((v) => !v)}
          >
            {historyExpanded ? 'Hide' : 'Show'} full ownership history
            ({transferHistory.length} transfer{transferHistory.length === 1 ? '' : 's'})
          </button>
          {historyExpanded && (
            <ol className="hbc-bic-detail__history-list" aria-label="Transfer history">
              {transferHistory.map((transfer, index) => (
                <TransferRow key={index} transfer={transfer} />
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

interface OwnerChipProps {
  owner: IBicOwner;
  label: string;
  size?: 'small' | 'large';
}

function OwnerChip({ owner, label, size = 'small' }: OwnerChipProps): React.ReactElement {
  return (
    <div className={`hbc-bic-owner-chip hbc-bic-owner-chip--${size}`} aria-label={`${label}: ${owner.displayName}`}>
      <span className="hbc-bic-owner-chip__avatar" aria-hidden="true">
        {owner.displayName.charAt(0).toUpperCase()}
      </span>
      <div className="hbc-bic-owner-chip__text">
        <span className="hbc-bic-owner-chip__name">{owner.displayName}</span>
        <span className="hbc-bic-owner-chip__role">{owner.role}</span>
        {owner.groupContext && (
          <span className="hbc-bic-owner-chip__group">{owner.groupContext}</span>
        )}
      </div>
    </div>
  );
}

interface ChainNodeProps {
  owner: IBicOwner;
  label: string;
  direction: 'from' | 'current' | 'to';
}

function ChainNode({ owner, label, direction }: ChainNodeProps): React.ReactElement {
  return (
    <div className={`hbc-bic-chain-node hbc-bic-chain-node--${direction}`}>
      <span className="hbc-bic-chain-node__label">{label}</span>
      <OwnerChip owner={owner} label={label} />
      {direction !== 'to' && (
        <span className="hbc-bic-chain-node__arrow" aria-hidden="true">→</span>
      )}
    </div>
  );
}

interface TransferRowProps {
  transfer: IBicTransfer;
}

function TransferRow({ transfer }: TransferRowProps): React.ReactElement {
  return (
    <li className="hbc-bic-transfer-row">
      <time dateTime={transfer.transferredAt} className="hbc-bic-transfer-row__time">
        {new Date(transfer.transferredAt).toLocaleDateString()}
      </time>
      {transfer.fromOwner ? (
        <span>{transfer.fromOwner.displayName} → {transfer.toOwner.displayName}</span>
      ) : (
        <span>Assigned to {transfer.toOwner.displayName}</span>
      )}
      <span className="hbc-bic-transfer-row__action">{transfer.action}</span>
    </li>
  );
}
