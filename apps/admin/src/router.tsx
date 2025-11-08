import { Navigate, createBrowserRouter } from 'react-router-dom';

import { AppLayout } from './components/layout/app-layout';
import { RequireAuth } from './components/require-auth';
import { LoginPage } from './routes/login';
import { DashboardPage } from './routes/dashboard';
import { ServicesPage } from './routes/services';
import { CasesPage } from './routes/cases';
import { ReviewsPage } from './routes/reviews';
import { BannersPage } from './routes/banners';
import { SettingsPage } from './routes/settings';
import { MediaLibraryPage } from './routes/media';

export const createAppRouter = () =>
  createBrowserRouter([
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: (
        <RequireAuth>
          <AppLayout />
        </RequireAuth>
      ),
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: 'services',
          element: <ServicesPage />,
        },
        {
          path: 'cases',
          element: <CasesPage />,
        },
        {
          path: 'reviews',
          element: <ReviewsPage />,
        },
        {
          path: 'banners',
          element: <BannersPage />,
        },
        {
          path: 'settings',
          element: <SettingsPage />,
        },
        {
          path: 'media',
          element: <MediaLibraryPage />,
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ]);
