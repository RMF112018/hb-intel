/**
 * Wave 2 / Prompt 03 — display-only header context.
 *
 * Tiny local placeholder for the project intelligence header. Not a fixture
 * record; not consumed from `PCC_FIXTURES`. Replaced when the header binds to
 * real read-models in a later wave.
 */

export interface PccProjectPlaceholder {
  readonly projectName: string;
  readonly subtitle: string;
  readonly dateScope: string;
  readonly pills: ReadonlyArray<{ label: string; tone: 'info' | 'neutral' | 'warning' }>;
}

export const PCC_PROJECT_PLACEHOLDER: PccProjectPlaceholder = {
  projectName: 'Project Control Center',
  subtitle: 'Project overview',
  dateScope: 'Last 12 Months',
  pills: [
    { label: 'Reference', tone: 'info' },
    { label: 'PCC', tone: 'neutral' },
  ],
};
