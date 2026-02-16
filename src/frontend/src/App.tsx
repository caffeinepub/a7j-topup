import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AddMoneyPage from './pages/AddMoneyPage';
import DashboardPage from './pages/DashboardPage';
import TopupPage from './pages/TopupPage';
import ContactUsPage from './pages/ContactUsPage';
import AdminPanelPage from './pages/admin/AdminPanelPage';
import IdCodeTopUpPage from './pages/IdCodeTopUpPage';
import BuyPointsPage from './pages/BuyPointsPage';
import BuyDiamondsWithPointsPage from './pages/BuyDiamondsWithPointsPage';
import AdRewardsPage from './pages/AdRewardsPage';
import AppShell from './components/layout/AppShell';
import AuthGate from './components/auth/AuthGate';
import AdminGate from './components/auth/AdminGate';

const rootRoute = createRootRoute({
  component: AppShell,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
});

const topupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/topup',
  component: TopupPage,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact-us',
  component: ContactUsPage,
});

const idCodeTopUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/id-code-top-up',
  component: IdCodeTopUpPage,
});

const addMoneyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/add-money',
  component: () => (
    <AuthGate>
      <AddMoneyPage />
    </AuthGate>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: () => (
    <AuthGate>
      <DashboardPage />
    </AuthGate>
  ),
});

const buyPointsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/buy-points',
  component: () => (
    <AuthGate>
      <BuyPointsPage />
    </AuthGate>
  ),
});

const buyDiamondsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/buy-diamonds',
  component: () => (
    <AuthGate>
      <BuyDiamondsWithPointsPage />
    </AuthGate>
  ),
});

const adRewardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ad-rewards',
  component: () => (
    <AuthGate>
      <AdRewardsPage />
    </AuthGate>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: () => (
    <AuthGate>
      <AdminGate>
        <AdminPanelPage />
      </AdminGate>
    </AuthGate>
  ),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  topupRoute,
  contactRoute,
  idCodeTopUpRoute,
  addMoneyRoute,
  dashboardRoute,
  buyPointsRoute,
  buyDiamondsRoute,
  adRewardsRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
