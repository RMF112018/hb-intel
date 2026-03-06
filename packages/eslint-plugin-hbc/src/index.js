/**
 * eslint-plugin-hbc — Local ESLint plugin for HBC Design System enforcement
 * Phase 4.15 §15 — "Build Modern From Day One"
 *
 * Rule: enforce-hbc-tokens
 * Warns on hardcoded hex color string literals (#xxxxxx).
 * Use HBC design tokens from @hbc/ui-kit/theme instead.
 */
'use strict';

const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/;

/** @type {import('eslint').Rule.RuleModule} */
const enforceHbcTokens = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce usage of HBC design tokens instead of hardcoded hex color values',
      recommended: false,
    },
    schema: [],
    messages: {
      noHardcodedHex:
        'Hardcoded hex value detected. Use HBC design tokens from @hbc/ui-kit/theme instead.',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && HEX_PATTERN.test(node.value)) {
          context.report({
            node,
            messageId: 'noHardcodedHex',
          });
        }
      },
    };
  },
};

/**
 * Rule: no-direct-buttons-in-content (D-03)
 * PH4B.4 §4b.4.4 — Warns when HbcButton or Button is a direct child of WorkspacePageShell.
 * Page actions must flow through the `actions` prop instead.
 */
const BUTTON_COMPONENTS = new Set(['HbcButton', 'Button']);

/** @type {import('eslint').Rule.RuleModule} */
const noDirectButtonsInContent = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow HbcButton/Button as direct children of WorkspacePageShell content (D-03)',
      recommended: false,
    },
    schema: [],
    messages: {
      noDirectButton:
        'Do not place {{component}} directly inside WorkspacePageShell content. Pass actions via the `actions` prop instead (D-03).',
    },
  },
  create(context) {
    return {
      JSXElement(node) {
        const opening = node.openingElement;
        if (!opening.name || opening.name.name !== 'WorkspacePageShell') return;

        for (const child of node.children) {
          if (child.type !== 'JSXElement') continue;
          const childName = child.openingElement.name?.name;
          if (childName && BUTTON_COMPONENTS.has(childName)) {
            context.report({
              node: child,
              messageId: 'noDirectButton',
              data: { component: childName },
            });
          }
        }
      },
    };
  },
};

/**
 * Rule: no-inline-feedback (D-08)
 * PH4B.9 §12 (4b.9.5) — Warns when Alert, MessageBar, InlineNotification,
 * or any inline feedback component appears in page files.
 * All transient feedback must use useToast(); persistent page-level warnings
 * must use the banner prop on WorkspacePageShell.
 */
const INLINE_FEEDBACK_COMPONENTS = new Set([
  'Alert',
  'MessageBar',
  'MessageBarBody',
  'MessageBarTitle',
  'MessageBarActions',
  'InlineNotification',
  'InlineAlert',
  'Toast',
  'Toaster',
  'ToastTitle',
  'ToastBody',
]);

/** @type {import('eslint').Rule.RuleModule} */
const noInlineFeedback = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow inline feedback components (D-08). Use useToast() for transient feedback or the banner prop on WorkspacePageShell for persistent warnings.',
      recommended: false,
    },
    schema: [],
    messages: {
      noInlineFeedback:
        'Do not use <{{component}}> for inline feedback (D-08). Use useToast() for transient messages or the banner prop on WorkspacePageShell for persistent warnings.',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name?.name;
        if (name && INLINE_FEEDBACK_COMPONENTS.has(name)) {
          context.report({
            node,
            messageId: 'noInlineFeedback',
            data: { component: name },
          });
        }
      },
    };
  },
};

module.exports = {
  rules: {
    'enforce-hbc-tokens': enforceHbcTokens,
    'no-direct-buttons-in-content': noDirectButtonsInContent,
    'no-inline-feedback': noInlineFeedback,
  },
};
