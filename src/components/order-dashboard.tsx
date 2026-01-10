'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Edit2, Loader } from 'lucide-react';
import { useSession } from 'next-auth/react';
import RecentActivity from '@/components/recent-activity';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';

interface Order {
  id: string;
  reference: string;
  buyerContactEmail: string;
  buyerContactPhone?: string;
  status: string;
  total?: number;
  itemCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface UserProfile {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  companyName: string | null;
  companyPhone: string | null;
  businessType: string | null;
  businessRegistration: string | null;
}

export default function OrderDashboard() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    companyPhone: '',
    businessType: '',
    businessRegistration: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, profileRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/user/profile'),
        ]);

        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.orders || []);
          setStats({
            totalOrders: data.stats?.totalQuotes || 0,
            pendingOrders: data.stats?.pendingQuotes || 0,
            totalValue: data.stats?.totalValue || 0,
          });
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setProfileForm({
            firstName: profileData.firstName || '',
            lastName: profileData.lastName || '',
            phone: profileData.phone || '',
            companyName: profileData.companyName || '',
            companyPhone: profileData.companyPhone || '',
            businessType: profileData.businessType || '',
            businessRegistration: profileData.businessRegistration || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });

      if (response.ok) {
        const updated = await response.json();
        setProfile(updated);
        setIsEditModalOpen(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      negotiating: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (date: Date | string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(value);
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Account Details Section - Condensed Inline Edit */}
      {profile && !isEditModalOpen && (
        <Card className="rounded-lg sm:rounded-2xl border-0 sm:border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardHeader className="flex flex-row items-start justify-between px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex-1">
              <CardTitle className="text-base sm:text-lg mb-1">Account Details</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {profile.email}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs sm:text-sm h-8 sm:h-9 flex-shrink-0"
            >
              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase">Name</p>
                <p className="text-xs sm:text-sm font-medium line-clamp-1 mt-1">
                  {profile.firstName || profile.lastName 
                    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase">Phone</p>
                <p className="text-xs sm:text-sm font-medium line-clamp-1 mt-1">
                  {profile.phone || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase">Company</p>
                <p className="text-xs sm:text-sm font-medium line-clamp-1 mt-1">
                  {profile.companyName || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase">Business Type</p>
                <p className="text-xs sm:text-sm font-medium line-clamp-1 mt-1">
                  {profile.businessType || '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Section */}
      <RecentActivity />

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-lg sm:rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">quotes in system</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg sm:rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-yellow-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">awaiting action</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg sm:rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">completed orders</p>
          </CardContent>
        </Card>

        <Card className="rounded-lg sm:rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 sm:px-6 py-3 sm:py-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Completion Rate</CardTitle>
            <ShoppingBag className="h-4 w-4 text-purple-500 flex-shrink-0" />
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
            <div className="text-xl sm:text-2xl font-bold">
              {stats.totalOrders > 0 
                ? Math.round(((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100)
                : 0}%
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">orders completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="rounded-lg sm:rounded-xl overflow-hidden">
        <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="px-0 sm:px-6 pb-3 sm:pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              <Loader className="h-5 w-5 animate-spin mr-2" />
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground text-sm">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto -mx-3 sm:mx-0">
              <div className="inline-block min-w-full px-3 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow className="text-xs sm:text-sm">
                      <TableHead className="font-semibold">Order ID</TableHead>
                      <TableHead className="font-semibold hidden sm:table-cell">Customer</TableHead>
                      <TableHead className="font-semibold">Items</TableHead>
                      <TableHead className="font-semibold hidden md:table-cell">Date</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="text-xs sm:text-sm hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium text-[11px] sm:text-sm whitespace-nowrap">{order.reference}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm hidden sm:table-cell truncate max-w-xs">{order.buyerContactEmail}</TableCell>
                        <TableCell className="text-center">{order.itemCount}</TableCell>
                        <TableCell className="text-[10px] sm:text-sm hidden md:table-cell whitespace-nowrap">{formatDate(order.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(order.status)} text-[10px] sm:text-xs py-1`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold whitespace-nowrap text-[11px] sm:text-sm">
                          {formatCurrency(order.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-11/12 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Account Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="firstName" className="text-xs sm:text-sm">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profileForm.firstName}
                  onChange={handleProfileChange}
                  placeholder="Enter your first name"
                  className="mt-1 sm:mt-2 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs sm:text-sm">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profileForm.lastName}
                  onChange={handleProfileChange}
                  placeholder="Enter your last name"
                  className="mt-1 sm:mt-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter your phone number"
                  className="mt-1 sm:mt-2 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="companyPhone" className="text-xs sm:text-sm">Company Phone</Label>
                <Input
                  id="companyPhone"
                  name="companyPhone"
                  type="tel"
                  value={profileForm.companyPhone}
                  onChange={handleProfileChange}
                  placeholder="Enter company phone"
                  className="mt-1 sm:mt-2 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label htmlFor="companyName" className="text-xs sm:text-sm">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={profileForm.companyName}
                  onChange={handleProfileChange}
                  placeholder="Enter company name"
                  className="mt-1 sm:mt-2 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="businessType" className="text-xs sm:text-sm">Business Type</Label>
                <Input
                  id="businessType"
                  name="businessType"
                  value={profileForm.businessType}
                  onChange={handleProfileChange}
                  placeholder="e.g., Retailer, Wholesaler"
                  className="mt-1 sm:mt-2 text-sm"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="businessRegistration" className="text-xs sm:text-sm">Registration Number</Label>
              <Input
                id="businessRegistration"
                name="businessRegistration"
                value={profileForm.businessRegistration}
                onChange={handleProfileChange}
                placeholder="Enter registration number"
                className="mt-1 sm:mt-2 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2 sm:pt-4">
              <Button type="submit" disabled={isSaving} className="flex-1 text-sm">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" className="flex-1 text-sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
