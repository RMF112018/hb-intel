/**
 * Accessible editorial toolbar for the Story body editor.
 *
 * Each control is a real <button type="button"> with `aria-pressed`
 * reflecting the current selection state, and the wrapper carries
 * `role="toolbar"` + `aria-label` for screen-reader announcement
 * (workstream-c step-01 §6).
 */

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { isAllowedHref, normaliseHref } from './linkValidation';
import styles from './storyBodyEditor.module.css';

export interface EditorToolbarProps {
  readonly editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps): JSX.Element | null {
  const [linkPromptOpen, setLinkPromptOpen] = React.useState(false);
  const [linkDraft, setLinkDraft] = React.useState('');
  const [linkError, setLinkError] = React.useState<string | undefined>(undefined);

  if (!editor) return null;

  const openLinkPrompt = () => {
    if (editor.state.selection.empty) {
      setLinkError('Select the text you want to link first.');
      setLinkPromptOpen(true);
      return;
    }
    const existing = (editor.getAttributes('link').href as string | undefined) ?? '';
    setLinkDraft(existing);
    setLinkError(undefined);
    setLinkPromptOpen(true);
  };

  const applyLink = () => {
    const normalised = normaliseHref(linkDraft);
    if (!normalised) {
      setLinkError('Use https://, mailto:, or a tenant-relative path starting with /.');
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: normalised })
      .run();
    setLinkPromptOpen(false);
    setLinkDraft('');
    setLinkError(undefined);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setLinkPromptOpen(false);
    setLinkDraft('');
    setLinkError(undefined);
  };

  const Btn = ({
    label,
    onClick,
    active,
    disabled,
    keyboardHint,
  }: {
    label: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    keyboardHint?: string;
  }) => (
    <button
      type="button"
      className={`${styles.toolbarBtn} ${active ? styles.toolbarBtnActive : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active ? 'true' : 'false'}
      aria-label={keyboardHint ? `${label} (${keyboardHint})` : label}
      title={keyboardHint ? `${label} (${keyboardHint})` : label}
    >
      {label}
    </button>
  );

  return (
    <>
      <div className={styles.toolbar} role="toolbar" aria-label="Body formatting">
        <div className={styles.toolbarGroup}>
          <Btn
            label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            keyboardHint="Ctrl+B"
          />
          <Btn
            label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            keyboardHint="Ctrl+I"
          />
          <Btn
            label="Link"
            onClick={openLinkPrompt}
            active={editor.isActive('link')}
            keyboardHint="Ctrl+K"
          />
        </div>
        <div className={styles.toolbarGroup}>
          <Btn
            label="H2"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
          />
          <Btn
            label="H3"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
          />
          <Btn
            label="Paragraph"
            onClick={() => editor.chain().focus().setParagraph().run()}
            active={editor.isActive('paragraph')}
          />
        </div>
        <div className={styles.toolbarGroup}>
          <Btn
            label="• List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
          />
          <Btn
            label="1. List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
          />
          <Btn
            label="“”"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            keyboardHint="Quote"
          />
        </div>
        <div className={styles.toolbarGroup}>
          <Btn
            label="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            keyboardHint="Ctrl+Z"
          />
          <Btn
            label="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            keyboardHint="Ctrl+Shift+Z"
          />
        </div>
      </div>

      {linkPromptOpen && (
        <div className={styles.linkPromptRow} role="group" aria-label="Insert link">
          <input
            type="text"
            className={styles.linkPromptInput}
            placeholder="https://… or mailto: or /tenant-path"
            value={linkDraft}
            onChange={(e) => {
              const next = e.target.value;
              setLinkDraft(next);
              if (linkError && (next.length === 0 || isAllowedHref(next.trim()))) {
                setLinkError(undefined);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                applyLink();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setLinkPromptOpen(false);
                editor.commands.focus();
              }
            }}
            aria-label="Link URL"
            autoFocus
          />
          <button type="button" className={styles.toolbarBtn} onClick={applyLink}>
            Apply
          </button>
          {editor.isActive('link') && (
            <button type="button" className={styles.toolbarBtn} onClick={removeLink}>
              Remove link
            </button>
          )}
          <button
            type="button"
            className={styles.toolbarBtn}
            onClick={() => {
              setLinkPromptOpen(false);
              editor.commands.focus();
            }}
          >
            Cancel
          </button>
          {linkError && (
            <span className={styles.linkPromptError} role="alert">{linkError}</span>
          )}
        </div>
      )}
    </>
  );
}
