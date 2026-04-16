/**
 * Accessible editorial toolbar for the Story body editor.
 *
 * Each control is a real <button type="button"> with `aria-pressed`
 * reflecting the current selection state, and the wrapper carries
 * `role="toolbar"` + `aria-label` for screen-reader announcement.
 *
 * Iconography: governed `PublisherIcon` wrapper over `lucide-react`
 * per Governing SPFx Standard §5.2. Replaces the prior text-label
 * pseudo-iconography (`• List`, `1. List`, `"`) and the inline SVG
 * glyph set that preceded it. Each icon-only button remains accessibly
 * named via `aria-label` + a `PublisherTooltip` hint.
 *
 * Group separation uses a semantic `PublisherSeparator` rather than a
 * border-right on the group wrapper, so the hierarchy is announced
 * correctly and respects the shared token language.
 *
 * Phase-17 wave-02 prompt-02: the link authoring affordance is now a
 * proper anchored popover rather than an in-flow banner. It is anchored
 * to the Link toolbar button via `useAnchoredOverlay`, rendered through
 * `FloatingPortal` + `FloatingFocusManager` for focus trap + outside
 * press dismissal, and animated with `motion/react` on open / close.
 * Focus returns to the editor on apply, remove, cancel, and dismiss so
 * the authoring flow stays continuous.
 *
 * Keyboard model: W3C toolbar pattern with roving tabindex. Only the
 * currently-focused control is in the tab order; ArrowLeft /
 * ArrowRight / Home / End move focus inside the toolbar and do not
 * mutate the document.
 */

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import {
  FloatingFocusManager,
  FloatingPortal,
} from '@floating-ui/react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { isAllowedHref, normaliseHref } from './linkValidation';
import {
  PublisherButton,
  PublisherIcon,
  PublisherSeparator,
  PublisherTooltip,
  PublisherTooltipProvider,
  useAnchoredOverlay,
} from '../sharedChrome/index.js';
import styles from './storyBodyEditor.module.css';

export interface EditorToolbarProps {
  readonly editor: Editor | null;
}

interface ToolbarControl {
  readonly key: string;
  readonly label: string;
  readonly keyboardHint?: string;
  readonly icon: LucideIcon;
  readonly isActive: boolean;
  readonly isDisabled?: boolean;
  readonly onInvoke: () => void;
  /** Used to close the toolbar groups visually. */
  readonly group: number;
}

