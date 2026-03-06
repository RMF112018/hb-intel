/**
 * Rule: no-inline-feedback (D-08)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Warns when page components use raw Alert, MessageBar, or similar feedback
 * components directly. Feedback should flow through HbcToast, HbcBanner,
 * or WorkspacePageShell's built-in feedback mechanisms.
 *
 * Binding decision D-08: feedback is system-managed, not inline.
 * Set to 'warn' in apps/, 'off' in packages/ui-kit/.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

/** Components that indicate inline feedback patterns */
const FORBIDDEN_FEEDBACK = new Set([
  'Alert',
  'MessageBar',
  'MessageBarBody',
  'MessageBarTitle',
  'MessageBarActions',
  'InlineAlert',
]);

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow inline feedback components — use HbcToast/HbcBanner or shell feedback (D-08)',
      recommended: false,
    },
    schema: [],
    messages: {
      noInlineFeedback:
        '<{{component}}> should not be used directly. Use HbcToast, HbcBanner, or WorkspacePageShell feedback props instead (D-08).',
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const name = node.name && node.name.name;
        if (name && FORBIDDEN_FEEDBACK.has(name)) {
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
