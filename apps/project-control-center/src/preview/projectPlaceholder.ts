/**
 * Local project context placeholder used by PCC shell-level surfaces (header,
 * hero band, context band) before they bind to live read-models. The values
 * are reference-only product copy; this constant is not a fixture record and
 * is not consumed from any shared fixture aggregate.
 */

export interface PccProjectPlaceholder {
  readonly projectName: string;
  readonly subtitle: string;
  readonly dateScope: string;
  readonly pills: ReadonlyArray<{ label: string; tone: 'info' | 'neutral' | 'warning' }>;
  readonly clientName: string;
  readonly location: string;
  readonly estimatedValue: string;
  readonly sourceConfidence: 'reference' | 'live';
}

export const PCC_PROJECT_PLACEHOLDER: PccProjectPlaceholder = {
  projectName: 'Project Control Center',
  subtitle: 'Project overview',
  dateScope: 'Last 12 Months',
  pills: [
    { label: 'Reference', tone: 'info' },
    { label: 'PCC', tone: 'neutral' },
  ],
  clientName: 'Reference Client',
  location: 'Reference Location',
  estimatedValue: '$0',
  sourceConfidence: 'reference',
};
