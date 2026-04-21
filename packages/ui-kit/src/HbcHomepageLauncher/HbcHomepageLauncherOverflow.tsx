/**
 * HbcHomepageLauncherOverflow — Company Tools drawer.
 *
 * Grouped secondary-launcher IA:
 * tools are sectioned by launcher metadata (`groupKey`/`groupTitle`) while
 * preserving one coherent Company Tools drawer identity.
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronDown, Layers, X } from 'lucide-react';
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
} from '@floating-ui/react';
import type {
  HbcHomepageLauncherOverflowProps,
  HomepageLauncherOverflowSectionModel,
  HomepageLauncherTileModel,
} from './types.js';
import { launcherTile } from './variants.js';
import { HbcHomepageLauncherTile } from './HbcHomepageLauncherTile.js';
import styles from './homepage-launcher.module.css';

const DRAWER_CATEGORY_LABEL = 'Company Tools';
const UNGROUPED_SECTION_KEY = '__other_tools';
const UNGROUPED_SECTION_TITLE = 'Other tools';

function normalizeGroupToken(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function buildOverflowSections(
  items: readonly HomepageLauncherTileModel[],
): HomepageLauncherOverflowSectionModel[] {
  if (items.length === 0) return [];
  const grouped = new Map<string, HomepageLauncherOverflowSectionModel>();
  for (const item of items) {
    const groupKey = normalizeGroupToken(item.groupKey);
    const groupTitle = normalizeGroupToken(item.groupTitle);
    const resolvedKey = (groupKey ?? groupTitle ?? UNGROUPED_SECTION_KEY).toLowerCase();
    const resolvedTitle = groupTitle ?? groupKey ?? UNGROUPED_SECTION_TITLE;
    const existing = grouped.get(resolvedKey);
    if (existing) {
      existing.items.push(item);
      continue;
    }
    grouped.set(resolvedKey, {
      key: resolvedKey,
      title: resolvedTitle,
      items: [item],
    });
  }
  return Array.from(grouped.values()).sort((a, b) => {
    if (a.key === UNGROUPED_SECTION_KEY) return 1;
    if (b.key === UNGROUPED_SECTION_KEY) return -1;
    return a.title.localeCompare(b.title);
  });
}

function DrawerOverflow({
  items,
  sections,
  label,
  overflowMode,
  triggerMode = 'tile',
  className,
}: {
  items: HomepageLauncherTileModel[];
  sections?: HomepageLauncherOverflowSectionModel[];
  label: string;
  overflowMode?: 'sheet' | 'more-tools';
  triggerMode?: 'tile' | 'linear-handheld';
  className?: string;
}): React.JSX.Element {
  const [open, setOpen] = React.useState(false);
  const prefersReducedMotion = useReducedMotion();
  const dialogId = React.useId();
  const titleId = React.useId();
  const drawerItems = React.useMemo(() => [...items], [items]);
  const drawerSections = React.useMemo(
    () => (sections && sections.length > 0 ? sections : buildOverflowSections(drawerItems)),
    [drawerItems, sections],
  );
  const totalTools = drawerItems.length;
  const { refs, context } = useFloating({ open, onOpenChange: setOpen });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);
  const closeSheet = React.useCallback(() => setOpen(false), []);
  const handheldLinearTrigger = triggerMode === 'linear-handheld';
  const triggerLabel = handheldLinearTrigger ? 'HB Toolbox' : label;
  const resolvedOverflowMode = handheldLinearTrigger ? 'sheet' : (overflowMode ?? 'more-tools');

  const surfaceTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.26, ease: 'easeOut' as const };
  const backdropTransition = prefersReducedMotion ? { duration: 0 } : { duration: 0.2 };

  return (
    <>
      <motion.button
        ref={refs.setReference}
        type="button"
        className={clsx(
          launcherTile({ family: 'secondaryOverflowEntry' }),
          styles.overflowTile,
          !handheldLinearTrigger && resolvedOverflowMode === 'more-tools'
            ? styles.overflowTileMoreToolsDesktop
            : undefined,
          handheldLinearTrigger ? styles.overflowTileLinearHandheld : undefined,
          className,
        )}
        data-hbc-ui="homepage-launcher-overflow-trigger"
        data-hbc-homepage-launcher-overflow-variant="secondary-overflow-entry"
        data-hbc-launcher-tile-variant="secondary-overflow-entry"
        data-hbc-overflow-mode={resolvedOverflowMode}
        data-hbc-homepage-launcher-sheet-content="all-tools"
        data-hbc-launcher-tile-family="row"
        data-hbc-launcher-tile-geometry="icon-forward-square"
        data-hbc-homepage-launcher-overflow-shape={handheldLinearTrigger ? 'linear-handheld' : 'tile'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        whileHover={prefersReducedMotion ? undefined : { y: -1 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
        transition={{ duration: 0.14 }}
        {...getReferenceProps()}
      >
        <span
          className={clsx(
            handheldLinearTrigger ? styles.overflowTriggerInlineContent : undefined,
          )}
        >
          <span
            className={clsx(styles.tileIcon, styles.tileIconCompliant, styles.triggerIcon)}
            aria-hidden="true"
          >
            <Layers strokeWidth={2.2} />
          </span>
          <span className={styles.overflowTriggerLabel}>{triggerLabel}</span>
          <span
            className={clsx(
              styles.overflowTriggerCount,
              handheldLinearTrigger ? styles.overflowTriggerCountLinear : undefined,
            )}
            aria-hidden="true"
          >
            {totalTools}
          </span>
          <ChevronDown
            size={handheldLinearTrigger ? 12 : 14}
            className={handheldLinearTrigger ? styles.overflowTriggerChevronLinear : undefined}
            aria-hidden="true"
          />
        </span>
      </motion.button>
      <AnimatePresence>
        {open ? (
          <FloatingFocusManager context={context} modal returnFocus>
            <div className={styles.sheetLayer} data-hbc-homepage-launcher-sheet-root="true">
              <motion.div
                className={styles.sheetBackdrop}
                data-hbc-homepage-launcher-sheet-backdrop="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={backdropTransition}
                onClick={closeSheet}
                aria-hidden="true"
              />
              <motion.div
                id={dialogId}
                ref={refs.setFloating}
                className={clsx(
                  styles.sheetSurface,
                  !handheldLinearTrigger && resolvedOverflowMode === 'more-tools'
                    ? styles.sheetSurfaceDesktop
                    : undefined,
                )}
                initial={{ y: prefersReducedMotion ? 0 : '100%' }}
                animate={{ y: 0 }}
                exit={{ y: prefersReducedMotion ? 0 : '100%' }}
                transition={surfaceTransition}
                {...getFloatingProps()}
                aria-labelledby={titleId}
                data-hbc-homepage-launcher-sheet-content="all-tools"
                data-hbc-launcher-drawer-opaque="true"
                data-hbc-launcher-drawer-elevation="3"
                data-hbc-launcher-drawer-category="company-tools"
                data-hbc-launcher-drawer-display-class={
                  handheldLinearTrigger ? 'handheld-sheet' : 'desktop-company-tools'
                }
              >
                <header className={styles.sheetHeader}>
                  <div className={styles.sheetHeading}>
                    <span
                      id={titleId}
                      className={styles.sheetTitle}
                      data-hbc-launcher-drawer-category-label="true"
                    >
                      {DRAWER_CATEGORY_LABEL}
                    </span>
                  </div>
                  <span
                    className={styles.sheetHeaderCount}
                    aria-label={`${totalTools} tools`}
                  >
                    {totalTools}
                  </span>
                  <button
                    type="button"
                    className={styles.sheetClose}
                    onClick={closeSheet}
                    aria-label={`Close ${triggerLabel}`}
                  >
                    <X size={16} strokeWidth={2.4} aria-hidden="true" />
                  </button>
                </header>
                <div
                  className={styles.drawerBody}
                  data-hbc-ui="homepage-launcher-overflow-sections"
                >
                  {drawerSections.map((section) => (
                    <section
                      key={section.key}
                      className={styles.drawerSection}
                      data-hbc-ui="homepage-launcher-overflow-section"
                      data-hbc-overflow-category-key={section.key}
                      data-hbc-overflow-category-size={section.items.length}
                    >
                      <header className={styles.drawerSectionHeader}>
                        <h3
                          className={styles.drawerSectionTitle}
                          data-hbc-launcher-overflow-section-title="true"
                        >
                          {section.title}
                        </h3>
                        <span
                          className={styles.drawerSectionCount}
                          data-hbc-launcher-overflow-section-count="true"
                          aria-label={`${section.items.length} tools`}
                        >
                          {section.items.length}
                        </span>
                      </header>
                      <div className={styles.drawerRailRoot}>
                        <div
                          className={styles.drawerRailViewport}
                          role="region"
                          tabIndex={0}
                          aria-label={`${section.title} tools rail`}
                          data-hbc-launcher-drawer-scroll="x"
                        >
                          <div
                            className={styles.drawerTileRail}
                            data-hbc-ui="homepage-launcher-drawer-rail"
                            data-hbc-launcher-drawer-layout="compact-rail"
                            data-hbc-launcher-drawer-density={
                              handheldLinearTrigger ? 'tight' : 'compact'
                            }
                            role="list"
                            aria-label={`${section.title} tools`}
                          >
                            {section.items.map((tile) => (
                              <div key={tile.id} role="listitem" className={styles.drawerRailItem}>
                                <HbcHomepageLauncherTile
                                  tile={tile}
                                  family="drawer"
                                  className={styles.drawerTile}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
              </motion.div>
            </div>
          </FloatingFocusManager>
        ) : null}
      </AnimatePresence>
    </>
  );
}

export function HbcHomepageLauncherOverflow({
  items,
  sections,
  label = 'More tools',
  overflowMode = 'more-tools',
  triggerMode = 'tile',
  className,
}: HbcHomepageLauncherOverflowProps): React.JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <DrawerOverflow
      items={items}
      sections={sections}
      label={label}
      overflowMode={overflowMode}
      triggerMode={triggerMode}
      className={className}
    />
  );
}
