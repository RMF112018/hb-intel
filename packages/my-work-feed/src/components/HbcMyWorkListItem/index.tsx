/**
 * HbcMyWorkListItem — SF29-T05
 *
 * Individual work item row renderer.
 * Pure presentational — receives item and onAction as props.
 * Complexity-tier-aware rendering.
 */

import React from 'react';
import { useComplexity } from '@hbc/complexity';
import { HbcButton, HbcStatusBadge, HbcTypography, HbcPopover } from '@hbc/ui-kit';
import type { IMyWorkItem } from '../../types/index.js';
import type { IMyWorkActionRequest } from '../../hooks/useMyWorkActions.js';

export interface IHbcMyWorkListItemProps {
  item: IMyWorkItem;
  onAction?: (request: IMyWorkActionRequest) => void;
  className?: string;
}

export function HbcMyWorkListItem({
  item,
  onAction,
  className,
}: IHbcMyWorkListItemProps): JSX.Element {
  const { tier } = useComplexity();

  const primaryAction = item.availableActions[0];

  return (
    <div
      className={`hbc-my-work-list-item${className ? ` ${className}` : ''}`}
      aria-label={`Work item: ${item.title}`}
    >
      {/* Unread indicator */}
      {item.isUnread && <span className="hbc-my-work-list-item__unread-dot" aria-label="Unread" />}

      {/* Title */}
      <div className="hbc-my-work-list-item__content">
        {item.context.href ? (
          <a href={item.context.href} className="hbc-my-work-list-item__title">
            <HbcTypography intent="body">{item.title}</HbcTypography>
          </a>
        ) : (
          <HbcTypography intent="body" className="hbc-my-work-list-item__title">
            {item.title}
          </HbcTypography>
        )}

        {/* Status badges */}
        <div className="hbc-my-work-list-item__badges">
          {item.isOverdue && <HbcStatusBadge variant="error" label="Overdue" />}
          {item.isBlocked && <HbcStatusBadge variant="warning" label="Blocked" />}
        </div>

        {/* Standard tier additions */}
        {tier !== 'essential' && (
          <>
            {item.context.moduleKey && (
              <span className="hbc-my-work-list-item__module">{item.context.moduleKey}</span>
            )}
            {item.whyThisMatters && (
              <HbcTypography intent="bodySmall" className="hbc-my-work-list-item__summary">
                {item.whyThisMatters}
              </HbcTypography>
            )}
          </>
        )}

        {/* Expert tier additions */}
        {tier === 'expert' && (
          <>
            {item.expectedAction && (
              <HbcTypography intent="bodySmall" className="hbc-my-work-list-item__expected-action">
                {item.expectedAction}
              </HbcTypography>
            )}
            <HbcPopover
              trigger={
                <button
                  type="button"
                  className="hbc-my-work-list-item__reasoning-trigger"
                  aria-label="View ranking reason"
                >
                  ?
                </button>
              }
            >
              <div className="hbc-my-work-list-item__reasoning">
                <HbcTypography intent="bodySmall">
                  {item.rankingReason.primaryReason}
                </HbcTypography>
              </div>
            </HbcPopover>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="hbc-my-work-list-item__actions">
        {primaryAction && (
          <HbcButton
            variant={primaryAction.variant ?? 'primary'}
            size="sm"
            onClick={() =>
              onAction?.({ actionKey: primaryAction.key, item })
            }
          >
            {primaryAction.label}
          </HbcButton>
        )}
        {tier !== 'essential' && (
          <>
            {item.availableActions.find((a) => a.key === 'mark-read') && (
              <HbcButton
                variant="secondary"
                size="sm"
                onClick={() => onAction?.({ actionKey: 'mark-read', item })}
              >
                Mark read
              </HbcButton>
            )}
            {item.availableActions.find((a) => a.key === 'defer') && (
              <HbcButton
                variant="secondary"
                size="sm"
                onClick={() => onAction?.({ actionKey: 'defer', item })}
              >
                Defer
              </HbcButton>
            )}
          </>
        )}
      </div>
    </div>
  );
}
