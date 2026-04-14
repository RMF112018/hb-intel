/**
 * Story body editor — TipTap-backed authoring surface that replaces
 * the body <textarea>. Workstream-c step-02.
 *
 * The component is intentionally small: it wires the schema-locked
 * extension set from `editorSchema.ts`, surfaces the accessible
 * toolbar from `editorToolbar.tsx`, and emits sanitised HTML through
 * `onChange`. All formatting governance lives in the schema, not in
 * this component.
 */

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import { STORY_BODY_EXTENSIONS } from './editorSchema';
import { EditorToolbar } from './editorToolbar';
import styles from './storyBodyEditor.module.css';

export interface StoryBodyEditorProps {
  /** Persisted HTML value from `PublisherArticleRow.BodyRichText`. */
  readonly value: string;
  /** Called with the editor's current sanitised HTML on every change. */
  readonly onChange: (next: string) => void;
  /** Optional placeholder shown when the editor is empty. */
  readonly placeholder?: string;
  /** Accessible label for the editable area. */
  readonly ariaLabel?: string;
  /** Optional id linking the content to its describing copy. */
  readonly ariaDescribedBy?: string;
}

const EMPTY_DOC_HTML_VALUES: ReadonlySet<string> = new Set([
  '',
  '<p></p>',
  '<p><br></p>',
  '<p><br/></p>',
  '<p><br /></p>',
]);

function isEditorHtmlEmpty(html: string): boolean {
  const trimmed = html.trim();
  return EMPTY_DOC_HTML_VALUES.has(trimmed);
}

export function StoryBodyEditor({
  value,
  onChange,
  placeholder,
  ariaLabel = 'Article body',
  ariaDescribedBy,
}: StoryBodyEditorProps): JSX.Element {
  const editor = useEditor({
    extensions: STORY_BODY_EXTENSIONS,
    content: value || '',
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': ariaLabel,
        ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
        class: styles.editorContent,
        ...(placeholder ? { 'data-placeholder': placeholder } : {}),
      },
    },
    onUpdate: ({ editor: e }) => {
      const next = e.getHTML();
      // Normalise empty-document forms to '' so consumers see a
      // single canonical "no body" value rather than '<p></p>'.
      onChange(isEditorHtmlEmpty(next) ? '' : next);
    },
  });

  // Hydrate when the external value changes (e.g. picking a
  // different draft in the rail). The schema parses through the
  // configured extensions, dropping anything outside the allow-set.
  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || '';
    if (current === incoming) return;
    if (isEditorHtmlEmpty(current) && isEditorHtmlEmpty(incoming)) return;
    editor.commands.setContent(incoming, false);
  }, [editor, value]);

  // Cleanly destroy the editor on unmount to release the
  // ProseMirror state and observers.
  React.useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  return (
    <div className={styles.surface}>
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
