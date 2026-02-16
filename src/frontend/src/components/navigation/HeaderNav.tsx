import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogOut, LayoutDashboard, Shield, Wallet } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useGetCallerUserRole } from '../../hooks/useQueries';
import { useGetCallerBalance } from '../../hooks/useWallet';

export default function HeaderNav() {
  const { identity, clear, login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = !!identity;
  const { data: userRole } = useGetCallerUserRole();
  const { data: walletBalance } = useGetCallerBalance();
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
    { to: '/add-money', label: 'Add Money', authRequired: true },
    { to: '/buy-points', label: 'Buy Points', authRequired: true },
    { to: '/buy-diamonds', label: 'Topup Diamonds', authRequired: true },
    { to: '/ad-rewards', label: 'Earn Points', authRequired: true },
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
            <span className="text-xl font-bold text-primary">A7J TOPUP</span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Professional Top-Up Service
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinks />
        </nav>

        {/* Auth Button / User Menu */}
        <div className="flex items-center gap-3">
          {isAuthenticated && walletBalance !== undefined && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
              <Wallet className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                ৳{Number(walletBalance).toLocaleString()}
              </span>
            </div>
          )}
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
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate({ to: '/admin' })}>
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  </>
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
              className="hidden md:flex bg-primary hover:bg-primary/90 text-white"
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
                {isAuthenticated && walletBalance !== undefined && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg border border-primary/20 mb-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                      ৳{Number(walletBalance).toLocaleString()}
                    </span>
                  </div>
                )}
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
                  className="bg-primary hover:bg-primary/90 text-white mt-4"
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