export function EditorToolbar({ editor }: EditorToolbarProps): JSX.Element | null {
  const [linkPromptOpen, setLinkPromptOpen] = React.useState(false);
  const [linkDraft, setLinkDraft] = React.useState('');
  const [linkTextDraft, setLinkTextDraft] = React.useState('');
  const [needsLinkText, setNeedsLinkText] = React.useState(false);
  const [linkError, setLinkError] = React.useState<string | undefined>(undefined);
  const [focusIndex, setFocusIndex] = React.useState(0);
  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const closeLinkPrompt = React.useCallback(
    (opts?: { returnToEditor?: boolean }) => {
      setLinkPromptOpen(false);
      setLinkDraft('');
      setLinkTextDraft('');
      setNeedsLinkText(false);
      setLinkError(undefined);
      if (opts?.returnToEditor !== false) {
        editor?.commands.focus();
      }
    },
    [editor],
  );

  const linkOverlay = useAnchoredOverlay({
    open: linkPromptOpen,
    onOpenChange: (next) => {
      if (!next) closeLinkPrompt();
    },
    placement: 'bottom-start',
    offsetPx: 8,
    role: 'dialog',
  });

  if (!editor) return null;

  const openLinkPrompt = () => {
    let textSlotOpen = false;
    if (editor.state.selection.empty) {
      // Expand the selection to the word at the cursor so authors
      // don't have to double-click to link. If no word boundary is
      // available, open the prompt with a link-text input so authors
      // can type both the link text and the URL in one pass.
      const expanded = editor.chain().focus().extendMarkRange('link').run();
      const { $from } = editor.state.selection;
      const text = $from.parent.textContent;
      const offset = $from.parentOffset;
      const boundary = /\W/;
      let start = offset;
      let end = offset;
      while (start > 0 && !boundary.test(text.charAt(start - 1))) start--;
      while (end < text.length && !boundary.test(text.charAt(end))) end++;
      if (end > start) {
        const from = $from.start() + start;
        const to = $from.start() + end;
        editor.chain().focus().setTextSelection({ from, to }).run();
      } else if (!expanded || editor.state.selection.empty) {
        textSlotOpen = true;
      }
    }
    const existing = (editor.getAttributes('link').href as string | undefined) ?? '';
    setLinkDraft(existing);
    setLinkTextDraft('');
    setNeedsLinkText(textSlotOpen);
    setLinkError(undefined);
    setLinkPromptOpen(true);
  };

  const applyLink = () => {
    const normalised = normaliseHref(linkDraft);
    if (!normalised) {
      setLinkError('Use https://, mailto:, or a tenant-relative path starting with /.');
      return;
    }
    if (needsLinkText) {
      const text = linkTextDraft.trim();
      if (text.length === 0) {
        setLinkError('Enter the visible link text.');
        return;
      }
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text,
          marks: [{ type: 'link', attrs: { href: normalised } }],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: normalised })
        .run();
    }
    closeLinkPrompt();
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    closeLinkPrompt();
  };

  const controls: readonly ToolbarControl[] = [
    {
      key: 'bold',
      label: 'Bold',
      keyboardHint: 'Ctrl+B',
      icon: Bold,
      isActive: editor.isActive('bold'),
      onInvoke: () => editor.chain().focus().toggleBold().run(),
      group: 0,
    },
    {
      key: 'italic',
      label: 'Italic',
      keyboardHint: 'Ctrl+I',
      icon: Italic,
      isActive: editor.isActive('italic'),
      onInvoke: () => editor.chain().focus().toggleItalic().run(),
      group: 0,
    },
    {
      key: 'link',
      label: 'Link',
      keyboardHint: 'Ctrl+K',
      icon: LinkIcon,
      isActive: editor.isActive('link'),
      onInvoke: openLinkPrompt,
      group: 0,
    },
    {
      key: 'h2',
      label: 'Heading 2',
      icon: Heading2,
      isActive: editor.isActive('heading', { level: 2 }),
      onInvoke: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      group: 1,
    },
    {
      key: 'h3',
      label: 'Heading 3',
      icon: Heading3,
      isActive: editor.isActive('heading', { level: 3 }),
      onInvoke: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      group: 1,
    },
    {
      key: 'paragraph',
      label: 'Paragraph',
      icon: Pilcrow,
      isActive: editor.isActive('paragraph'),
      onInvoke: () => editor.chain().focus().setParagraph().run(),
      group: 1,
    },
    {
      key: 'bullet-list',
      label: 'Bulleted list',
      icon: List,
      isActive: editor.isActive('bulletList'),
      onInvoke: () => editor.chain().focus().toggleBulletList().run(),
      group: 2,
    },
    {
      key: 'ordered-list',
      label: 'Numbered list',
      icon: ListOrdered,
      isActive: editor.isActive('orderedList'),
      onInvoke: () => editor.chain().focus().toggleOrderedList().run(),
      group: 2,
    },
    {
      key: 'blockquote',
      label: 'Block quote',
      icon: Quote,
      isActive: editor.isActive('blockquote'),
      onInvoke: () => editor.chain().focus().toggleBlockquote().run(),
      group: 2,
    },
    {
      key: 'undo',
      label: 'Undo',
      keyboardHint: 'Ctrl+Z',
      icon: Undo2,
      isActive: false,
      isDisabled: !editor.can().undo(),
      onInvoke: () => editor.chain().focus().undo().run(),
      group: 3,
    },
    {
      key: 'redo',
      label: 'Redo',
      keyboardHint: 'Ctrl+Shift+Z',
      icon: Redo2,
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
    <PublisherTooltipProvider>
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
          const isLinkControl = control.key === 'link';
          return (
            <PublisherTooltip key={control.key} label={accessible}>
              <button
                ref={(el) => {
                  buttonRefs.current[flatIndex] = el;
                  if (isLinkControl) {
                    linkOverlay.refs.setReference(el);
                  }
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
                aria-haspopup={isLinkControl ? 'dialog' : undefined}
                aria-expanded={isLinkControl ? linkPromptOpen : undefined}
                tabIndex={flatIndex === safeFocusIndex ? 0 : -1}
              >
                <span className={styles.toolbarIcon}>
                  <PublisherIcon icon={control.icon} size="md" tint="inherit" />
                </span>
              </button>
            </PublisherTooltip>
          );
        })}
      </div>

      <FloatingPortal>
        <AnimatePresence>
          {linkPromptOpen && (
            <FloatingFocusManager
              context={linkOverlay.context}
              initialFocus={0}
              returnFocus={false}
              modal={false}
            >
              <motion.div
                {...linkOverlay.getFloatingProps({
                  ref: linkOverlay.refs.setFloating,
                  className: styles.linkPromptPopover,
                  style: linkOverlay.floatingStyles,
                  role: 'dialog',
                  'aria-label': 'Insert link',
                })}
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ type: 'tween', duration: 0.14, ease: 'easeOut' }}
              >
                {needsLinkText && (
                  <label className={styles.linkPromptField}>
                    <span className={styles.linkPromptFieldLabel}>Link text</span>
                    <input
                      type="text"
                      className={styles.linkPromptInput}
                      placeholder="Link text"
                      value={linkTextDraft}
                      onChange={(e) => setLinkTextDraft(e.target.value)}
                      aria-label="Visible link text"
                    />
                  </label>
                )}
                <label className={styles.linkPromptField}>
                  <span className={styles.linkPromptFieldLabel}>URL</span>
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
                      }
                    }}
                    aria-label="Link URL"
                  />
                </label>
                {linkError && (
                  <span className={styles.linkPromptError} role="alert">
                    {linkError}
                  </span>
                )}
                <div className={styles.linkPromptActions}>
                  <PublisherButton variant="primary" size="sm" onClick={applyLink}>
                    Apply link
                  </PublisherButton>
                  {editor.isActive('link') && (
                    <PublisherButton
                      variant="danger"
                      size="sm"
                      onClick={removeLink}
                    >
                      Remove link
                    </PublisherButton>
                  )}
                  <PublisherButton size="sm" onClick={() => closeLinkPrompt()}>
                    Cancel
                  </PublisherButton>
                </div>
              </motion.div>
            </FloatingFocusManager>
          )}
        </AnimatePresence>
      </FloatingPortal>
    </PublisherTooltipProvider>
  );
}

/**
 * Renders controls sliced by group, wrapping each run inside a
 * `.toolbarGroup` container with a semantic separator between groups.
 * Flat index is threaded through so the roving-tabindex refs stay
 * stable across groups.
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
  return groups.map((g, index) => (
    <React.Fragment key={g.id}>
      {index > 0 && <PublisherSeparator orientation="vertical" tone="faint" />}
      <div
        className={styles.toolbarGroup}
        role="group"
        aria-label={TOOLBAR_GROUP_LABELS[g.id] ?? 'Formatting'}
      >
        {g.items.map((item, i) => renderControl(item, g.start + i))}
      </div>
    </React.Fragment>
  ));
}

const TOOLBAR_GROUP_LABELS: Readonly<Record<number, string>> = {
  0: 'Inline formatting',
  1: 'Block structure',
  2: 'Lists and quotes',
  3: 'History',
};
