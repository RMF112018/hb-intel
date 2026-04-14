/**
 * Preview controller — owns preview composition state for the selected
 * article. Preview is continuous (not a tab activation): it recomposes
 * whenever the selection changes so the preview section and readiness
 * rail stay in sync with the canvas without author action.
 */
import * as React from 'react';
import type { PublisherRepositories } from '../../../data/publisherAdapter/index.js';
import {
  buildPublisherPreview,
  type PreviewOutcome,
} from '../../../data/publisherAdapter/preview/previewBuilder.js';
import type { SetStatus } from './useStatusChannel.js';

export interface PreviewControllerDeps {
  readonly repositories: PublisherRepositories;
  readonly selectedArticleId: string | undefined;
  readonly setStatus: SetStatus;
}

export interface PreviewController {
  readonly preview: PreviewOutcome | undefined;
  readonly previewLoading: boolean;
  readonly loadPreview: (articleId: string) => Promise<void>;
}

export function usePreviewController({
  repositories,
  selectedArticleId,
  setStatus,
}: PreviewControllerDeps): PreviewController {
  const [preview, setPreview] = React.useState<PreviewOutcome | undefined>();
  const [previewLoading, setPreviewLoading] = React.useState(false);

  const loadPreview = React.useCallback(
    async (articleId: string) => {
      setPreviewLoading(true);
      try {
        const outcome = await buildPublisherPreview(repositories, articleId);
        setPreview(outcome);
      } catch (err) {
        setPreview(undefined);
        setStatus(
          err instanceof Error ? err.message : 'Preview failed.',
          'error',
        );
      } finally {
        setPreviewLoading(false);
      }
    },
    [repositories, setStatus],
  );

  React.useEffect(() => {
    if (selectedArticleId) {
      void loadPreview(selectedArticleId);
    } else {
      setPreview(undefined);
    }
  }, [selectedArticleId, loadPreview]);

  return { preview, previewLoading, loadPreview };
}
