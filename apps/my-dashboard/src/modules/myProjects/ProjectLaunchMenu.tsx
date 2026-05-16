import { useRef, useState } from 'react';
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useListNavigation,
  useRole,
} from '@floating-ui/react';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import styles from './ProjectLaunchMenu.module.css';

export interface ProjectLaunchMenuProps {
  readonly row: MyProjectLinkItem;
  readonly isOpen: boolean;
  readonly onOpenChange: (open: boolean) => void;
}

function rowHasProcoreInvalidWarning(row: MyProjectLinkItem): boolean {
  return row.warnings.some((warning) => warning.code === 'procore-project-invalid');
}

interface MenuOptionView {
  readonly key: 'sharepoint' | 'procore';
  readonly state: 'available' | 'unavailable';
  readonly label: string;
  readonly href?: string;
  readonly ariaLabel?: string;
}

function buildOptions(row: MyProjectLinkItem): readonly MenuOptionView[] {
  const sharePoint = row.sharePointAction;
  const procore = row.procoreAction;

  const sharePointOption: MenuOptionView =
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
  const procoreOption: MenuOptionView =
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

  return [sharePointOption, procoreOption];
}

export function ProjectLaunchMenu({ row, isOpen, onOpenChange }: ProjectLaunchMenuProps) {
  const options = buildOptions(row);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const listRef = useRef<Array<HTMLElement | null>>([]);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange,
    placement: 'bottom-end',
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context, { event: 'click' });
  const dismiss = useDismiss(context, { escapeKey: true, outsidePress: true });
  const role = useRole(context, { role: 'menu' });

  const disabledIndices = options
    .map((option, index) => (option.state === 'unavailable' ? index : -1))
    .filter((index) => index >= 0);

  const listNavigation = useListNavigation(context, {
    listRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
    focusItemOnOpen: 'auto',
    disabledIndices,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    click,
    dismiss,
    role,
    listNavigation,
  ]);

  const closeMenu = () => onOpenChange(false);

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-label={`Open launch options for ${row.projectName}`}
        data-my-projects-launch-trigger=""
        {...getReferenceProps()}
      >
        Open
      </button>

      {isOpen ? (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={0}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className={styles.menu}
              data-my-projects-launch-menu=""
              {...getFloatingProps()}
            >
              {options.map((option, index) => {
                const itemProps = getItemProps({
                  ref(node) {
                    listRef.current[index] = node;
                  },
                });
                if (option.state === 'available' && option.href) {
                  return (
                    <a
                      key={option.key}
                      role="menuitem"
                      tabIndex={activeIndex === index ? 0 : -1}
                      href={option.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.menuItem} ${styles.menuItemAvailable}`}
                      data-my-projects-launch-option={option.key}
                      data-my-projects-launch-option-state="available"
                      onClick={closeMenu}
                      {...itemProps}
                    >
                      {option.label}
                    </a>
                  );
                }
                return (
                  <button
                    key={option.key}
                    type="button"
                    role="menuitem"
                    tabIndex={activeIndex === index ? 0 : -1}
                    aria-disabled="true"
                    disabled
                    aria-label={option.ariaLabel}
                    className={`${styles.menuItem} ${styles.menuItemUnavailable}`}
                    data-my-projects-launch-option={option.key}
                    data-my-projects-launch-option-state="unavailable"
                    {...itemProps}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      ) : null}
    </>
  );
}

export default ProjectLaunchMenu;
