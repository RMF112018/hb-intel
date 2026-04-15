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
import { sanitizePastedHtml } from './pasteSanitization';
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
  const [isEmpty, setIsEmpty] = React.useState<boolean>(() =>
    isEditorHtmlEmpty(value || ''),
  );
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
      // Scrub Office / Word / rich-text paste noise before the schema
      // parser sees it. Defence-in-depth around `STORY_BODY_EXTENSIONS`
      // — the schema parser still gets to narrow to the allow-list,
      // but it no longer has to tolerate MSO conditionals, inline
      // styles, presentational wrappers, or attribute smuggling.
      transformPastedHTML: (html) => sanitizePastedHtml(html),
    },
    onCreate: ({ editor: e }) => {
      setIsEmpty(e.isEmpty);
    },
    onUpdate: ({ editor: e }) => {
      setIsEmpty(e.isEmpty);
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
    setIsEmpty(editor.isEmpty);
  }, [editor, value]);

  // Cleanly destroy the editor on unmount to release the
  // ProseMirror state and observers.
  React.useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  const showPlaceholder = isEmpty && Boolean(placeholder);

  const { charCount, wordCount } = React.useMemo(
    () => measureBodyText(editor?.getText() ?? ''),
    // Retrigger on every editor update — editor-state changes flow
    // through the onUpdate handler above which bumps isEmpty.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, isEmpty, value],
  );

  return (
    <div
      className={styles.surface}
      data-empty={isEmpty ? 'true' : undefined}
      data-testid="story-body-editor"
    >
      <EditorToolbar editor={editor} />
      <div className={styles.editorArea}>
        {showPlaceholder && (
          <div
            className={styles.placeholder}
            aria-hidden="true"
            data-testid="story-body-editor-placeholder"
          >
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
      <EditorFooter charCount={charCount} wordCount={wordCount} />
    </div>
  );
}

/* ── Footer ────────────────────────────────────────────────────
 * Editorial trust bridge rendered beneath the edit area:
 *   - live char + word counts for compose ergonomics
 *   - a supported-formatting hint that names the governed schema
 *   - a Keyboard shortcuts disclosure that lists every shortcut
 *     the toolbar exposes (matching the aria-labels on each button)
 */

function EditorFooter({
  charCount,
  wordCount,
}: {
  charCount: number;
  wordCount: number;
}): JSX.Element {
  return (
    <footer className={styles.editorFooter}>
      <div className={styles.editorCounts} aria-live="polite">
        <span>
          {wordCount.toLocaleString()} word{wordCount === 1 ? '' : 's'}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {charCount.toLocaleString()} character{charCount === 1 ? '' : 's'}
        </span>
      </div>
      <p className={styles.editorSupportHint}>
        Supports headings (H2, H3), bold, italic, bullet + numbered lists,
        block quote, and links. Inline styles, colors, images, tables, and
        pasted Word formatting are scrubbed to match the published page.
      </p>
      <details className={styles.editorShortcuts}>
        <summary className={styles.editorShortcutsSummary}>
          Keyboard shortcuts
        </summary>
        <dl className={styles.editorShortcutsList}>
          <ShortcutRow label="Bold" keys="Ctrl + B" />
          <ShortcutRow label="Italic" keys="Ctrl + I" />
          <ShortcutRow label="Link" keys="Ctrl + K" />
          <ShortcutRow label="Undo" keys="Ctrl + Z" />
          <ShortcutRow label="Redo" keys="Ctrl + Shift + Z" />
          <ShortcutRow label="Focus toolbar" keys="Tab into toolbar, then Arrow keys" />
        </dl>
      </details>
    </footer>
  );
}

function ShortcutRow({
  label,
  keys,
}: {
  label: string;
  keys: string;
}): JSX.Element {
  return (
    <>
      <dt className={styles.editorShortcutsTerm}>{label}</dt>
      <dd className={styles.editorShortcutsKeys}>{keys}</dd>
    </>
  );
}

/* ── Compose metrics ──────────────────────────────────────────── */

export function measureBodyText(text: string): {
  charCount: number;
  wordCount: number;
} {
  const plain = text ?? '';
  const charCount = plain.length;
  const trimmed = plain.trim();
  const wordCount = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
  return { charCount, wordCount };
}
