'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WelcomeAlert } from '@/components/auth/WelcomeAlert';
import { USER_ROLES, REDIRECT_PATHS } from '@/lib/auth/constants';

import { useActivityStore } from '@/stores/activity';
import { Section } from '@/components/ui/section';
import ProfileEditComponent from '@/components/profile-edit-component';
import CartDisplayComponent from '@/components/cart-display-component';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LogOut,
  Mail,
  Building2,
  Calendar,
  ShoppingCart,
  Eye,
  Search,
  Settings,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const LoadingSkeleton = () => (
    <>
      <div className="bg-gradient-to-b from-primary via-primary/95 to-primary/90 pt-20 pb-32 sm:pt-32 sm:pb-40">
        <Section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/20" />
              <div>
                <Skeleton className="h-9 w-48 mb-3 bg-primary/20" />
                <Skeleton className="h-5 w-32 bg-primary/20" />
              </div>
            </div>
            <Skeleton className="h-12 w-full sm:w-32 bg-primary/20" />
          </div>
        </Section>
      </div>

      <Section className="py-8 sm:py-12 -mt-16 sm:-mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <Skeleton className="h-[400px] rounded-2xl" />
          <div className="lg:col-span-2">
            <Skeleton className="h-[500px] rounded-2xl" />
          </div>
        </div>
      </Section>
    </>
);

