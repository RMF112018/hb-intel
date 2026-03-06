/**
 * Rule: no-inline-styles (D-10)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Warns when JSX elements use the `style` prop with inline style objects.
 * Prefer Griffel makeStyles or ui-kit component props for styling.
 *
 * Binding decision D-10: consistent styling through the design system.
 * Set to 'warn' in apps/, 'off' in packages/ui-kit/ (components may use inline styles internally).
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow inline style props in JSX — use Griffel makeStyles or ui-kit component props instead (D-10)',
      recommended: false,
    },
    schema: [],
    messages: {
      noInlineStyle:
        'Inline style prop detected. Use Griffel makeStyles or ui-kit component props instead (D-10).',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name &&
          node.name.name === 'style' &&
          node.value &&
          node.value.type === 'JSXExpressionContainer'
        ) {
          context.report({
            node,
            messageId: 'noInlineStyle',
          });
        }
      },
    };
  },
};
