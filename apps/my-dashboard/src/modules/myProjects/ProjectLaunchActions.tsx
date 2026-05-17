import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import { useMyWorkBentoContext } from '../../layout/MyWorkBentoGrid.js';
import styles from './ProjectLaunchActions.module.css';

export interface ProjectLaunchActionsProps {
  readonly row: MyProjectLinkItem;
  readonly isActionOverlayOpen: boolean;
  readonly onActionOverlayOpenChange: (open: boolean) => void;
}

type LaunchOptionKey = 'sharepoint' | 'procore' | 'building-connected' | 'document-crunch';

interface LaunchOptionView {
  readonly key: LaunchOptionKey;
  readonly label: string;
  readonly href: string;
  readonly ariaLabel: string;
}

function sharePointLabel(kind: MyProjectLinkItem['sharePointAction']['kind']): string {
  return kind === 'legacy-folder' ? 'SharePoint Folder' : 'SharePoint Site';
}

function buildAvailableOptions(row: MyProjectLinkItem): readonly LaunchOptionView[] {
  const options: LaunchOptionView[] = [];
  const projectName = row.projectName;

  const sharePoint = row.sharePointAction;
  if (sharePoint.state === 'available' && sharePoint.href) {
    const label = sharePointLabel(sharePoint.kind);
    options.push({
      key: 'sharepoint',
      label,
      href: sharePoint.href,
      ariaLabel: `Open ${label} for ${projectName}`,
    });
  }

  const procore = row.procoreAction;
  if (procore.state === 'available' && procore.href) {
    options.push({
      key: 'procore',
      label: 'Procore',
      href: procore.href,
      ariaLabel: `Open Procore for ${projectName}`,
    });
  }

  const buildingConnected = row.buildingConnectedAction;
  if (buildingConnected.state === 'available' && buildingConnected.href) {
    options.push({
      key: 'building-connected',
      label: 'BuildingConnected',
      href: buildingConnected.href,
      ariaLabel: `Open BuildingConnected for ${projectName}`,
    });
  }

  const documentCrunch = row.documentCrunchAction;
  if (documentCrunch.state === 'available' && documentCrunch.href) {
    options.push({
      key: 'document-crunch',
      label: 'Document Crunch',
      href: documentCrunch.href,
      ariaLabel: `Open Document Crunch for ${projectName}`,
    });
  }

  return options;
}

export function hasAvailableLaunchActions(row: MyProjectLinkItem): boolean {
  return buildAvailableOptions(row).length > 0;
}

interface SplitDesktopOptions {
  readonly primaryVisibleOptions: readonly LaunchOptionView[];
  readonly overflowOptions: readonly LaunchOptionView[];
}

function splitAvailableOptionsForDesktopRail(
  allAvailableOptions: readonly LaunchOptionView[],
): SplitDesktopOptions {
  return {
    primaryVisibleOptions: allAvailableOptions.slice(0, 2),
    overflowOptions: allAvailableOptions.slice(2),
  };
}

interface LaunchOptionAnchorProps {
  readonly option: LaunchOptionView;
  readonly onActivate?: () => void;
}

