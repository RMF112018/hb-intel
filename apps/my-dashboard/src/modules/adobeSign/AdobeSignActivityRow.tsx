export type AdobeSignActivityVariant = 'queue' | 'completed';

export interface AdobeSignActivityRowProps {
  readonly variant: AdobeSignActivityVariant;
  readonly title: string;
  readonly metadataParts: readonly string[];
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

  return (
    <li className={className} data-adobe-sign-activity-row="" data-adobe-sign-activity-variant={variant}>
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
      {rowErrorMessage ? (
        <p role="alert" className={metadataClassName} data-adobe-sign-row-error="">
          {rowErrorMessage}
        </p>
      ) : null}
    </li>
  );
}

export default AdobeSignActivityRow;
