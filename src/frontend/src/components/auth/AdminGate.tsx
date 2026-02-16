import { useGetCallerUserRole } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { UserRole } from '../../backend';
import AccessDeniedScreen from './AccessDeniedScreen';
import ClaimAdminAccessScreen from './ClaimAdminAccessScreen';
import { Loader2 } from 'lucide-react';

interface AdminGateProps {
  children: React.ReactNode;
}

export default function AdminGate({ children }: AdminGateProps) {
  const { data: userRole, isLoading } = useGetCallerUserRole();
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is admin, show the admin content
  if (userRole === UserRole.admin) {
    return <>{children}</>;
  }

  // If user is authenticated but not admin, show the claim admin access screen
  if (isAuthenticated) {
    return <ClaimAdminAccessScreen />;
  }

  // If user is not authenticated, show access denied
  return <AccessDeniedScreen />;
}
