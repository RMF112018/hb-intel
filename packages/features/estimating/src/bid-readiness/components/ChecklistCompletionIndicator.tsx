/**
 * SF18-T06 checklist completion indicator.
 *
 * @design D-SF18-T06
 */

export interface ChecklistCompletionIndicatorProps {
  readonly completionPercent: number;
  readonly blockingIncompleteCount: number;
}

export function ChecklistCompletionIndicator({
  completionPercent,
  blockingIncompleteCount,
}: ChecklistCompletionIndicatorProps): JSX.Element {
  return (
    <section aria-label="Checklist Completion" data-testid="checklist-completion-indicator">
      <p>Completion: {completionPercent}%</p>
      <p>Blocking Incomplete: {blockingIncompleteCount}</p>
    </section>
  );
}
