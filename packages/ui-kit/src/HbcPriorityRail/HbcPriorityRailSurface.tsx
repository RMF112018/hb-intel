/**
 * HbcPriorityRailSurface — Priority Actions surface.
 *
 * Two presentation contexts:
 *
 * - `homepage-flagship` — a premium HB-branded vertical tile variant for
 *   explicit rail-surface embeds. It renders one flat grid with one click
 *   target per tile; sections and `featured` fields on the input contract
 *   are ignored here and `items` render in order.
 *
 * - `default` — stacked action list for admin preview and non-homepage
 *   embeds. Sections and row separators still render; public contract is
 *   unchanged for that path.
 *
 * Runtime-authority note: hosted homepage launcher rendering is governed
 * by `HbHomepageLauncherBand` + `HbcHomepageLauncher`, not this component.
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

function flattenItemsOrSections(
  items: PriorityRailActionModel[],
  sections: PriorityRailSectionModel[] | undefined,
): PriorityRailActionModel[] {
  if (items && items.length > 0) return items;
  if (!sections || sections.length === 0) return [];
  const seen = new Set<string>();
  const out: PriorityRailActionModel[] = [];
  for (const section of sections) {
    for (const action of section.actions) {
      if (seen.has(action.id)) continue;
      seen.add(action.id);
      out.push(action);
    }
  }
  return out;
}

function resolveDefaultSections(
  items: PriorityRailActionModel[],
  sections: PriorityRailSectionModel[] | undefined,
): PriorityRailSectionModel[] {
  if (sections && sections.length > 0) {
    return sections.filter((section) => section.actions.length > 0);
  }
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

  if (isFlagship) {
    const tiles = flattenItemsOrSections(items, sections);
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
              <HbcPriorityRailAction action={action} showBadge={false} compact={false} />
            </div>
          ))}
        </div>

        {hasOverflow ? (
          <div className={styles.overflowRegion} data-hbc-flagship-overflow="true">
            <HbcPriorityRailOverflow
              items={overflowItems!}
              label={overflowLabel}
              strategy={flagshipOverflowStrategy}
              showBadges={false}
            />
          </div>
        ) : null}
      </section>
    );
  }

  const resolvedSections = resolveDefaultSections(items, sections);
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
        {resolvedSections.map((section, sectionIndex) => (
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
              {section.actions.map((action, actionIndex) => (
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
        ))}
      </div>

      {hasOverflow ? (
        <HbcPriorityRailOverflow
          items={overflowItems!}
          label={overflowLabel}
          strategy={overflowStrategy}
          showBadges={showBadges}
        />
      ) : null}
    </section>
  );
}
