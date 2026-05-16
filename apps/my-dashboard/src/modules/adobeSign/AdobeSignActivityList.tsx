import { AdobeSignActivityRow, type AdobeSignActivityVariant } from './AdobeSignActivityRow.js';

export interface AdobeSignActivityListItem {
  readonly key: string;
  readonly title: string;
  readonly metadataParts: readonly string[];
  readonly sourceOpenUrl?: string;
}

export interface AdobeSignActivityListProps {
  readonly variant: AdobeSignActivityVariant;
  readonly items: readonly AdobeSignActivityListItem[];
  readonly previewContext?: string;
  readonly listClassName?: string;
  readonly rowClassName?: string;
  readonly titleClassName?: string;
  readonly metaRowClassName?: string;
  readonly metadataClassName?: string;
  readonly actionClassName?: string;
  readonly previewClassName?: string;
}

export function AdobeSignActivityList({
  variant,
  items,
  previewContext,
  listClassName,
  rowClassName,
  titleClassName,
  metaRowClassName,
  metadataClassName,
  actionClassName,
  previewClassName,
}: AdobeSignActivityListProps) {
  return (
    <>
      <ul className={listClassName} data-adobe-sign-activity-list="" data-adobe-sign-activity-variant={variant}>
        {items.map((item) => (
          <AdobeSignActivityRow
            key={item.key}
            variant={variant}
            title={item.title}
            metadataParts={item.metadataParts}
            sourceOpenUrl={item.sourceOpenUrl}
            className={rowClassName}
            titleClassName={titleClassName}
            metaRowClassName={metaRowClassName}
            metadataClassName={metadataClassName}
            actionClassName={actionClassName}
          />
        ))}
      </ul>
      {previewContext ? (
        <p className={previewClassName} data-adobe-sign-preview-context="">
          {previewContext}
        </p>
      ) : null}
    </>
  );
}

export default AdobeSignActivityList;
