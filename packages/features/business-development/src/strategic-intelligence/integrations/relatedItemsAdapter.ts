import type { IRelatedItem } from '@hbc/related-items';
import type {
  IRedactedProjection,
  IStrategicIntelligenceEntry,
} from '@hbc/strategic-intelligence';

export interface IStrategicIntelligenceRelatedItemsProjection {
  entryLinks: IRelatedItem[];
}

export const projectStrategicIntelligenceRelatedItems = (
  entries: readonly IStrategicIntelligenceEntry[],
  redacted: readonly IRedactedProjection[],
  basePath: string
): IStrategicIntelligenceRelatedItemsProjection => {
  const redactedIds = new Set(redacted.map((item) => item.entryId));

  const entryLinks: IRelatedItem[] = entries.map((entry) => {
    const isRedacted = redactedIds.has(entry.entryId);
    return {
      recordType: 'strategic-intelligence-entry',
      recordId: entry.entryId,
      label: isRedacted ? `${entry.title} (Redacted)` : entry.title,
      status: entry.lifecycleState,
      href: `${basePath}?entryId=${encodeURIComponent(entry.entryId)}`,
      moduleIcon: 'lightbulb',
      relationship: 'references',
      relationshipLabel: isRedacted ? 'Redacted strategic intelligence reference' : 'Strategic intelligence reference',
      versionChip: {
        lastChanged: entry.version.createdAt,
        author: entry.version.createdBy.displayName,
      },
    };
  });

  return { entryLinks };
};
