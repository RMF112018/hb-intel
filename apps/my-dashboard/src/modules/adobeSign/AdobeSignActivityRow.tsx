export type AdobeSignActivityVariant = 'queue' | 'completed';

export interface AdobeSignActivityRowProps {
  readonly variant: AdobeSignActivityVariant;
  readonly title: string;
  readonly metadataParts: readonly string[];
  readonly senderText?: string;
  readonly secondaryLeftText?: string;
  readonly secondaryRightText?: string;
  readonly primaryActionLabel?: string;
  readonly onPrimaryActionClick?: () => void;
  readonly primaryActionDisabled?: boolean;
  readonly fallbackViewLabel?: string;
  readonly sourceOpenUrl?: string;
  readonly rowErrorMessage?: string;
  readonly className?: string;
  readonly titleClassName?: string;
  readonly metaRowClassName?: string;
  readonly metadataClassName?: string;
  readonly actionClassName?: string;
}

export function AdobeSignActivityRow({
  variant,
  title,
  metadataParts,
  senderText,
  secondaryLeftText,
  secondaryRightText,
  primaryActionLabel,
  onPrimaryActionClick,
  primaryActionDisabled,
  fallbackViewLabel,
  sourceOpenUrl,
  rowErrorMessage,
  className,
  titleClassName,
  metaRowClassName,
  metadataClassName,
  actionClassName,
}: AdobeSignActivityRowProps) {
  const metadata = metadataParts.filter((part) => part.trim().length > 0).join(' · ');
  const queueSenderText = senderText?.trim() ? senderText : 'Adobe Sign';

  return (
    <li className={className} data-adobe-sign-activity-row="" data-adobe-sign-activity-variant={variant}>
      {variant === 'queue' ? (
        <>
          <div className={metaRowClassName} data-adobe-sign-queue-row-one="">
            <p className={titleClassName} data-adobe-sign-queue-title-line="">
              <span>{title}</span>
              <span className={metadataClassName}> received from {queueSenderText}</span>
            </p>
            {primaryActionLabel ? (
              <button
                type="button"
                className={actionClassName}
                disabled={primaryActionDisabled}
                onClick={onPrimaryActionClick}
                data-adobe-sign-row-primary-action="start"
              >
                {primaryActionLabel}
              </button>
            ) : null}
            {sourceOpenUrl ? (
              <a
                className={actionClassName}
                href={sourceOpenUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-adobe-sign-row-open-action="start"
              >
                {fallbackViewLabel ?? 'Open'}
              </a>
            ) : null}
          </div>
          {(secondaryLeftText || secondaryRightText) ? (
            <div className={metaRowClassName} data-adobe-sign-queue-row-two="">
              <p className={metadataClassName} data-adobe-sign-queue-date="">
                {secondaryLeftText ?? ''}
              </p>
              <p className={metadataClassName} data-adobe-sign-queue-required-action="">
                {secondaryRightText ?? ''}
              </p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <p className={titleClassName}>{title}</p>
          <div className={metaRowClassName}>
            <p className={metadataClassName}>{metadata}</p>
            {primaryActionLabel ? (
              <button
                type="button"
                className={actionClassName}
                disabled={primaryActionDisabled}
                onClick={onPrimaryActionClick}
                data-adobe-sign-row-primary-action="start"
              >
                {primaryActionLabel}
              </button>
            ) : null}
            {sourceOpenUrl ? (
              <a
                className={actionClassName}
                href={sourceOpenUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-adobe-sign-row-open-action="start"
              >
                {fallbackViewLabel ?? 'Open'}
              </a>
            ) : null}
          </div>
        </>
      )}
      {rowErrorMessage ? (
        <p role="alert" className={metadataClassName} data-adobe-sign-row-error="">
          {rowErrorMessage}
        </p>
      ) : null}
    </li>
  );
}

export default AdobeSignActivityRow;
