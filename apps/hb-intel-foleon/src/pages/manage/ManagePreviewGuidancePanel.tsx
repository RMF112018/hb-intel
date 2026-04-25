import f from './manageFields.module.css';

export function ManagePreviewGuidancePanel(props: {
  readonly publicReadyContentCount: number;
  readonly homepageReadyContentCount: number;
}): React.ReactNode {
  return (
    <section className={f.previewGuidance} aria-labelledby="foleon-preview-guidance-title">
      <p className={f.guidanceKicker}>Public preview guidance</p>
      <h3 className={f.sectionTitle} id="foleon-preview-guidance-title">
        Public preview layouts may still be visible.
      </h3>
      <p className={f.guidanceCopy}>
        Public Highlights and Content Hub preview layouts appear when the app is configured but the public routes do
        not yet have renderable published content.
      </p>
      <ul className={f.guidanceList}>
        <li>
          Draft, hidden, unpublished, archived, suppressed, or non-homepage-ready records may still exist here while
          public routes continue to show preview layouts.
        </li>
        <li>
          Preview layouts do not create records, open readers, call external links, or emit production content
          telemetry.
        </li>
        <li>
          Publishing visible content and creating valid active placements will replace public previews automatically
          where applicable.
        </li>
        <li>Empty-registry preview search does not emit normal Search telemetry.</li>
      </ul>
      <p className={f.guidanceMeta}>
        Public-ready records: {props.publicReadyContentCount}. Homepage-ready records: {props.homepageReadyContentCount}.
      </p>
    </section>
  );
}