function LaunchOptionAnchor({ option, onActivate }: LaunchOptionAnchorProps) {
  return (
    <a
      className={`${styles.row} ${styles.rowAvailable}`}
      href={option.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={option.ariaLabel}
      data-my-projects-launch-option={option.key}
      data-my-projects-launch-option-state="available"
      onClick={onActivate}
    >
      {option.label}
    </a>
  );
}

interface InlineActionRailProps {
  readonly primaryVisibleOptions: readonly LaunchOptionView[];
  readonly overflowOptions: readonly LaunchOptionView[];
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function InlineOverflowMenu({
  overflowOptions,
  isOpen,
  onOpenChange,
}: {
  readonly overflowOptions: readonly LaunchOptionView[];
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'menu' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  if (overflowOptions.length === 0) return null;

  const closeMenu = () => onOpenChange(false);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={styles.moreResourcesTrigger}
        aria-haspopup="menu"
        aria-expanded={isOpen ? 'true' : 'false'}
        data-my-projects-more-resources-trigger=""
        {...getReferenceProps()}
      >
        More Resources · {overflowOptions.length}
      </button>
      {isOpen ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal returnFocus>
            <div
              ref={refs.setFloating}
              className={styles.moreResourcesMenu}
              data-my-projects-more-resources-menu=""
              {...getFloatingProps()}
            >
              {overflowOptions.map((option) => (
                <a
                  key={option.key}
                  className={styles.moreResourcesOption}
                  href={option.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={option.ariaLabel}
                  data-my-projects-more-resource-option={option.key}
                  data-my-projects-launch-option-state="available"
                  onClick={closeMenu}
                >
                  {option.label}
                </a>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  );
}

function InlineActionRail({
  primaryVisibleOptions,
  overflowOptions,
  isOpen,
  onOpenChange,
}: InlineActionRailProps) {
  if (primaryVisibleOptions.length === 0 && overflowOptions.length === 0) return null;
  return (
    <div
      className={styles.rail}
      data-my-projects-launch-shape="rail"
      data-my-projects-primary-action-count={primaryVisibleOptions.length}
      data-my-projects-overflow-action-count={overflowOptions.length}
    >
      {primaryVisibleOptions.map((option) => (
        <LaunchOptionAnchor key={option.key} option={option} />
      ))}
      <InlineOverflowMenu
        overflowOptions={overflowOptions}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    </div>
  );
}

interface DrawerActionsProps {
  readonly options: readonly LaunchOptionView[];
  readonly projectName: string;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function DrawerActions({ options, projectName, isOpen, onOpenChange }: DrawerActionsProps) {
  const { refs, context } = useFloating({
    open: isOpen,
    onOpenChange,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  if (options.length === 0) return null;

  const closeDrawer = () => onOpenChange(false);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-label={`Open launch options for ${projectName}`}
        data-my-projects-launch-trigger=""
        {...getReferenceProps()}
      >
        Open launch options
      </button>
      {isOpen ? (
        <FloatingPortal>
          <div className={styles.drawerBackdrop} aria-hidden="true" />
          <FloatingFocusManager context={context} modal initialFocus={0}>
            <div
              ref={refs.setFloating}
              className={styles.drawer}
              data-my-projects-launch-shape="drawer"
              data-my-projects-launch-drawer=""
              data-my-projects-launch-count={options.length}
              {...getFloatingProps()}
            >
              <div className={styles.drawerHandle} aria-hidden="true" />
              <p className={styles.drawerTitle}>Launch options</p>
              <div className={styles.drawerList}>
                {options.map((option) => (
                  <LaunchOptionAnchor key={option.key} option={option} onActivate={closeDrawer} />
                ))}
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  );
}

export function ProjectLaunchActions({
  row,
  isActionOverlayOpen,
  onActionOverlayOpenChange,
}: ProjectLaunchActionsProps) {
  const { mode } = useMyWorkBentoContext();
  const allAvailableOptions = buildAvailableOptions(row);

  if (mode !== 'phone') {
    const { primaryVisibleOptions, overflowOptions } =
      splitAvailableOptionsForDesktopRail(allAvailableOptions);
    return (
      <InlineActionRail
        primaryVisibleOptions={primaryVisibleOptions}
        overflowOptions={overflowOptions}
        isOpen={isActionOverlayOpen}
        onOpenChange={onActionOverlayOpenChange}
      />
    );
  }

  return (
    <DrawerActions
      options={allAvailableOptions}
      projectName={row.projectName}
      isOpen={isActionOverlayOpen}
      onOpenChange={onActionOverlayOpenChange}
    />
  );
}

export default ProjectLaunchActions;
