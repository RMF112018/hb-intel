/**
 * HbcPopover — Contextual popover types
 * PH4.8 §Step 6 | Blueprint §1d
 */

export type PopoverSize = 'sm' | 'md';
export type PopoverTriggerMode = 'hover' | 'click';

export interface HbcPopoverProps {
  /** Trigger element that opens the popover */
  trigger: React.ReactElement;
  /** Popover content */
  children: React.ReactNode;
  /** Popover width: sm=240px, md=320px */
  size?: PopoverSize;
  /** Trigger mode: hover (150ms delay) or click (toggle) */
  triggerMode?: PopoverTriggerMode;
  /** Additional CSS class for the popover container */
  className?: string;
}
