import { createRootRoute, Outlet } from '@tanstack/react-router';
import { ShellLayout } from '@hbc/shell';

function RootComponent(): React.ReactNode {
  return (<ShellLayout mode="simplified"><Outlet /></ShellLayout>);
}
export const rootRoute = createRootRoute({ component: RootComponent });
