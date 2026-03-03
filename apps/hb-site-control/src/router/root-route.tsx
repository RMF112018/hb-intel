/**
 * Root route — Blueprint §2c, §2f.
 * ShellLayout mode='simplified' for mobile field app (no ProjectPicker, no AppLauncher).
 */
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ShellLayout } from '@hbc/shell';

function RootComponent(): React.ReactNode {
  return (
    <ShellLayout mode="simplified">
      <Outlet />
    </ShellLayout>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
