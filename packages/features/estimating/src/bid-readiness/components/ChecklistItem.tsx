/**
 * SF18-T06 checklist item row component.
 *
 * @design D-SF18-T06
 */
import { useState } from 'react';
import type { IBidReadinessChecklistItem } from '../../types/index.js';

export interface ChecklistItemProps {
  readonly item: IBidReadinessChecklistItem;
  readonly onCompletionChange?: (checklistItemId: string, isComplete: boolean) => void;
  readonly onRationaleChange?: (checklistItemId: string, rationale: string) => void;
  readonly showWeights?: boolean;
}

export function ChecklistItem({
  item,
  onCompletionChange,
  onRationaleChange,
  showWeights = false,
}: ChecklistItemProps): JSX.Element {
  const [draftRationale, setDraftRationale] = useState(item.rationale);

  return (
    <article data-testid={`checklist-item-${item.checklistItemId}`}>
      <label>
        <input
          type="checkbox"
          checked={item.isComplete}
          onChange={(event) => onCompletionChange?.(item.checklistItemId, event.currentTarget.checked)}
        />
        {item.label}
      </label>

      <p>{item.isBlocker ? 'Blocking criterion' : 'Non-blocking criterion'}</p>
      {showWeights ? <p>Weight: {item.weight}</p> : null}

      <label>
        Rationale
        <input
          type="text"
          value={draftRationale}
          onChange={(event) => {
            setDraftRationale(event.currentTarget.value);
            onRationaleChange?.(item.checklistItemId, event.currentTarget.value);
          }}
        />
      </label>

      <a href={item.actionHref}>Open action</a>
    </article>
  );
}
