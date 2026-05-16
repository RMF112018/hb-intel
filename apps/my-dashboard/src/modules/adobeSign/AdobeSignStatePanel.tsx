import type { AriaRole, ReactNode } from 'react';

export interface AdobeSignStatePanelProps {
  readonly title: string;
  readonly body: string;
  readonly supportingText?: string;
  readonly cta?: ReactNode;
  readonly retryAction?: ReactNode;
  readonly className?: string;
  readonly titleClassName?: string;
  readonly bodyClassName?: string;
  readonly supportingClassName?: string;
  readonly actionsClassName?: string;
  readonly statusRole?: AriaRole;
  readonly ariaLive?: 'off' | 'polite' | 'assertive';
}

export function AdobeSignStatePanel({
  title,
  body,
  supportingText,
  cta,
  retryAction,
  className,
  titleClassName,
  bodyClassName,
  supportingClassName,
  actionsClassName,
  statusRole,
  ariaLive,
}: AdobeSignStatePanelProps) {
  return (
    <section className={className} role={statusRole} aria-live={ariaLive}>
      <p className={titleClassName}>{title}</p>
      <p className={bodyClassName}>{body}</p>
      {supportingText ? <p className={supportingClassName}>{supportingText}</p> : null}
      {cta || retryAction ? (
        <div className={actionsClassName}>
          {cta}
          {retryAction}
        </div>
      ) : null}
    </section>
  );
}

export default AdobeSignStatePanel;
