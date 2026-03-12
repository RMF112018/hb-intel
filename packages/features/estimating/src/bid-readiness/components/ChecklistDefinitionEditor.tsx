/**
 * SF18-T06 checklist definition editor.
 *
 * @design D-SF18-T06
 */
import type { IBidReadinessChecklistDefinition } from '../../types/index.js';

export interface ChecklistDefinitionEditorProps {
  readonly definitions: readonly IBidReadinessChecklistDefinition[];
}

export function ChecklistDefinitionEditor({
  definitions,
}: ChecklistDefinitionEditorProps): JSX.Element {
  return (
    <section data-testid="checklist-definition-editor">
      <h3>Checklist Definitions</h3>
      {definitions.length === 0 ? (
        <p>No checklist definitions configured.</p>
      ) : (
        <ul>
          {definitions
            .slice()
            .sort((left, right) => left.order - right.order)
            .map((definition) => (
              <li key={definition.checklistItemId} data-testid={`definition-${definition.checklistItemId}`}>
                {definition.criterionId} · {definition.blocking ? 'blocking' : 'non-blocking'} · order {definition.order}
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
