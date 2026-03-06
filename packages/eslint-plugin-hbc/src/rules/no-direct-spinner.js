/**
 * Rule: no-direct-spinner (D-06)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Warns when page components render HbcSpinner or Spinner directly.
 * Loading state should be declared via WorkspacePageShell's `isLoading` prop,
 * which provides a consistent shimmer/skeleton experience.
 *
 * Binding decision D-06: loading state is shell-managed.
 * Set to 'warn' in apps/, 'off' in packages/ui-kit/.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

const SPINNER_COMPONENTS = new Set(['Spinner', 'HbcSpinner']);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow direct Spinner/HbcSpinner usage in pages — use WorkspacePageShell isLoading instead (D-06)',
      recommended: false,
    },
    schema: [],
    messages: {
      noDirectSpinner:
        'Do not render <{{component}}> directly. Use WorkspacePageShell isLoading prop instead (D-06).',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name && node.name.name;
        if (name && SPINNER_COMPONENTS.has(name)) {
          context.report({
            node,
            messageId: 'noDirectSpinner',
            data: { component: name },
          });
        }
      },
    };
  },
};
