import * as React from 'react';
import type {
  PublisherPageBindingRow,
  PublishResolutionContext,
} from '../../../data/publisherAdapter/index.js';
import styles from '../article-publisher.module.css';

export interface DestinationBindingPanelProps {
  readonly binding: PublisherPageBindingRow | undefined;
  readonly context: PublishResolutionContext | undefined;
}

export function DestinationBindingPanel({ binding, context }: DestinationBindingPanelProps) {
  return (
    <div className={styles.bindingPanel}>
      <div className={styles.bindingBlock}>
        <p className={styles.bindingHeading}>Template</p>
        {!context ? (
          <p className={styles.bindingSentence}>
            Save the article so the publishing template can be resolved.
          </p>
        ) : (
          <p className={styles.bindingSentence}>
            This article will publish with the{' '}
            <strong>{context.template.TemplateName ?? context.template.TemplateKey}</strong>{' '}
            template
            {context.template.VersionLabel
              ? ` (version ${context.template.VersionLabel})`
              : ''}
            .
          </p>
        )}
      </div>
      <div className={styles.bindingBlock}>
        <p className={styles.bindingHeading}>Destination page</p>
        {!binding ? (
          <p className={styles.bindingSentence}>
            No destination page is bound yet. Publishing this article will create the Project
            Spotlight page.
          </p>
        ) : (
          <>
            <p className={styles.bindingSentence}>
              The destination page <strong>{binding.PageName ?? 'is named on publish'}</strong>{' '}
              is bound to this article
              {binding.PublishedDateUtc
                ? ` and was last published ${binding.PublishedDateUtc}.`
                : ' and has not been published yet.'}
            </p>
            {binding.PageUrl && (
              <p className={styles.bindingSentence}>
                <a
                  className={styles.bindingLink}
                  href={binding.PageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the destination page
                </a>
              </p>
            )}
            {binding.LastSyncMessage && (
              <p className={styles.bindingDetail}>
                Last sync: {binding.LastSyncMessage}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
