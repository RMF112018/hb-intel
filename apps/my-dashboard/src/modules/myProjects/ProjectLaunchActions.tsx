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

function rowHasProcoreInvalidWarning(row: MyProjectLinkItem): boolean {
  return row.warnings.some((warning) => warning.code === 'procore-project-invalid');
}

function rowHasBuildingConnectedInvalidWarning(row: MyProjectLinkItem): boolean {
  return row.warnings.some((warning) => warning.code === 'building-connected-url-invalid');
}

function rowHasDocumentCrunchInvalidWarning(row: MyProjectLinkItem): boolean {
  return row.warnings.some((warning) => warning.code === 'document-crunch-url-invalid');
}

type LaunchOptionKey = 'sharepoint' | 'procore' | 'building-connected' | 'document-crunch';

interface LaunchOptionView {
  readonly key: LaunchOptionKey;
  readonly state: 'available' | 'unavailable';
  readonly label: string;
  readonly href?: string;
  readonly ariaLabel?: string;
}

function buildOptions(row: MyProjectLinkItem): readonly LaunchOptionView[] {
  const sharePoint = row.sharePointAction;
  const procore = row.procoreAction;
  const buildingConnected = row.buildingConnectedAction;
  const documentCrunch = row.documentCrunchAction;

  const sharePointOption: LaunchOptionView =
    sharePoint.state === 'available' && sharePoint.href
      ? {
          key: 'sharepoint',
          state: 'available',
          label: sharePoint.label,
          href: sharePoint.href,
        }
      : {
          key: 'sharepoint',
          state: 'unavailable',
          label: 'SharePoint unavailable',
          ariaLabel: 'SharePoint unavailable for this project.',
        };

  const procoreInvalid = rowHasProcoreInvalidWarning(row);
  const procoreOption: LaunchOptionView =
    procore.state === 'available' && procore.href
      ? {
          key: 'procore',
          state: 'available',
          label: 'Open Procore',
          href: procore.href,
        }
      : {
          key: 'procore',
          state: 'unavailable',
          label: 'Procore unavailable',
          ariaLabel: procoreInvalid
            ? 'Procore unavailable due to invalid project token.'
            : 'Procore unavailable for this project.',
        };

  const buildingConnectedInvalid = rowHasBuildingConnectedInvalidWarning(row);
  const buildingConnectedOption: LaunchOptionView =
    buildingConnected.state === 'available' && buildingConnected.href
      ? {
          key: 'building-connected',
          state: 'available',
          label: 'Open BuildingConnected',
          href: buildingConnected.href,
        }
      : {
          key: 'building-connected',
          state: 'unavailable',
          label: 'BuildingConnected unavailable',
          ariaLabel: buildingConnectedInvalid
            ? 'BuildingConnected unavailable due to an invalid launch URL.'
            : 'BuildingConnected unavailable for this project.',
        };

  const documentCrunchInvalid = rowHasDocumentCrunchInvalidWarning(row);
  const documentCrunchOption: LaunchOptionView =
    documentCrunch.state === 'available' && documentCrunch.href
      ? {
          key: 'document-crunch',
          state: 'available',
          label: 'Open Document Crunch',
          href: documentCrunch.href,
        }
      : {
          key: 'document-crunch',
          state: 'unavailable',
          label: 'Document Crunch unavailable',
          ariaLabel: documentCrunchInvalid
            ? 'Document Crunch unavailable due to an invalid launch URL.'
            : 'Document Crunch unavailable for this project.',
        };

  return [sharePointOption, procoreOption, buildingConnectedOption, documentCrunchOption];
}

interface LaunchOptionRowProps {
  readonly option: LaunchOptionView;
  readonly onActivate?: () => void;
}

function LaunchOptionRow({ option, onActivate }: LaunchOptionRowProps) {
  if (option.state === 'available' && option.href) {
    return (
      <a
        className={`${styles.row} ${styles.rowAvailable}`}
        href={option.href}
        target="_blank"
        rel="noopener noreferrer"
        data-my-projects-launch-option={option.key}
        data-my-projects-launch-option-state="available"
        onClick={onActivate}
      >
        {option.label}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={`${styles.row} ${styles.rowUnavailable}`}
      aria-disabled="true"
      disabled
      aria-label={option.ariaLabel}
      data-my-projects-launch-option={option.key}
      data-my-projects-launch-option-state="unavailable"
    >
      {option.label}
    </button>
  );
}

interface InlineActionsProps {
  readonly options: readonly LaunchOptionView[];
}

function InlineActions({ options }: InlineActionsProps) {
  return (
    <div className={styles.inline} data-my-projects-launch-shape="inline">
      {options.map((option) => (
        <LaunchOptionRow key={option.key} option={option} />
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
              {...getFloatingProps()}
            >
              <div className={styles.drawerHandle} aria-hidden="true" />
              <p className={styles.drawerTitle}>Launch options</p>
              <div className={styles.drawerList}>
                {options.map((option) => (
                  <LaunchOptionRow key={option.key} option={option} onActivate={closeDrawer} />
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
  const options = buildOptions(row);

  if (mode !== 'phone') {
    return <InlineActions options={options} />;
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
