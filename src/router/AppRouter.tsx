import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { ModalsProvider } from '@mantine/modals';
import { RequireAuth } from './RequireAuth';
import { LoginPage } from '../core/auth/Login';
import { RegisterPage } from '../core/auth/Register';
import { AuthCallback } from '../core/auth/AuthCallback';
import { AppShellLayout } from '../core/layout/AppShellLayout';
import { CharactersPage } from '../features/characters/CharactersPage';
import { CharacterItemsPage } from '../features/characters/CharacterItemPage';
import { CharacterCurrencyPage } from '../features/characters/CharacterCurrencyPage';

function RouterLevelProviders() {
  return (
    <ModalsProvider>
      <Outlet />
    </ModalsProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <RouterLevelProviders />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/auth/callback', element: <AuthCallback /> },

      {
        element: <RequireAuth />,
        children: [
          {
            element: <AppShellLayout />,
            children: [
              { index: true, element: <Navigate to="/characters" replace /> },
              { path: '/characters', element: <CharactersPage /> },
              {
                path: '/characters/:characterId',
                children: [
                  { index: true, element: <Navigate to="items" replace /> },
                  { path: 'items', element: <CharacterItemsPage /> },
                  { path: 'currency', element: <CharacterCurrencyPage /> },
                ],
              },
            ],
          },
        ],
      },

      { path: '*', element: <Navigate to="/characters" replace /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
