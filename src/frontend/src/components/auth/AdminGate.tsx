import { ReactNode } from 'react';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { UserRole } from '../../backend';
import AccessDeniedScreen from './AccessDeniedScreen';
import ClaimAdminAccessScreen from './ClaimAdminAccessScreen';

interface AdminGateProps {
  children: ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: role, isLoading: roleLoading } = useGetCallerUserRole();

  // Show loading state while checking authentication and role
  if (isInitializing || roleLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show access denied
  if (!identity) {
    return <AccessDeniedScreen />;
  }

  // Authenticated but not admin - show claim admin access screen
  if (role !== UserRole.admin) {
    return <ClaimAdminAccessScreen />;
  }

  // Admin user - show admin content
  return <>{children}</>;
}