export default function AccountPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { activities: storeActivities } = useActivityStore();
  const [isClient, setIsClient] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  interface Activity {
    id: string;
    eventType: string;
    timestamp: string;
    data?: Record<string, unknown>;
  }

  const [dbActivities, setDbActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Redirect admins to admin dashboard
  // This prevents admin users from being able to access the customer account page
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === USER_ROLES.ADMIN) {
      console.log('[ACCOUNT_PAGE] Admin user redirected to admin dashboard', {
        userId: session.user?.id,
        role: session.user?.role,
        timestamp: new Date().toISOString(),
      });
      router.replace(REDIRECT_PATHS.ADMIN_DASHBOARD);
    }
  }, [status, session?.user?.role, router]);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchActivities = async () => {
        try {
          const response = await fetch('/api/user/activities?limit=20');
          if (response.ok) {
            const data = await response.json();
            setDbActivities(data);
          }
        } catch (error) {
          console.error('Failed to fetch activities:', error);
        }
      };

      fetchActivities();
    }
  }, [session?.user?.id]);

  // NOTE: Middleware (proxy.ts) handles authentication redirect to /login
  // This component is only reachable by authenticated users
  // No need for client-side auth checks - trust the proxy

  // Wait for session to load
  if (!isClient || status === 'loading') {
    return <LoadingSkeleton />;
  }

  // If no session, middleware should have redirected already
  if (!session?.user) {
    return <LoadingSkeleton />;
  }

  const user = session.user;

  const handleLogout = async () => {
    // Use NextAuth signOut instead of legacy logout
    const { signOut } = await import('next-auth/react');
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const transformedDbActivities = dbActivities.map((activity) => ({
    id: activity.id,
    type: (activity.eventType === 'quote_request' ? 'quote' : 
          activity.eventType === 'login' ? 'view' :
          activity.eventType === 'checkout' ? 'purchase' :
          'search') as 'quote' | 'view' | 'search' | 'purchase',
    title: activity.eventType === 'quote_request' ? 'Quote Request Submitted' :
           activity.eventType === 'login' ? 'Logged In' :
           activity.eventType === 'checkout' ? 'Checkout Completed' :
           activity.eventType === 'profile_update' ? 'Profile Updated' :
           activity.eventType === 'password_reset' ? 'Password Reset' :
           activity.eventType === 'email_verified' ? 'Email Verified' :
           activity.eventType === 'account_created' ? 'Account Created' :
           activity.eventType,
    description: activity.eventType === 'quote_request' ? 
      `Submitted quote request with ${activity.data?.itemCount || 0} items` :
      activity.eventType === 'login' ? 'Logged in to account' :
      activity.eventType === 'checkout' ? 'Completed checkout' :
      `Activity: ${activity.eventType}`,
    timestamp: new Date(activity.timestamp),
    metadata: activity.data,
    details: activity.data,
  }));

  // Merge store and database activities, sorted by timestamp
  const allActivities = [...storeActivities, ...transformedDbActivities]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  // Calculate stats from database activities
  const quoteRequestCount = dbActivities.filter((a) => a.eventType === 'quote_request').length;
  const checkoutCount = dbActivities.filter((a) => a.eventType === 'checkout').length;

  return (
    <>
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary via-primary/95 to-primary/90 pt-16 pb-28 sm:pt-24 sm:pb-36 md:pt-32 md:pb-44">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 opacity-60 blur-3xl"></div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -translate-y-1/2 -translate-x-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-primary/30 rounded-full blur-3xl"></div>

        <Section className="relative z-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 sm:gap-5 min-w-0">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-primary rounded-2xl opacity-0 group-hover:opacity-40 blur-lg transition-opacity"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center text-primary font-bold shadow-xl text-2xl sm:text-3xl md:text-4xl flex-shrink-0">
                  {user.firstName?.[0]}{user.lastName?.[0] || user.name?.split(' ')[1]?.[0] || ''}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.name || 'User'}
                </h1>
                <p className="text-primary-foreground/90 flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full bg-secondary flex-shrink-0"></span>
                  <span className="truncate">Active Now</span>
                </p>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </Section>
      </div>

      {/* Main Content */}
      <Section className="py-6 sm:py-10 md:py-12 -mt-12 sm:-mt-16 md:-mt-20 relative z-20">
        {/* Welcome Alert */}
        {showWelcome && session?.user && (
          <WelcomeAlert
            firstName={session.user.firstName || session.user.name?.split(' ')[0] || 'User'}
            isNewUser={session.user.isNewUser}
            lastLogin={session.user.lastLogin}
            onDismiss={() => setShowWelcome(false)}
          />
        )}

        {/* Stat Cards - Enhanced Mobile Responsiveness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
          {/* Quote Requests Card */}
          <div className="group relative flex flex-col rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 md:p-6 shadow-lg sm:shadow-2xl transition-all duration-300 hover:shadow-primary/20 hover:scale-[1.02] border border-secondary/20 hover:border-secondary/40">
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-secondary via-secondary/50 to-transparent opacity-0 group-hover:opacity-10 blur-lg transition-opacity"></div>
            <div className="absolute inset-px rounded-lg sm:rounded-[15px] bg-white"></div>
            
            <div className="relative space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex-shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-primary truncate">Quote Requests</h3>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-secondary flex-shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
                  <span className="hidden sm:inline">Live</span>
                </span>
              </div>

              <div className="rounded-lg bg-primary/5 p-3 sm:p-4 border border-primary/10">
                <p className="text-[10px] sm:text-xs font-medium text-primary/60 mb-1">Total Requests</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{quoteRequestCount}</p>
                <span className="text-[10px] sm:text-xs font-medium text-secondary mt-1 block">+{Math.max(2, Math.floor(quoteRequestCount * 0.15))} this month</span>
              </div>
            </div>
          </div>

          {/* Checkouts Card */}
          <div className="group relative flex flex-col rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 md:p-6 shadow-lg sm:shadow-2xl transition-all duration-300 hover:shadow-secondary/20 hover:scale-[1.02] border border-primary/20 hover:border-primary/40">
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary via-primary/50 to-transparent opacity-0 group-hover:opacity-10 blur-lg transition-opacity"></div>
            <div className="absolute inset-px rounded-lg sm:rounded-[15px] bg-white"></div>
            
            <div className="relative space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 flex-shrink-0">
                    <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-primary truncate">Checkouts</h3>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-primary flex-shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="hidden sm:inline">Active</span>
                </span>
              </div>

              <div className="rounded-lg bg-secondary/5 p-3 sm:p-4 border border-secondary/10">
                <p className="text-[10px] sm:text-xs font-medium text-secondary/60 mb-1">Total Checkouts</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{checkoutCount}</p>
                <span className="text-[10px] sm:text-xs font-medium text-primary mt-1 block">+{Math.max(0, checkoutCount > 0 ? 1 : 0)} this month</span>
              </div>
            </div>
          </div>

          {/* Total Activity Card */}
          <div className="group relative flex flex-col rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 md:p-6 shadow-lg sm:shadow-2xl transition-all duration-300 hover:shadow-accent/20 hover:scale-[1.02] border border-accent/20 hover:border-accent/40 sm:col-span-2 lg:col-span-1">
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-accent via-secondary/50 to-transparent opacity-0 group-hover:opacity-10 blur-lg transition-opacity"></div>
            <div className="absolute inset-px rounded-lg sm:rounded-[15px] bg-white"></div>
            
            <div className="relative space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-secondary/80 flex-shrink-0">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-primary truncate">Total Activity</h3>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium text-primary flex-shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                  <span className="hidden sm:inline">Track</span>
                </span>
              </div>

              <div className="rounded-lg bg-primary/5 p-3 sm:p-4 border border-primary/10">
                <p className="text-[10px] sm:text-xs font-medium text-primary/60 mb-1">Actions Logged</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary">{allActivities.length}</p>
                <span className="text-[10px] sm:text-xs font-medium text-secondary mt-1 block">+{Math.max(1, Math.floor(allActivities.length * 0.1))} new today</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Info & Activities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* User Details Sidebar */}
          <div className="group relative flex flex-col rounded-xl sm:rounded-2xl bg-white shadow-lg sm:shadow-2xl border border-primary/10 hover:border-primary/30 transition-all overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-secondary via-primary/50 to-transparent opacity-0 group-hover:opacity-5 blur-lg transition-opacity"></div>

            <div className="relative bg-gradient-to-r from-primary to-primary/95 border-b border-primary/20 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-base sm:text-lg font-bold text-white">Account Details</h2>
            </div>

            <div className="relative p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-primary/60 font-medium">Email</p>
                    <p className="text-xs sm:text-sm text-primary break-all font-medium mt-0.5">{user.email}</p>
                  </div>
                </div>

                {user.companyName && (
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-primary/60 font-medium">Company</p>
                      <p className="text-xs sm:text-sm text-primary font-medium mt-0.5">{user.companyName}</p>
                    </div>
                  </div>
                )}

                {user.role && (
                  <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-secondary/5 border border-secondary/20">
                    <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-secondary/60 font-medium">Role</p>
                      <p className="text-xs sm:text-sm text-primary font-medium mt-0.5 capitalize">{user.role}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-primary/60 font-medium">Last Login</p>
                    <p className="text-xs sm:text-sm text-primary font-medium mt-0.5">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Just now'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 border-t border-primary/10">
                <Button variant="outline" size="sm" className="w-full justify-center text-xs sm:text-sm" disabled>
                  <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Activities Feed */}
          <div className="lg:col-span-2 group relative flex flex-col rounded-xl sm:rounded-2xl bg-white shadow-lg sm:shadow-2xl border border-primary/10 overflow-hidden transition-all">
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary/50 to-transparent opacity-0 group-hover:opacity-5 blur-lg transition-opacity"></div>

            <div className="relative bg-gradient-to-r from-primary to-primary/95 border-b border-primary/20 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-secondary flex-shrink-0" />
                    Recent Activity
                  </h2>
                  <p className="text-[10px] sm:text-xs text-primary-foreground/70 mt-0.5">Your latest platform interactions</p>
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-primary-foreground/80 px-2 sm:px-3 py-1 rounded-full bg-primary/30 border border-primary-foreground/10 flex-shrink-0">
                  {allActivities.length}
                </span>
              </div>
            </div>

            <div className="relative p-3 sm:p-6 overflow-y-auto max-h-[400px] sm:max-h-[500px]">
              {allActivities.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {allActivities.map((activity) => {
                    const details = activity.details || activity.metadata as Record<string, unknown> | undefined;
                    return (
                      <div
                        key={activity.id}
                        className="group/item p-3 sm:p-4 rounded-lg bg-primary/5 border border-primary/10 hover:border-secondary/30 hover:bg-secondary/5 transition-all duration-200"
                      >
                        <div className="flex gap-2 sm:gap-3 md:gap-4">
                          <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center text-primary/80 group-hover/item:text-primary transition-colors">
                            {activity.type === 'quote' && <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {activity.type === 'view' && <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {activity.type === 'search' && <Search className="w-4 h-4 sm:w-5 sm:h-5" />}
                            {activity.type === 'purchase' && <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0 sm:gap-2 mb-1 sm:mb-2">
                              <h4 className="font-semibold text-xs sm:text-sm text-primary truncate">
                                {activity.title || activity.description}
                              </h4>
                              <span className="text-[10px] sm:text-xs text-primary/50 whitespace-nowrap">
                                {formatDistanceToNow(new Date(activity.timestamp), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-primary/60 line-clamp-2">
                              {activity.description}
                            </p>
                            {details && (
                              <div className="mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-primary/10 text-[10px] sm:text-xs text-primary/50 space-x-2 flex flex-wrap">
                                {details.items !== undefined && (
                                  <span>
                                    Items: <span className="text-primary/80 font-medium">{String(details.items)}</span>
                                  </span>
                                )}
                                {details.value !== undefined && (
                                  <span>
                                    Value: <span className="text-primary/80 font-medium">{String(details.value)}</span>
                                  </span>
                                )}
                                {details.results !== undefined && (
                                  <span>
                                    Results: <span className="text-primary/80 font-medium">{String(details.results)}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <Activity className="w-10 h-10 sm:w-12 sm:h-12 text-primary/20 mx-auto mb-3 sm:mb-4" />
                  <p className="text-primary/60 font-medium text-sm">No activities yet</p>
                  <p className="text-[10px] sm:text-xs text-primary/40 mt-1">
                    Your activities will appear here as you interact with the platform
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabbed Section for Profile, Cart, and Quotes */}
        <div className="mt-8 sm:mt-10 md:mt-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
              <TabsTrigger value="overview" className="truncate">Overview</TabsTrigger>
              <TabsTrigger value="profile" className="truncate">Profile</TabsTrigger>
              <TabsTrigger value="cart" className="truncate">Cart</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4 sm:mt-6">
              <div className="text-center py-8 sm:py-12 text-muted-foreground">
                <p className="text-sm sm:text-base">Switch to other tabs to manage your profile and cart items.</p>
              </div>
            </TabsContent>

            <TabsContent value="profile" className="mt-4 sm:mt-6">
              <ProfileEditComponent />
            </TabsContent>

            <TabsContent value="cart" className="mt-4 sm:mt-6">
              <CartDisplayComponent />
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </>
  );
}
