/**
 * Rule: no-manual-nav-active (D-04)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Disallows manual calls to setActiveNavItem(). Navigation active state
 * is automatically derived from the router by the shell system.
 *
 * Binding decision D-04: active navigation state is router-derived.
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
        'Disallow manual setActiveNavItem() calls — active state is router-derived (D-04)',
      recommended: true,
    },
    schema: [],
    messages: {
      noManualNav:
        'Do not call setActiveNavItem() manually. Navigation active state is automatically derived from the router (D-04).',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'setActiveNavItem'
        ) {
          context.report({
            node,
            messageId: 'noManualNav',
          });
        }
        /* Also catch object.setActiveNavItem() */
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'setActiveNavItem'
        ) {
          context.report({
            node,
            messageId: 'noManualNav',
          });
        }
      },
    };
  },
};
