# @hbc/ui-kit

## Storybook Development

All @hbc/ui-kit components are documented in Storybook with visual and accessibility testing.

### Starting Storybook

```bash
pnpm --filter @hbc/ui-kit storybook
```

Opens Storybook at [http://localhost:6006](http://localhost:6006)

### Mock Authentication in Storybook

Auth-dependent components automatically receive a mock authenticated user context. This is configured
via the global `withMockAuth` decorator in `.storybook/preview.tsx`.

**Mock User Details:**
- **Name:** HB Dev User
- **Email:** dev.user@hbcorp.com
- **Roles:** Estimator, ProjectManager
- **ID:** storybook-dev-user-001

The mock user is only available in Storybook; it is **not** exported from @hbc/ui-kit and
is **not** included in production builds.

### Adding New Stories

When creating a story for an auth-dependent component:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { HbcAppShell } from './index';

const meta: Meta<typeof HbcAppShell> = {
  component: HbcAppShell,
  title: 'Components/HbcAppShell',
};

export default meta;
type Story = StoryObj<typeof HbcAppShell>;

export const Default: Story = {
  // No auth mocking needed — global decorator handles it
  render: () => <HbcAppShell>{/* content */}</HbcAppShell>,
};
```

The `withMockAuth` decorator automatically initializes auth state, so components that call
auth hooks (`useCurrentUser()`, `useResolvedRuntimeMode()`, `usePermission()`) receive mock data.

### Testing Role-Specific Behavior

To test stories with different roles (e.g., FieldUser), update the Storybook mock persona wiring in:
- `.storybook/mockAuth.ts`
- `.storybook/decorators/withMockAuth.tsx`

### Accessibility Testing

Storybook includes the Axe accessibility addon. For every new component:

1. Write stories covering all visual states (light, field, disabled, etc.)
2. Open Storybook and navigate to the component
3. Addons panel -> Accessibility
4. Verify 0 critical and 0 serious violations
5. Commit stories alongside component code

See `PH4C.8` (Verification & Testing) for full A11y sweep requirements.

### Building Storybook Static Site

To generate a static Storybook build:

```bash
pnpm --filter @hbc/ui-kit build-storybook
# Output: packages/ui-kit/storybook-static/
```

## Architecture References

- `docs/architecture/adr/ADR-0075-dev-auth-bypass-storybook-boundary.md` — MockAdapter boundary
- `packages/ui-kit/.storybook/mockAuth.ts` — Mock user configuration
- `packages/ui-kit/.storybook/decorators/withMockAuth.tsx` — Decorator implementation
