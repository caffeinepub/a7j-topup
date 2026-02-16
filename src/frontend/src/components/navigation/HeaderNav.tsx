import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useGetCallerUserRole } from '../../hooks/useQueries';

export default function HeaderNav() {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;
  const { data: userRole } = useGetCallerUserRole();
  const isAdmin = userRole === 'admin';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      navigate({ to: '/login' });
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/topup', label: 'Topup' },
    { to: '/add-money', label: 'Add Money', authRequired: true },
    { to: '/contact-us', label: 'Contact Us' },
  ];

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      {navLinks.map((link) => {
        if (link.authRequired && !isAuthenticated) return null;
        return (
          <Link
            key={link.to}
            to={link.to}
            className={`${
              mobile ? 'block py-2' : ''
            } text-foreground/70 hover:text-primary transition-colors font-medium`}
            onClick={() => mobile && setMobileOpen(false)}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/assets/generated/a7j-logo.dim_512x512.png"
            alt="A7J TOPUP"
            className="h-10 w-10"
          />
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gradient-purple">A7J TOPUP</span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Fast & Secure Gaming Topup Service
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        {/* Auth Button / User Menu */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full border-primary/30 hover:border-primary">
                  <User className="h-5 w-5 text-primary" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuItem onClick={() => navigate({ to: '/dashboard' })}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAuth}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleAuth}
              disabled={loginStatus === 'logging-in'}
              className="btn-purple-gradient hidden md:flex"
            >
              {loginStatus === 'logging-in' ? 'Logging in...' : 'Login'}
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 bg-white">
              <nav className="flex flex-col gap-4 mt-8">
                <NavLinks mobile />
                {isAuthenticated && (
                  <>
                    <Link
                      to="/dashboard"
                      className="block py-2 text-foreground/70 hover:text-primary transition-colors font-medium"
                      onClick={() => setMobileOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block py-2 text-foreground/70 hover:text-primary transition-colors font-medium"
                        onClick={() => setMobileOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                  </>
                )}
                <Button
                  onClick={() => {
                    handleAuth();
                    setMobileOpen(false);
                  }}
                  disabled={loginStatus === 'logging-in'}
                  className="btn-purple-gradient mt-4"
                >
                  {isAuthenticated ? 'Logout' : 'Login'}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
