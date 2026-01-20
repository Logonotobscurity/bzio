import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { USER_ROLES } from '@/lib/auth-constants';
import {
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Bell,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth';

interface AccountLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: '/account', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/account/quotes', icon: FileText, label: 'Quotes' },
  { href: '/account/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/account/notifications', icon: Bell, label: 'Notifications' },
  { href: '/account/settings', icon: Settings, label: 'Settings' },
];

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await auth();

  // Redirect unauthenticated users
  if (!session?.user) {
    redirect('/login?callbackUrl=/account');
  }

  const userName = session.user.name || session.user.email || 'User';
  const userRole = (session.user as { role?: string }).role;
  const isAdmin = userRole === USER_ROLES.ADMIN;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <span className="font-semibold text-lg">My Account</span>
        <div className="text-sm text-muted-foreground">{userName}</div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <Link href="/account" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl">My Account</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}

            {/* Admin Panel Link (only for admins) */}
            {isAdmin && (
              <>
                <div className="my-4 border-t" />
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <Shield className="h-5 w-5" />
                  Admin Panel
                </Link>
              </>
            )}
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole?.toLowerCase() || 'User'}</p>
              </div>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <Button variant="outline" size="sm" className="w-full" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
