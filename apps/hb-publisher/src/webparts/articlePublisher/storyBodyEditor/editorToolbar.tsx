/**
 * Accessible editorial toolbar for the Story body editor.
 *
 * Each control is a real <button type="button"> with `aria-pressed`
 * reflecting the current selection state, and the wrapper carries
 * `role="toolbar"` + `aria-label` for screen-reader announcement
 * (workstream-c step-01 §6).
 *
 * Iconography: governed inline SVG glyphs in `./editorIcons.tsx` —
 * replaces the prior text-label pseudo-iconography (`• List`,
 * `1. List`, `"`) with a real formatting-icon language. Each
 * icon-only button remains accessibly named via `aria-label`/`title`.
 *
 * Keyboard model: W3C toolbar pattern with roving tabindex. Only the
 * currently-focused control is in the tab order; ArrowLeft /
 * ArrowRight / Home / End move focus inside the toolbar and do not
 * mutate the document.
 */

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { isAllowedHref, normaliseHref } from './linkValidation';
import { PublisherButton } from '../sharedChrome/index.js';
import {
  BoldGlyph,
  BulletListGlyph,
  HeadingThreeGlyph,
  HeadingTwoGlyph,
  ItalicGlyph,
  LinkGlyph,
  OrderedListGlyph,
  ParagraphGlyph,
  QuoteGlyph,
  RedoGlyph,
  UndoGlyph,
} from './editorIcons';
import styles from './storyBodyEditor.module.css';

export interface EditorToolbarProps {
  readonly editor: Editor | null;
}

interface ToolbarControl {
  readonly key: string;
  readonly label: string;
  readonly keyboardHint?: string;
  readonly glyph: React.ReactNode;
  readonly isActive: boolean;
  readonly isDisabled?: boolean;
  readonly onInvoke: () => void;
  /** Used to close the toolbar groups visually. */
  readonly group: number;
}

