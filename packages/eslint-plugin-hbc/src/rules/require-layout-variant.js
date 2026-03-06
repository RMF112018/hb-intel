/**
 * Rule: require-layout-variant (D-02)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Enforces that every <WorkspacePageShell> usage includes a `layout` prop.
 * Valid variants: 'dashboard', 'list', 'form', 'detail', 'landing'.
 *
 * Binding decision D-02: all workspace pages must declare a layout variant
 * so the shell can apply the correct layout algorithm.
 * Set to 'error' in apps/.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require layout prop on WorkspacePageShell (D-02)',
      recommended: true,
    },
    schema: [],
    messages: {
      missingLayout:
        'WorkspacePageShell must include a `layout` prop (dashboard | list | form | detail | landing) (D-02).',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name && node.name.name;
        if (name !== 'WorkspacePageShell') return;

        const hasLayoutProp = node.attributes.some(
          (attr) =>
            attr.type === 'JSXAttribute' &&
            attr.name &&
            attr.name.name === 'layout',
        );

        if (!hasLayoutProp) {
          context.report({
            node,
            messageId: 'missingLayout',
          });
        }
      },
    };
  },
};
