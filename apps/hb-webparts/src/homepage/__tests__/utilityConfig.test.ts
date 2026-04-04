import { describe, expect, it } from 'vitest';
import { normalizePriorityActionsRailConfig, normalizeToolLauncherWorkHubConfig } from '../helpers/utilityConfig.js';

describe('Prompt-05 utility config normalization', () => {
  it('groups and orders priority actions deterministically', () => {
    const result = normalizePriorityActionsRailConfig({
      groups: [
        { id: 'b', title: 'Backlog', order: 2 },
        { id: 'a', title: 'Now', order: 1 },
      ],
      actions: [
        { id: 'a2', title: 'Second', href: '/2', group: 'a', order: 2 },
        { id: 'a1', title: 'First', href: '/1', group: 'a', order: 1 },
      ],
    });

    expect(result.groups.map((g) => g.title)).toEqual(['Now']);
    expect(result.groups[0]?.actions.map((a) => a.title)).toEqual(['First', 'Second']);
  });

  it('filters audience-targeted actions and launchers', () => {
    const priority = normalizePriorityActionsRailConfig(
      {
        actions: [
          { id: 'field', title: 'Field Action', href: '/field', audiences: ['field'] },
          { id: 'admin', title: 'Admin Action', href: '/admin', audiences: ['admin'] },
        ],
      },
      'field',
    );

    expect(priority.groups.flatMap((g) => g.actions).map((a) => a.id)).toEqual(['field']);

    const launcher = normalizeToolLauncherWorkHubConfig(
      {
        groups: [
          {
            id: 'core',
            title: 'Core',
            items: [
              { id: 'field-tool', title: 'Field Tool', href: '/f', audiences: ['field'] },
              { id: 'admin-tool', title: 'Admin Tool', href: '/a', audiences: ['admin'] },
            ],
          },
        ],
      },
      'field',
    );

    expect(launcher.groups[0]?.items.map((item) => item.id)).toEqual(['field-tool']);
  });

  it('drops malformed config entries gracefully', () => {
    const result = normalizeToolLauncherWorkHubConfig({
      groups: [
        {
          id: 'broken',
          title: 'Broken',
          items: [
            { id: '', title: 'Bad', href: '/bad' },
            { id: 'missing-href', title: 'No href', href: '   ' },
          ],
        },
      ],
    });

    expect(result.groups).toEqual([]);
  });
});
