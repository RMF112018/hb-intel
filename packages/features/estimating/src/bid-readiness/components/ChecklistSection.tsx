/**
 * SF18-T06 checklist section component for deterministic grouping.
 *
 * @design D-SF18-T06
 */
import type { IBidReadinessChecklistItem } from '../../types/index.js';
import { ChecklistItem, type ChecklistItemProps } from './ChecklistItem.js';

export interface ChecklistSectionProps {
  readonly title: string;
  readonly items: readonly IBidReadinessChecklistItem[];
  readonly onCompletionChange?: ChecklistItemProps['onCompletionChange'];
  readonly onRationaleChange?: ChecklistItemProps['onRationaleChange'];
  readonly showWeights?: boolean;
}

export function ChecklistSection({
  title,
  items,
  onCompletionChange,
  onRationaleChange,
  showWeights = false,
}: ChecklistSectionProps): JSX.Element {
  return (
    <section data-testid={`checklist-section-${title.toLowerCase()}`}>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p>No items in this section.</p>
      ) : (
        <div>
          {items.map((item) => (
            <ChecklistItem
              key={item.checklistItemId}
              item={item}
              onCompletionChange={onCompletionChange}
              onRationaleChange={onRationaleChange}
              showWeights={showWeights}
            />
          ))}
        </div>
      )}
    </section>
  );
}
