/**
 * HbcAiActionMenu — SF15-T05
 *
 * Global toolbar action trigger and popover for AI action discovery,
 * filtered by record type, auth role, and complexity tier.
 * Governance-aware: per-action policy evaluation via AiGovernanceApi.
 */
import { useMemo, useState, useCallback, type FC } from 'react';
import { makeStyles, shorthands } from '@griffel/react';
import {
  HBC_PRIMARY_BLUE,
  HBC_SURFACE_LIGHT,
  HBC_STATUS_RAMP_AMBER,
  HBC_STATUS_COLORS,
  HBC_SPACE_XS,
  HBC_SPACE_SM,
  HBC_RADIUS_MD,
  HBC_RADIUS_LG,
  elevationLevel2,
  Z_INDEX,
} from '@hbc/ui-kit/theme';
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

const useStyles = makeStyles({
  root: {
    position: 'relative',
    display: 'inline-block',
  },
  triggerDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  triggerEnabled: {
    cursor: 'pointer',
    opacity: 1,
  },
  popover: {
    position: 'absolute',
    top: '100%',
    left: '0',
    zIndex: Z_INDEX.popover,
    minWidth: '240px',
    ...shorthands.border('1px', 'solid', HBC_SURFACE_LIGHT['border-default']),
    borderRadius: HBC_RADIUS_LG,
    backgroundColor: HBC_SURFACE_LIGHT['surface-0'],
    boxShadow: elevationLevel2,
    paddingTop: `${HBC_SPACE_XS}px`,
    paddingBottom: `${HBC_SPACE_XS}px`,
    paddingLeft: `${HBC_SPACE_XS}px`,
    paddingRight: `${HBC_SPACE_XS}px`,
    marginTop: `${HBC_SPACE_XS}px`,
  },
  menuItem: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: '12px',
    paddingRight: '12px',
    ...shorthands.borderWidth('0'),
    backgroundColor: 'transparent',
    cursor: 'pointer',
    opacity: 1,
  },
  menuItemBlocked: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    paddingTop: `${HBC_SPACE_SM}px`,
    paddingBottom: `${HBC_SPACE_SM}px`,
    paddingLeft: '12px',
    paddingRight: '12px',
    ...shorthands.borderWidth('0'),
    backgroundColor: 'transparent',
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  itemLabel: {
    fontWeight: 500,
  },
  approvalBadge: {
    marginLeft: '6px',
    fontSize: '0.75em',
    paddingTop: '1px',
    paddingBottom: '1px',
    paddingLeft: '6px',
    paddingRight: '6px',
    borderRadius: HBC_RADIUS_MD,
    backgroundColor: HBC_STATUS_RAMP_AMBER[90],
    color: HBC_STATUS_RAMP_AMBER[10],
  },
  relevanceScore: {
    float: 'right',
    fontSize: '0.8em',
    color: HBC_SURFACE_LIGHT['text-muted'],
  },
  description: {
    display: 'block',
    fontSize: '0.85em',
    color: HBC_SURFACE_LIGHT['text-muted'],
    marginTop: '2px',
  },
  blockedNote: {
    display: 'block',
    fontSize: '0.8em',
    color: HBC_STATUS_COLORS.error,
    marginTop: '2px',
  },
});

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
  const styles = useStyles();

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
    <div data-testid="ai-action-menu" className={styles.root}>
      <button
        type="button"
        data-testid="ai-action-menu-trigger"
        disabled={menuState === 'empty'}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={menuState === 'empty' ? styles.triggerDisabled : styles.triggerEnabled}
      >
        ✨ AI Assist
      </button>

      {menuState === 'open' ? (
        <div
          data-testid="ai-action-menu-popover"
          role="menu"
          className={styles.popover}
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
                className={isBlocked ? styles.menuItemBlocked : styles.menuItem}
              >
                <span className={styles.itemLabel}>
                  {item.action.label}
                  {needsApproval ? (
                    <span
                      data-testid={`ai-action-approval-badge-${item.action.actionKey}`}
                      className={styles.approvalBadge}
                    >
                      Approval Required
                    </span>
                  ) : null}
                </span>
                <span
                  data-testid={`ai-action-relevance-${item.action.actionKey}`}
                  className={styles.relevanceScore}
                >
                  {item.action.basePriorityScore ?? 0}
                </span>
                <span className={styles.description}>
                  {item.action.description}
                </span>
                {isBlocked ? (
                  <span
                    data-testid={`ai-action-blocked-note-${item.action.actionKey}`}
                    className={styles.blockedNote}
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
