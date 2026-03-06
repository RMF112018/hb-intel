/**
 * Rule: no-direct-buttons-in-content (D-03)
 * PH4B.4 §4b.4.4 — Command Bar & Page Actions
 *
 * Warns when HbcButton or Button is a direct child of WorkspacePageShell.
 * Page actions must flow through the `actions` prop instead, which renders
 * them in the command bar area with proper responsive behavior.
 *
 * Binding decision D-03: page actions flow through WorkspacePageShell actions prop.
 * Set to 'warn' in apps/.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

const BUTTON_COMPONENTS = new Set(['HbcButton', 'Button']);

module.exports = {
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
