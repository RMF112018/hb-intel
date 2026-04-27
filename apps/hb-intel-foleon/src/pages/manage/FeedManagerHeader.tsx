import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FeedManagerHeaderModel } from './feedManagerViewModel.js';
import shell from './manageShell.module.css';

export interface FeedManagerHeaderProps {
  readonly model: FeedManagerHeaderModel;
}

export function FeedManagerHeader(props: FeedManagerHeaderProps): React.ReactNode {
  const { title, subtitle, primary, utility, statusChips } = props.model;
  return (
    <header className={shell.feedManagerHeader} aria-label="Foleon Feed Manager">
      <div className={shell.headerIntro}>
        <h2 className={shell.title}>{title}</h2>
        <p className={shell.subtitle}>{subtitle}</p>
      </div>
      <div className={shell.headerActions} role="group" aria-label="Header actions">
        <span data-feed-manager-primary-action={primary.id}>
          <HbcButton variant="primary" onClick={primary.onClick}>
            {primary.label}
          </HbcButton>
        </span>
        <div className={shell.utilityActions} role="group" aria-label="Utility actions">
          {utility.map((action) => (
            <span
              key={action.id}
              className={shell.utilityAction}
              data-feed-manager-utility-action={action.id}
            >
              <HbcButton
                variant="ghost"
                onClick={action.disabled ? undefined : action.onClick}
                disabled={action.disabled}
                aria-describedby={
                  action.disabled && action.disabledReason
                    ? `feed-manager-utility-reason-${action.id}`
                    : undefined
                }
              >
                {action.label}
              </HbcButton>
              {action.disabled && action.disabledReason ? (
                <span
                  id={`feed-manager-utility-reason-${action.id}`}
                  className={shell.utilityActionReason}
                >
                  {action.disabledReason}
                </span>
              ) : null}
            </span>
          ))}
        </div>
      </div>
      <div className={shell.headerChips} role="list" aria-label="Manager status">
        {statusChips.map((chip) => (
          <div key={chip.id} className={shell.statusChip} role="listitem">
            <span className={shell.statusChipLabel}>{chip.label}</span>
            <span className={shell.statusChipValue}>{chip.value}</span>
          </div>
        ))}
      </div>
    </header>
  );
}
