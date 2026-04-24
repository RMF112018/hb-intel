import * as ScrollArea from '@radix-ui/react-scroll-area';
import type { FoleonSyncRun } from '../../types/foleon-management.types.js';
import { FoleonEmpty } from '../../components/FoleonStates.js';
import f from './manageFields.module.css';

export function ManageSyncPanel(props: { readonly runs: ReadonlyArray<FoleonSyncRun> }): React.ReactNode {
  return (
    <section className={f.editorSection} aria-label="Sync run history">
      <h3 className={f.sectionTitle}>Sync Runs</h3>
      {props.runs.length === 0 ? (
        <FoleonEmpty title="No sync runs yet." description="Run a Docs sync to create operational proof." />
      ) : (
        <ScrollArea.Root style={{ maxHeight: 320 }}>
          <ScrollArea.Viewport>
            {props.runs.slice(0, 12).map((run) => (
              <article key={run.id} className={f.syncRunRow}>
                <strong>
                  {run.runType} {run.status}
                </strong>
                <div className={f.metaMuted}>
                  {run.itemsScanned} scanned • {run.itemsFailed} failed • {run.correlationId}
                </div>
                {run.message ? <small>{run.message}</small> : null}
              </article>
            ))}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar orientation="vertical" style={{ width: 8 }}>
            <ScrollArea.Thumb
              style={{ background: 'var(--foleon-manage-panel-border, hsl(205 18% 18% / 0.25))' }}
            />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      )}
    </section>
  );
}
