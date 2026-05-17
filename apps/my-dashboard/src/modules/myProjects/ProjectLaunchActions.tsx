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
  readonly isDrawerOpen: boolean;
  readonly onDrawerOpenChange: (open: boolean) => void;
}

type LaunchOptionKey = 'sharepoint' | 'procore' | 'building-connected' | 'document-crunch';
type LaunchLayout = 'single-full' | 'pair' | 'third-full' | 'two-by-two';

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

function layoutForCount(count: number): LaunchLayout {
  if (count === 1) return 'single-full';
  if (count === 2) return 'pair';
  if (count === 3) return 'third-full';
  return 'two-by-two';
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

interface InlineActionGridProps {
  readonly options: readonly LaunchOptionView[];
}

function InlineActionGrid({ options }: InlineActionGridProps) {
  if (options.length === 0) return null;
  const layout = layoutForCount(options.length);
  return (
    <div
      className={styles.grid}
      data-my-projects-launch-shape="grid"
      data-my-projects-launch-count={options.length}
      data-my-projects-launch-layout={layout}
    >
      {options.map((option) => (
        <LaunchOptionAnchor key={option.key} option={option} />
      ))}
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
  isDrawerOpen,
  onDrawerOpenChange,
}: ProjectLaunchActionsProps) {
  const { mode } = useMyWorkBentoContext();
  const options = buildAvailableOptions(row);

  if (mode !== 'phone') {
    return <InlineActionGrid options={options} />;
  }

  return (
    <DrawerActions
      options={options}
      projectName={row.projectName}
      isOpen={isDrawerOpen}
      onOpenChange={onDrawerOpenChange}
    />
  );
}

export default ProjectLaunchActions;
