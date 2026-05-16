export type AdobeSignActivityVariant = 'queue' | 'completed';

export interface AdobeSignActivityRowProps {
  readonly variant: AdobeSignActivityVariant;
  readonly title: string;
  readonly metadataParts: readonly string[];
  readonly sourceOpenUrl?: string;
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
  sourceOpenUrl,
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
        {sourceOpenUrl ? (
          <a
            className={actionClassName}
            href={sourceOpenUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-adobe-sign-row-open-action="start"
          >
            Open
          </a>
        ) : null}
      </div>
    </li>
  );
}

export default AdobeSignActivityRow;
