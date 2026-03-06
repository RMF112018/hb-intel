/**
 * Rule: require-workspace-page-shell (D-01)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Enforces that files matching *Page.tsx export a component that uses
 * WorkspacePageShell as its root layout wrapper. This ensures all workspace
 * pages have consistent chrome, navigation, and layout structure.
 *
 * Binding decision D-01: all workspace pages must use WorkspacePageShell.
 * Set to 'error' in apps/.
 *
 * Detection strategy: checks that the file imports WorkspacePageShell.
 * Files not matching *Page.tsx are ignored.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require WorkspacePageShell in *Page.tsx files (D-01)',
      recommended: true,
    },
    schema: [],
    messages: {
      missingShell:
        'Page component files (*Page.tsx) must import and use WorkspacePageShell (D-01).',
    },
  },
  create(context) {
    const filename = context.getFilename();
    /* Only apply to files matching *Page.tsx */
    if (!filename.endsWith('Page.tsx')) return {};

    let hasShellImport = false;

    return {
      ImportDeclaration(node) {
        const source = node.source.value;
        if (typeof source !== 'string') return;

        for (const spec of node.specifiers) {
          if (
            (spec.type === 'ImportSpecifier' && spec.imported.name === 'WorkspacePageShell') ||
            (spec.type === 'ImportDefaultSpecifier' && spec.local.name === 'WorkspacePageShell')
          ) {
            hasShellImport = true;
          }
        }
      },
      'Program:exit'(node) {
        if (!hasShellImport) {
          context.report({
            node,
            messageId: 'missingShell',
          });
        }
      },
    };
  },
};
