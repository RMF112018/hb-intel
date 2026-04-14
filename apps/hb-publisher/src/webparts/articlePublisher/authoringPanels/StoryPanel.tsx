import * as React from 'react';
import { Field } from '../sharedChrome/index.js';
import { StoryBodyEditor } from '../storyBodyEditor/index.js';
import styles from '../article-publisher.module.css';
import { update, type PanelProps } from './draftHelpers.js';

export function StoryPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.editorialForm}>
      <Field
        label="Subhead"
        helper="A beat under the headline that frames the story. Concrete, human, and free of jargon."
        counter={{ value: draft.Subhead.length, soft: 140, hard: 200 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.Subhead}
          placeholder="e.g. How the Atlantic Center team delivered a 120-day schedule pull-in without slowing safety."
          onChange={(e) => onChange(update(draft, 'Subhead', e.target.value))}
          maxLength={240}
        />
      </Field>
      <Field label="Article body">
        <StoryBodyEditor
          value={draft.BodyRichText}
          onChange={(next) => onChange(update(draft, 'BodyRichText', next))}
          placeholder="Compose the article."
          ariaLabel="Article body"
        />
      </Field>
      <Field
        label="Intro"
        helper="Optional. A short lead paragraph rendered above the body — use it when the story needs a stronger runway than the subhead."
        counter={{ value: (draft.BodyIntro ?? '').length, soft: 300 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.BodyIntro ?? ''}
          placeholder="Set the scene in a sentence or two. Leave blank if the subhead already carries this weight."
          onChange={(e) => onChange(update(draft, 'BodyIntro', e.target.value || undefined))}
        />
      </Field>
      <Field
        label="Closing"
        helper="Optional. A final thought shown after the body — usually a forward-looking line or a call to action."
        counter={{ value: (draft.BodyClosing ?? '').length, soft: 300 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.BodyClosing ?? ''}
          placeholder="How should readers leave the story? A closing note, next step, or thank-you."
          onChange={(e) => onChange(update(draft, 'BodyClosing', e.target.value || undefined))}
        />
      </Field>
      <Field
        label="Callout"
        helper="Optional. A short highlight rendered as a pull-out card — use it to surface a single standout fact."
        counter={{ value: (draft.CalloutText ?? '').length, soft: 140 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.CalloutText ?? ''}
          placeholder="e.g. 38,000 field hours. Zero recordables."
          onChange={(e) => onChange(update(draft, 'CalloutText', e.target.value || undefined))}
        />
      </Field>
      <Field
        label="Pull quote"
        helper="Optional. A quote emphasised in the layout. Attribute-less — use the body for speaker context."
        counter={{ value: (draft.PullQuote ?? '').length, soft: 200 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.PullQuote ?? ''}
          placeholder="e.g. “We did not slow down to deliver this — we rebuilt how the team works.”"
          onChange={(e) => onChange(update(draft, 'PullQuote', e.target.value || undefined))}
        />
      </Field>
    </div>
  );
}
