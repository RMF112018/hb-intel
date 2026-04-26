import type { FoleonManagedContent } from '../../types/foleon-management.types.js';
import { ManageRegistryPanel } from './ManageRegistryPanel.js';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

/** Secondary surface: search and open records without refactoring ManageRegistryPanel. */
export function ContentLibraryPanel(props: {
  readonly query: string;
  readonly onQueryChange: (value: string) => void;
  readonly filteredContent: ReadonlyArray<FoleonManagedContent>;
  readonly selectedId: string | null;
  readonly onSelectRecord: (id: string) => void;
}): React.ReactNode {
  return (
    <section className={shell.contentLibrarySection} aria-label="Content library">
      <p className={f.guidanceKicker}>Secondary</p>
      <h3 className={f.sectionTitle}>Content library</h3>
      <p className={f.metaMuted}>
        Search and open any record. Your focused lane updates when you pick a row.
      </p>
      <ManageRegistryPanel
        query={props.query}
        onQueryChange={props.onQueryChange}
        filteredContent={props.filteredContent}
        selectedId={props.selectedId}
        onSelect={props.onSelectRecord}
      />
    </section>
  );
}
