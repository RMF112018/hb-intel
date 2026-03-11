/**
 * HbcAiActionMenu — SF15-T05
 *
 * Global toolbar action trigger and popover for AI action discovery,
 * filtered by record type, auth role, and complexity tier.
 * Governance-aware: per-action policy evaluation via AiGovernanceApi.
 */
import { useMemo, useState, useCallback, type FC } from 'react';
import type { ComplexityTier, IAiAssistPolicy, IAiAction, IAiActionInvokeContext } from '../types/index.js';
import { useAiActions } from '../hooks/index.js';
import { AiGovernanceApi, type IPolicyEvaluation } from '../governance/index.js';

/** Props for the AI Action Menu component. */
export interface HbcAiActionMenuProps {
  readonly record: unknown;
  readonly host: 'project-canvas-toolbar';
  readonly recordType: string;
  readonly recordId: string;
  readonly userId?: string;
  readonly currentRole: string;
  readonly complexityTier: ComplexityTier;
  readonly policyContext?: IAiAssistPolicy;
  readonly contextTags?: readonly string[];
  readonly onActionSelect?: (actionKey: string) => void;
}

interface ActionItem {
  readonly action: IAiAction;
  readonly policyDecision: IPolicyEvaluation['decision'];
  readonly policyNotes: readonly string[];
}

type MenuState = 'empty' | 'ready' | 'open';

/**
 * AI Action Menu — discovery/trigger surface for contextual AI actions.
 * Renders a trigger button and a popover listing governance-evaluated actions.
 */
export const HbcAiActionMenu: FC<HbcAiActionMenuProps> = ({
  record: _record,
  host: _host,
  recordType,
  recordId,
  userId,
  currentRole,
  complexityTier,
  policyContext,
  contextTags,
  onActionSelect,
}) => {
  const { actions } = useAiActions({
    recordType,
    recordId,
    userId,
    currentRole,
    complexityTier,
    policyContext,
    contextTags,
  });

  const [isOpen, setIsOpen] = useState(false);

  const context: IAiActionInvokeContext = useMemo(
    () => ({
      userId: userId ?? '',
      role: currentRole,
      recordType,
      recordId,
      complexity: complexityTier,
    }),
    [userId, currentRole, recordType, recordId, complexityTier],
  );

  const actionItems: readonly ActionItem[] = useMemo(() => {
    return actions.map((action) => {
      const evaluation = AiGovernanceApi.evaluatePolicy(action.actionKey, context);
      return {
        action,
        policyDecision: evaluation.decision,
        policyNotes: evaluation.notes,
      };
    });
  }, [actions, context]);

  const menuState: MenuState = useMemo(() => {
    if (actionItems.length === 0) return 'empty';
    return isOpen ? 'open' : 'ready';
  }, [actionItems.length, isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleActionClick = useCallback(
    (actionKey: string) => {
      onActionSelect?.(actionKey);
      setIsOpen(false);
    },
    [onActionSelect],
  );

  return (
    <div data-testid="ai-action-menu" style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        data-testid="ai-action-menu-trigger"
        disabled={menuState === 'empty'}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        style={{
          cursor: menuState === 'empty' ? 'not-allowed' : 'pointer',
          opacity: menuState === 'empty' ? 0.5 : 1,
        }}
      >
        ✨ AI Assist
      </button>

      {menuState === 'open' ? (
        <div
          data-testid="ai-action-menu-popover"
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            zIndex: 1000,
            minWidth: 240,
            border: '1px solid #ccc',
            borderRadius: 4,
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 4,
            marginTop: 4,
          }}
        >
          {actionItems.map((item) => {
            const isBlocked = item.policyDecision === 'blocked';
            const needsApproval = item.policyDecision === 'approval-required';

            return (
              <button
                key={item.action.actionKey}
                type="button"
                role="menuitem"
                data-testid={`ai-action-item-${item.action.actionKey}`}
                disabled={isBlocked}
                onClick={() => handleActionClick(item.action.actionKey)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  cursor: isBlocked ? 'not-allowed' : 'pointer',
                  opacity: isBlocked ? 0.5 : 1,
                }}
              >
                <span style={{ fontWeight: 500 }}>
                  {item.action.label}
                  {needsApproval ? (
                    <span
                      data-testid={`ai-action-approval-badge-${item.action.actionKey}`}
                      style={{
                        marginLeft: 6,
                        fontSize: '0.75em',
                        padding: '1px 6px',
                        borderRadius: 3,
                        background: '#fff3cd',
                        color: '#856404',
                      }}
                    >
                      Approval Required
                    </span>
                  ) : null}
                </span>
                <span
                  data-testid={`ai-action-relevance-${item.action.actionKey}`}
                  style={{ float: 'right', fontSize: '0.8em', color: '#666' }}
                >
                  {item.action.basePriorityScore ?? 0}
                </span>
                <span style={{ display: 'block', fontSize: '0.85em', color: '#666', marginTop: 2 }}>
                  {item.action.description}
                </span>
                {isBlocked ? (
                  <span
                    data-testid={`ai-action-blocked-note-${item.action.actionKey}`}
                    style={{ display: 'block', fontSize: '0.8em', color: '#dc3545', marginTop: 2 }}
                  >
                    {item.policyNotes.join('; ')}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

HbcAiActionMenu.displayName = 'HbcAiActionMenu';
