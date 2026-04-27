import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FeedSetupCalloutModel } from './feedDeskViewModel.js';
import shell from './manageShell.module.css';

export interface FeedSetupCalloutProps {
  readonly model: FeedSetupCalloutModel;
  readonly onAction: () => void;
}

export function FeedSetupCallout(props: FeedSetupCalloutProps): React.ReactNode {
  const { model } = props;
  return (
    <section
      className={shell.feedSetupCallout}
      role="region"
      aria-label="Feed Desk setup"
      data-feed-desk-callout={model.state}
    >
      <div className={shell.feedSetupCalloutText}>
        <p className={shell.feedSetupCalloutKicker}>{model.kicker}</p>
        <h3 className={shell.feedSetupCalloutHeading}>{model.heading}</h3>
        <p className={shell.feedSetupCalloutBody}>{model.body}</p>
      </div>
      <span data-feed-desk-callout-action={model.action.id}>
        <HbcButton variant="primary" onClick={props.onAction}>
          {model.action.label}
        </HbcButton>
      </span>
    </section>
  );
}
