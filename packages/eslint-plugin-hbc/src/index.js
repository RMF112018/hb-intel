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

module.exports = {
  rules: {
    'enforce-hbc-tokens': enforceHbcTokens,
    'no-direct-buttons-in-content': noDirectButtonsInContent,
  },
};
