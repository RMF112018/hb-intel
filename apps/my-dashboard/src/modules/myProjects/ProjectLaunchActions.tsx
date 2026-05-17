import {
  FloatingFocusManager,
  FloatingPortal,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useRef } from 'react';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import { useMyWorkBentoContext } from '../../layout/MyWorkBentoGrid.js';
import { MY_WORK_THEME_VARS } from '../../shell/myWorkTheme.js';
import {
  buildMyProjectLaunchPresentation,
  type LaunchOptionView,
  type MyProjectLaunchPresentation,
} from './myProjectLaunchPresentation.js';
import styles from './ProjectLaunchActions.module.css';

export interface ProjectLaunchActionsProps {
  readonly presentation: MyProjectLaunchPresentation;
  readonly projectName: string;
  readonly isLaunchOptionsOpen: boolean;
  readonly onLaunchOptionsOpenChange: (open: boolean) => void;
  readonly moreResourcesPanelId: string;
  readonly onMoreResourcesTriggerReady: (node: HTMLButtonElement | null) => void;
}

export function hasAvailableLaunchActions(row: MyProjectLinkItem): boolean {
  return buildMyProjectLaunchPresentation(row).hasAvailableLaunchActions;
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
  readonly moreResourcesPanelId: string;
  readonly onMoreResourcesTriggerReady: (node: HTMLButtonElement | null) => void;
}

function InlineActionRail({
  primaryVisibleOptions,
  overflowOptions,
  isOpen,
  onOpenChange,
  moreResourcesPanelId,
  onMoreResourcesTriggerReady,
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
      {overflowOptions.length > 0 ? (
        <button
          ref={onMoreResourcesTriggerReady}
          type="button"
          className={styles.moreResourcesTrigger}
          aria-expanded={isOpen ? 'true' : 'false'}
          aria-controls={moreResourcesPanelId}
          aria-label={`Toggle additional project resources (${overflowOptions.length})`}
          data-my-projects-more-resources-trigger=""
          onClick={() => onOpenChange(!isOpen)}
        >
          More Resources · {overflowOptions.length}
        </button>
      ) : null}
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
          <div
            className={styles.themedPortalRoot}
            style={MY_WORK_THEME_VARS}
            data-my-work-themed-portal="launch-drawer"
          >
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
          </div>
        </FloatingPortal>
      ) : null}
    </>
  );
}

export function ProjectLaunchActions({
  presentation,
  projectName,
  isLaunchOptionsOpen,
  onLaunchOptionsOpenChange,
  moreResourcesPanelId,
  onMoreResourcesTriggerReady,
}: ProjectLaunchActionsProps) {
  const { mode } = useMyWorkBentoContext();
  const releaseRef = useRef(onMoreResourcesTriggerReady);
  releaseRef.current = onMoreResourcesTriggerReady;
  const attachTriggerRef = (node: HTMLButtonElement | null) => {
    releaseRef.current(node);
  };

  if (mode !== 'phone') {
    return (
      <InlineActionRail
        primaryVisibleOptions={presentation.primaryVisibleOptions}
        overflowOptions={presentation.overflowOptions}
        isOpen={isLaunchOptionsOpen}
        onOpenChange={onLaunchOptionsOpenChange}
        moreResourcesPanelId={moreResourcesPanelId}
        onMoreResourcesTriggerReady={attachTriggerRef}
      />
    );
  }

  return (
    <DrawerActions
      options={presentation.allAvailableOptions}
      projectName={projectName}
      isOpen={isLaunchOptionsOpen}
      onOpenChange={onLaunchOptionsOpenChange}
    />
  );
}

export default ProjectLaunchActions;
