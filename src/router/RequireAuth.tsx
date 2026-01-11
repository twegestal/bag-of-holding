import { Center, Loader } from '@mantine/core';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/auth';

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Center mih="60vh">
        <Loader />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
