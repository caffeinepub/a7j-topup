import { Outlet } from '@tanstack/react-router';
import HeaderNav from '../navigation/HeaderNav';
import SiteFooter from './SiteFooter';

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <HeaderNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
