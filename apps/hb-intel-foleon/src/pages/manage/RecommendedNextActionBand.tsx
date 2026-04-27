import { HbcButton } from '@hbc/ui-kit/homepage';
import type { RecommendedNextAction } from './recommendedNextAction.js';
import shell from './manageShell.module.css';

export interface RecommendedNextActionBandProps {
  readonly action: RecommendedNextAction;
  readonly onActivate: (action: RecommendedNextAction) => void;
}

export function RecommendedNextActionBand(
  props: RecommendedNextActionBandProps,
): React.ReactNode {
  return (
    <section
      className={shell.recommendedNextAction}
      role="region"
      aria-label="Recommended next action"
      data-action-id={props.action.id}
    >
      <p className={shell.recommendedNextActionHeadline}>{props.action.headline}</p>
      {props.action.cta ? (
        <HbcButton
          variant="primary"
          onClick={(): void => props.onActivate(props.action)}
        >
          {props.action.cta}
        </HbcButton>
      ) : null}
    </section>
  );
}
