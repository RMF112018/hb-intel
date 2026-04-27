import type { ManagerOperationsCount } from './managerOperationsViewModel.js';
import shell from './manageShell.module.css';

export interface StatusSummaryStripProps {
  readonly counts: ReadonlyArray<ManagerOperationsCount>;
}

export function StatusSummaryStrip(props: StatusSummaryStripProps): React.ReactNode {
  if (props.counts.length === 0) {
    return (
      <section
        className={shell.summaryStrip}
        aria-label="Operations summary"
      >
        <p className={shell.summaryStripEmpty}>
          Operations counts unavailable in current snapshot.
        </p>
      </section>
    );
  }

  return (
    <section
      className={shell.summaryStrip}
      aria-label="Operations summary"
    >
      <ul className={shell.summaryStripList} role="list">
        {props.counts.map((count) => (
          <li
            key={count.id}
            className={shell.summaryStripItem}
            data-summary-id={count.id}
          >
            <span className={shell.summaryStripValue} aria-label={`${count.label} count`}>
              {count.value}
            </span>
            <span className={shell.summaryStripLabel}>{count.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
