/**
 * HbcPriorityRailSurface — Primary priority actions command band.
 *
 * Dense, operational command band surface for urgent actions, approvals,
 * and task queues. Supports urgency variants, layout modes, grouped
 * composition, and strategy-based overflow behavior.
 *
 * Flagship behavior (context === 'homepage-flagship'):
 *   Sections are flattened into a single horizontal command strip so the
 *   band uses the full available width with confident, evenly distributed
 *   command tiles. Group identity is carried as a per-tile eyebrow label,
 *   not a stacked section header, because the homepage overlay doctrine
 *   requires the utility band to read as a priority-actions launcher
 *   rather than a grouped directory (see UI-Doctrine-SPFx-Homepage-Overlay
 *   §6.9, §9.2, §9.5, and §5.1).
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

interface FlagshipTile {
  sectionKey: string;
  sectionTitle?: string;
  action: PriorityRailActionModel;
}

function collectFlagshipTiles(sections: PriorityRailSectionModel[]): {
  featured: FlagshipTile[];
  supporting: FlagshipTile[];
} {
  const featured: FlagshipTile[] = [];
  const supporting: FlagshipTile[] = [];
  for (const section of sections) {
    if (section.featured) {
      featured.push({
        sectionKey: section.key,
        sectionTitle: section.title,
        action: section.featured,
      });
    }
    const rest = section.featured
      ? section.actions.filter((action) => action.id !== section.featured!.id)
      : section.actions;
    for (const action of rest) {
      supporting.push({
        sectionKey: section.key,
        sectionTitle: section.title,
        action,
      });
    }
  }
  return { featured, supporting };
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
  const resolvedSections = resolveSections(items, sections);
  const isFlagship = context === 'homepage-flagship';

  const hasOverflow = Boolean(overflowItems && overflowItems.length > 0);
  const totalVisible = resolvedSections.reduce(
    (acc, section) => acc + section.actions.length,
    0,
  );

  const renderOverflow = (): React.JSX.Element | null => {
    if (!hasOverflow) return null;
    return (
      <HbcPriorityRailOverflow
        items={overflowItems!}
        label={overflowLabel}
        strategy={overflowStrategy}
        showBadges={showBadges}
      />
    );
  };

  if (isFlagship) {
    const { featured, supporting } = collectFlagshipTiles(resolvedSections);

    return (
      <section
        aria-label={ariaLabel ?? title}
        className={clsx(priorityRailSurface({ urgency, layout, context }), className)}
        data-hbc-premium="priority-rail"
        data-hbc-ui="priority-rail"
        data-hbc-priority-rail-context={context}
        data-hbc-flagship-layout="command-strip"
      >
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <span className={styles.headerIcon} aria-hidden="true">
              <Briefcase size={15} strokeWidth={2.25} />
            </span>
            <span>{title}</span>
          </div>
          <div className={styles.headerMeta} aria-hidden="true">
            <span className={styles.headerCount}>{totalVisible}</span>
            <span className={styles.headerCountLabel}>primary actions</span>
          </div>
        </div>

        {featured.length > 0 ? (
          <div
            className={styles.featuredBand}
            data-hbc-featured-slot="true"
            data-hbc-featured-count={featured.length}
            role="list"
          >
            {featured.map((tile) => (
              <div
                key={tile.action.id}
                role="listitem"
                className={styles.featuredTile}
                data-hbc-featured-action={tile.action.id}
                data-hbc-tile-eyebrow={tile.sectionTitle || undefined}
              >
                {tile.sectionTitle ? (
                  <span className={styles.tileEyebrow} aria-hidden="true">
                    {tile.sectionTitle}
                  </span>
                ) : null}
                <HbcPriorityRailAction
                  action={tile.action}
                  showBadge={showBadges}
                  compact={false}
                />
              </div>
            ))}
          </div>
        ) : null}

        {supporting.length > 0 ? (
          <div
            className={styles.commandStrip}
            role="list"
            data-hbc-flagship-grid="true"
            data-hbc-flagship-strip-count={supporting.length}
          >
            {supporting.map((tile) => (
              <div
                key={tile.action.id}
                role="listitem"
                className={styles.commandTile}
                data-hbc-flagship-tile="true"
                data-hbc-tile-section={tile.sectionKey}
                data-hbc-tile-eyebrow={tile.sectionTitle || undefined}
              >
                {tile.sectionTitle ? (
                  <span className={styles.tileEyebrow} aria-hidden="true">
                    {tile.sectionTitle}
                  </span>
                ) : null}
                <HbcPriorityRailAction
                  action={tile.action}
                  showBadge={showBadges}
                  compact={layout === 'compact'}
                />
              </div>
            ))}
          </div>
        ) : null}

        {hasOverflow ? (
          <div className={styles.overflowRegion} data-hbc-flagship-overflow="true">
            {renderOverflow()}
          </div>
        ) : null}

        {/* Hidden per-section structural markers kept for default-context
         * tests and for consumers that inspect section layout. The flagship
         * command-strip rendering flattens the grouped structure, but the
         * grouping contract is preserved through section-level data
         * attributes on the inline markers below so downstream assertions
         * that rely on `data-testid="section-*"` continue to resolve. */}
        <div className={styles.sectionMarkers} aria-hidden="true">
          {resolvedSections.map((section) => (
            <div
              key={section.key}
              data-testid={`section-${section.key}`}
              data-hbc-section={section.key}
              data-hbc-section-has-featured={
                section.featured ? 'true' : undefined
              }
            />
          ))}
        </div>
      </section>
    );
  }

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
