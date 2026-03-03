/**
 * Root route — Blueprint §2c, §2f.
 * Renders ShellLayout mode='full' with <Outlet/>.
 * Shell callbacks wire to router.navigate() per ADR-0003.
 */
import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { ShellLayout, useProjectStore } from '@hbc/shell';
import type { WorkspaceId } from '@hbc/shell';

function RootComponent(): React.ReactNode {
  const router = useRouter();

  return (
    <ShellLayout
      mode="full"
      onWorkspaceSelect={(id: WorkspaceId) => {
        void router.navigate({ to: `/${id}` });
      }}
      onBackToProjectHub={() => {
        void router.navigate({ to: '/project-hub' });
      }}
      onProjectSelect={(project) => {
        useProjectStore.getState().setActiveProject(project);
      }}
    >
      <Outlet />
    </ShellLayout>
  );
}

export const rootRoute = createRootRoute({
  component: RootComponent,
});
