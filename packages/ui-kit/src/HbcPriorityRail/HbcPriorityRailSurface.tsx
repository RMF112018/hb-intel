/**
 * HbcPriorityRailSurface — Primary priority actions command band.
 *
 * Dense, operational command band surface for urgent actions, approvals,
 * and task queues. Supports urgency variants, layout modes, grouped
 * composition, and strategy-based overflow behavior.
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
  const showSectionHeaders = resolvedSections.length > 1;
  const isFlagship = context === 'homepage-flagship';

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
          const flagshipFeatured = isFlagship ? section.featured : undefined;
          const supportingActions = flagshipFeatured
            ? section.actions.filter((action) => action.id !== flagshipFeatured.id)
            : section.actions;

          return (
            <div
              key={section.key}
              className={styles.section}
              data-hbc-section={section.key}
              data-hbc-section-has-featured={flagshipFeatured ? 'true' : undefined}
              data-testid={`section-${section.key}`}
            >
              {showSectionHeaders || section.title ? (
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>{section.title ?? 'Actions'}</span>
                  <span className={styles.sectionCount}>{section.actions.length}</span>
                </div>
              ) : null}

              {flagshipFeatured ? (
                <div
                  className={styles.featured}
                  data-hbc-featured-slot="true"
                  data-hbc-featured-action={flagshipFeatured.id}
                  role="list"
                >
                  <div role="listitem">
                    <HbcPriorityRailAction
                      action={flagshipFeatured}
                      showBadge={showBadges}
                      compact={false}
                    />
                  </div>
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

      {overflowItems && overflowItems.length > 0 ? (
        <HbcPriorityRailOverflow
          items={overflowItems}
          label={overflowLabel}
          strategy={overflowStrategy}
          showBadges={showBadges}
        />
      ) : null}
    </section>
  );
}
