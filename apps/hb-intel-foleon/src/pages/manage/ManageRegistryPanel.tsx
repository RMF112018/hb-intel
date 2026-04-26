import { HbcSearch } from '@hbc/ui-kit/homepage';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { clsx } from 'clsx';
import { Library } from 'lucide-react';
import type { FoleonManagedContent } from '../../types/foleon-management.types.js';
import { FoleonEmpty } from '../../components/FoleonStates.js';
import { readerLaneForContent, readerLaneLabel } from './manageMutationUtils.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export function ManageRegistryPanel(props: {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly filteredContent: ReadonlyArray<FoleonManagedContent>;
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
}): React.ReactNode {
  return (
    <aside className={shell.aside} aria-label="Foleon content registry">
      <h3 className={f.sectionTitle}>
        <Library size={18} style={{ verticalAlign: 'text-bottom', marginRight: 6 }} aria-hidden />
        Registry
      </h3>
      <HbcSearch
        variant="local"
        value={props.query}
        onSearch={props.onQueryChange}
        placeholder="Search title, Doc ID, region"
      />
      <ScrollArea.Root className={shell.registryScroll}>
        <ScrollArea.Viewport style={{ width: '100%' }}>
          <div className={shell.registryList}>
            {props.filteredContent.length === 0 ? (
              <FoleonEmpty title="No content matches." description="Clear search or sync Foleon Docs." />
            ) : (
              props.filteredContent.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  data-validation={record.validationStatus}
                  className={clsx(
                    shell.registryButton,
                    record.id === props.selectedId ? shell.registryButtonSelected : null,
                  )}
                  onClick={(): void => props.onSelect(record.id)}
                >
                  <strong>{record.title}</strong>
                  <span className={shell.registryMeta}>
                    {laneLabel(record)} • Doc {record.foleonDocId} • {record.publishStatus}
                  </span>
                  <small className={shell.registrySmall}>
                    {record.validationStatus}
                    {record.blockingReasons.length ? ` — ${record.blockingReasons[0]}` : ''}
                  </small>
                </button>
              ))
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" style={{ width: 8 }}>
          <ScrollArea.Thumb
            style={{ background: 'var(--foleon-manage-panel-border, hsl(205 18% 18% / 0.25))' }}
          />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </aside>
  );
}

function laneLabel(record: FoleonManagedContent): string {
  const lane = readerLaneForContent(record);
  return lane ? readerLaneLabel(lane) : 'Unassigned lane';
}
