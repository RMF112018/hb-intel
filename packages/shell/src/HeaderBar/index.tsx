import type { ReactNode } from 'react';
import { useNavStore } from '../stores/navStore.js';

export interface HeaderBarProps {
  /** Left section: typically ProjectPicker or BackToProjectHub. */
  leftSlot?: ReactNode;
  /** Center section override; defaults to tool-picker items from navStore. */
  toolPickerSlot?: ReactNode;
  /** Right section override; defaults to AppLauncher. */
  rightSlot?: ReactNode;
  /** Callback when a tool-picker item is clicked. */
  onToolSelect?: (id: string) => void;
}

/**
 * 3-section header bar — Blueprint §2c.
 * Left: ProjectPicker / BackToProjectHub
 * Center: Workspace tool-picker strip
 * Right: AppLauncher waffle button
 */
export function HeaderBar({ leftSlot, toolPickerSlot, rightSlot, onToolSelect }: HeaderBarProps): ReactNode {
  const toolPickerItems = useNavStore((s) => s.toolPickerItems);

  return (
    <header data-hbc-shell="header-bar">
      <div data-hbc-shell="header-left">
        {leftSlot}
      </div>
      <nav data-hbc-shell="header-center">
        {toolPickerSlot ??
          toolPickerItems.map((item) => (
            <button
              key={item.id}
              data-hbc-shell="tool-picker-item"
              data-active={item.isActive || undefined}
              onClick={() => {
                item.onClick();
                onToolSelect?.(item.id);
              }}
            >
              {item.label}
            </button>
          ))}
      </nav>
      <div data-hbc-shell="header-right">
        {rightSlot}
      </div>
    </header>
  );
}