export function EditorToolbar({ editor }: EditorToolbarProps): JSX.Element | null {
  const [linkPromptOpen, setLinkPromptOpen] = React.useState(false);
  const [linkDraft, setLinkDraft] = React.useState('');
  const [linkError, setLinkError] = React.useState<string | undefined>(undefined);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

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

  const controls: readonly ToolbarControl[] = [
    {
      key: 'bold',
      label: 'Bold',
      keyboardHint: 'Ctrl+B',
      glyph: <BoldGlyph />,
      isActive: editor.isActive('bold'),
      onInvoke: () => editor.chain().focus().toggleBold().run(),
      group: 0,
    },
    {
      key: 'italic',
      label: 'Italic',
      keyboardHint: 'Ctrl+I',
      glyph: <ItalicGlyph />,
      isActive: editor.isActive('italic'),
      onInvoke: () => editor.chain().focus().toggleItalic().run(),
      group: 0,
    },
    {
      key: 'link',
      label: 'Link',
      keyboardHint: 'Ctrl+K',
      glyph: <LinkGlyph />,
      isActive: editor.isActive('link'),
      onInvoke: openLinkPrompt,
      group: 0,
    },
    {
      key: 'h2',
      label: 'Heading 2',
      glyph: <HeadingTwoGlyph />,
      isActive: editor.isActive('heading', { level: 2 }),
      onInvoke: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      group: 1,
    },
    {
      key: 'h3',
      label: 'Heading 3',
      glyph: <HeadingThreeGlyph />,
      isActive: editor.isActive('heading', { level: 3 }),
      onInvoke: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      group: 1,
    },
    {
      key: 'paragraph',
      label: 'Paragraph',
      glyph: <ParagraphGlyph />,
      isActive: editor.isActive('paragraph'),
      onInvoke: () => editor.chain().focus().setParagraph().run(),
      group: 1,
    },
    {
      key: 'bullet-list',
      label: 'Bulleted list',
      glyph: <BulletListGlyph />,
      isActive: editor.isActive('bulletList'),
      onInvoke: () => editor.chain().focus().toggleBulletList().run(),
      group: 2,
    },
    {
      key: 'ordered-list',
      label: 'Numbered list',
      glyph: <OrderedListGlyph />,
      isActive: editor.isActive('orderedList'),
      onInvoke: () => editor.chain().focus().toggleOrderedList().run(),
      group: 2,
    },
    {
      key: 'blockquote',
      label: 'Block quote',
      glyph: <QuoteGlyph />,
      isActive: editor.isActive('blockquote'),
      onInvoke: () => editor.chain().focus().toggleBlockquote().run(),
      group: 2,
    },
    {
      key: 'undo',
      label: 'Undo',
      keyboardHint: 'Ctrl+Z',
      glyph: <UndoGlyph />,
      isActive: false,
      isDisabled: !editor.can().undo(),
      onInvoke: () => editor.chain().focus().undo().run(),
      group: 3,
    },
    {
      key: 'redo',
      label: 'Redo',
      keyboardHint: 'Ctrl+Shift+Z',
      glyph: <RedoGlyph />,
      isActive: false,
      isDisabled: !editor.can().redo(),
      onInvoke: () => editor.chain().focus().redo().run(),
      group: 3,
    },
  ];

  // Clamp focusIndex if controls list shrank (shouldn't, but safe).
  const safeFocusIndex = Math.min(focusIndex, controls.length - 1);

  const moveFocus = (next: number) => {
    const clamped = (next + controls.length) % controls.length;
    setFocusIndex(clamped);
    // Defer focus to after the tabindex attribute has been applied.
    requestAnimationFrame(() => buttonRefs.current[clamped]?.focus());
  };

  const onToolbarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        moveFocus(safeFocusIndex + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        moveFocus(safeFocusIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        moveFocus(0);
        break;
      case 'End':
        e.preventDefault();
        moveFocus(controls.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div
        className={styles.toolbar}
        role="toolbar"
        aria-label="Body formatting"
        onKeyDown={onToolbarKeyDown}
      >
        {renderGroups(controls, (control, flatIndex) => {
          const accessible = control.keyboardHint
            ? `${control.label} (${control.keyboardHint})`
            : control.label;
          return (
            <button
              key={control.key}
              ref={(el) => {
                buttonRefs.current[flatIndex] = el;
              }}
              type="button"
              className={`${styles.toolbarBtn} ${
                control.isActive ? styles.toolbarBtnActive : ''
              }`}
              onClick={control.onInvoke}
              onFocus={() => setFocusIndex(flatIndex)}
              disabled={control.isDisabled}
              aria-pressed={control.isActive ? 'true' : 'false'}
              aria-label={accessible}
              title={accessible}
              tabIndex={flatIndex === safeFocusIndex ? 0 : -1}
            >
              <span className={styles.toolbarIcon}>{control.glyph}</span>
            </button>
          );
        })}
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
          <PublisherButton variant="primary" size="sm" onClick={applyLink}>
            Apply link
          </PublisherButton>
          {editor.isActive('link') && (
            <PublisherButton variant="danger" size="sm" onClick={removeLink}>
              Remove link
            </PublisherButton>
          )}
          <PublisherButton
            size="sm"
            onClick={() => {
              setLinkPromptOpen(false);
              editor.commands.focus();
            }}
          >
            Cancel
          </PublisherButton>
          {linkError && (
            <span className={styles.linkPromptError} role="alert">{linkError}</span>
          )}
        </div>
      )}
    </>
  );
}

/**
 * Renders controls sliced by group, wrapping each run inside a
 * `.toolbarGroup` container. Flat index is threaded through so the
 * roving-tabindex refs stay stable across groups.
 */
function renderGroups(
  controls: readonly ToolbarControl[],
  renderControl: (control: ToolbarControl, flatIndex: number) => React.ReactNode,
): React.ReactNode {
  const groups: Array<{ id: number; items: ToolbarControl[]; start: number }> = [];
  let cursor = 0;
  for (const c of controls) {
    let bucket = groups[groups.length - 1];
    if (!bucket || bucket.id !== c.group) {
      bucket = { id: c.group, items: [], start: cursor };
      groups.push(bucket);
    }
    bucket.items.push(c);
    cursor += 1;
  }
  return groups.map((g) => (
    <div className={styles.toolbarGroup} key={g.id}>
      {g.items.map((item, i) => renderControl(item, g.start + i))}
    </div>
  ));
}
