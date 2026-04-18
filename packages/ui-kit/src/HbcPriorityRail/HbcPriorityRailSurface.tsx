/**
 * HbcPriorityRailSurface — Priority Actions surface.
 *
 * Two presentation contexts:
 *
 * - `homepage-flagship` — a premium HB-branded quick-launch tile grid
 *   embedded by the wrapper-owned homepage entry stack. The surface
 *   reads as an evolution of OOB SharePoint Quick Links: compact,
 *   scannable, obviously clickable, one dominant interaction per tile,
 *   list-driven, branded. No masthead, no featured-gradient slot, no
 *   sequence index chips, no eyebrow labels, no stacked section
 *   headers, no persistent launch-chip chrome. Section / featured
 *   props on the input contract are no-ops in this context and only
 *   contribute to item ordering — the tile grid is the product.
 *
 * - `default` — generic stacked action list for admin preview and
 *   non-homepage embeds. Sections, headers, and row separators still
 *   render. The public API contract is unchanged for this path.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { Briefcase } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';
import { priorityRailSurface } from './variants.js';
import { HbcPriorityRailAction } from './HbcPriorityRailAction.js';
import { HbcPriorityRailOverflow } from './HbcPriorityRailOverflow.js';
import type {
  HbcPriorityRailSurfaceProps,
  PriorityRailActionModel,
  PriorityRailSectionModel,
  PriorityRailOverflowStrategy,
} from './types.js';
import styles from './priority-rail.module.css';

function inferSectionsFromItems(items: PriorityRailActionModel[]): PriorityRailSectionModel[] {
  if (items.length === 0) return [];

  const hasGroupMetadata = items.some((item) => item.groupKey || item.groupTitle);
  if (!hasGroupMetadata) {
    return [{ key: '__default', actions: items }];
  }

  const map = new Map<string, PriorityRailSectionModel>();

  for (const item of items) {
    const key = (item.groupKey || item.groupTitle || '__ungrouped').trim() || '__ungrouped';
    const existing = map.get(key);
    if (existing) {
      existing.actions.push(item);
      continue;
    }

    map.set(key, {
      key,
      title: item.groupTitle || (item.groupKey ? item.groupKey : undefined),
      actions: [item],
    });
  }

  return Array.from(map.values());
}

function resolveSections(
  items: PriorityRailActionModel[],
  sections: PriorityRailSectionModel[] | undefined,
): PriorityRailSectionModel[] {
  if (sections && sections.length > 0) {
    return sections.filter((section) => section.actions.length > 0);
  }

  return inferSectionsFromItems(items);
}

function flattenToTiles(
  items: PriorityRailActionModel[],
  sections: PriorityRailSectionModel[] | undefined,
): PriorityRailActionModel[] {
  if (items && items.length > 0) return items;
  if (!sections || sections.length === 0) return [];
  const flat: PriorityRailActionModel[] = [];
  const seen = new Set<string>();
  for (const section of sections) {
    for (const action of section.actions) {
      if (seen.has(action.id)) continue;
      seen.add(action.id);
      flat.push(action);
    }
  }
  return flat;
}

export function HbcPriorityRailSurface({
  title = 'Priority Actions',
  urgency = 'default',
  layout = 'rail',
  context = 'default',
  items,
  sections,
  overflowItems,
  overflowLabel = 'More tools',
  overflowStrategy = 'inline-disclosure',
  showBadges = true,
  className,
  'aria-label': ariaLabel,
}: HbcPriorityRailSurfaceProps): React.JSX.Element {
  const isFlagship = context === 'homepage-flagship';
  const hasOverflow = Boolean(overflowItems && overflowItems.length > 0);

  const renderOverflow = (
    strategy: PriorityRailOverflowStrategy = overflowStrategy,
  ): React.JSX.Element | null => {
    if (!hasOverflow) return null;
    return (
      <HbcPriorityRailOverflow
        items={overflowItems!}
        label={overflowLabel}
        strategy={strategy}
        showBadges={showBadges}
      />
    );
  };

  if (isFlagship) {
    const tiles = flattenToTiles(items, sections);
    const flagshipOverflowStrategy: PriorityRailOverflowStrategy =
      overflowStrategy === 'inline-disclosure' ? 'menu' : overflowStrategy;

    return (
      <section
        aria-label={ariaLabel ?? title}
        className={clsx(priorityRailSurface({ urgency, layout, context }), className)}
        data-hbc-premium="priority-rail"
        data-hbc-ui="priority-rail"
        data-hbc-priority-rail-context={context}
        data-hbc-flagship-layout="launcher-grid"
      >
        <div
          className={styles.launcherGrid}
          role="list"
          data-hbc-flagship-grid="true"
          data-hbc-flagship-tile-count={tiles.length}
        >
          {tiles.map((action) => (
            <div
              key={action.id}
              role="listitem"
              className={styles.launcherTileWrap}
              data-hbc-flagship-tile="true"
              data-hbc-tile-action={action.id}
            >
              <HbcPriorityRailAction action={action} showBadge={showBadges} compact={false} />
            </div>
          ))}
        </div>

        {hasOverflow ? (
          <div className={styles.overflowRegion} data-hbc-flagship-overflow="true">
            {renderOverflow(flagshipOverflowStrategy)}
          </div>
        ) : null}
      </section>
    );
  }

  const resolvedSections = resolveSections(items, sections);
  const showSectionHeaders = resolvedSections.length > 1;

  return (
    <section
      aria-label={ariaLabel ?? title}
      className={clsx(priorityRailSurface({ urgency, layout, context }), className)}
      data-hbc-premium="priority-rail"
      data-hbc-ui="priority-rail"
      data-hbc-priority-rail-context={context}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon} aria-hidden="true">
            <Briefcase size={16} strokeWidth={2} />
          </span>
          <span>{title}</span>
        </div>
      </div>

      <Separator.Root className={styles.separator} decorative />

      <div className={styles.sections}>
        {resolvedSections.map((section, sectionIndex) => {
          const supportingActions = section.actions;

          return (
            <div
              key={section.key}
              className={styles.section}
              data-hbc-section={section.key}
              data-testid={`section-${section.key}`}
            >
              {showSectionHeaders || section.title ? (
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>{section.title ?? 'Actions'}</span>
                  <span className={styles.sectionCount}>{section.actions.length}</span>
                </div>
              ) : null}

              <div className={styles.items} role="list">
                {supportingActions.map((action, actionIndex) => (
                  <React.Fragment key={action.id}>
                    {sectionIndex > 0 || actionIndex > 0 ? (
                      <Separator.Root className={styles.itemSeparator} decorative />
                    ) : null}
                    <div role="listitem">
                      <HbcPriorityRailAction
                        action={action}
                        showBadge={showBadges}
                        compact={layout === 'compact'}
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {renderOverflow()}
    </section>
  );
}
