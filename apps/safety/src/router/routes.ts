import { createRoute, lazyRouteComponent } from '@tanstack/react-router';
import { useNavStore } from '@hbc/shell';
import { rootRoute } from './root-route.js';

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => { useNavStore.getState().setActiveWorkspace('safety'); },
  component: lazyRouteComponent(() =>
    import('../pages/UploadPage.js').then((m) => ({ default: m.UploadPage })),
  ),
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upload',
  component: lazyRouteComponent(() =>
    import('../pages/UploadPage.js').then((m) => ({ default: m.UploadPage })),
  ),
});

const periodsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/periods',
  component: lazyRouteComponent(() =>
    import('../pages/ReportingPeriodDashboardPage.js').then((m) => ({
      default: m.ReportingPeriodDashboardPage,
    })),
  ),
});

const projectWeekRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects/$projectNumber/weeks/$weekStartDate',
  component: lazyRouteComponent(() =>
    import('../pages/ProjectWeekDetailPage.js').then((m) => ({ default: m.ProjectWeekDetailPage })),
  ),
});

const inspectionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inspections',
  component: lazyRouteComponent(() =>
    import('../pages/InspectionsPage.js').then((m) => ({ default: m.InspectionsPage })),
  ),
});

const inspectionDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inspections/$inspectionEventId',
  component: lazyRouteComponent(() =>
    import('../pages/InspectionDetailPage.js').then((m) => ({ default: m.InspectionDetailPage })),
  ),
});

const reviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/review',
  component: lazyRouteComponent(() =>
    import('../pages/ReviewQueuePage.js').then((m) => ({ default: m.ReviewQueuePage })),
  ),
});

const incidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/incidents',
  component: lazyRouteComponent(() =>
    import('../pages/IncidentsPage.js').then((m) => ({ default: m.IncidentsPage })),
  ),
});

export const webpartRoutes = [
  indexRoute,
  uploadRoute,
  periodsRoute,
  projectWeekRoute,
  inspectionsRoute,
  inspectionDetailRoute,
  reviewRoute,
  incidentsRoute,
];
