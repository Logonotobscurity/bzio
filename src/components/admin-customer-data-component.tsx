'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { USER_ROLES } from '@/lib/auth/constants';
import { Loader, Search, Mail, Phone, Building2, MapPin, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  id: number;
  type: string;
  label: string | null;
  contactPerson: string | null;
  addressLine1: string;
  city: string;
  state: string;
  isDefault: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
  unitPrice: number | null;
  product: {
    id: number;
    name: string;
    sku: string;
    price: number;
  };
}

interface Cart {
  id: string;
  status: string;
  items: CartItem[];
}

interface Quote {
  id: string;
  reference: string;
  status: string;
  total: number | null;
  createdAt: string;
  lines: Array<{
    id: string;
    qty: number;
    productName: string;
    unitPrice: number | null;
  }>;
}

interface CustomerDetail {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  companyName: string | null;
  companyPhone: string | null;
  businessType: string | null;
  businessRegistration: string | null;
  addresses: Address[];
  quotes: Quote[];
  carts: Cart[];
  createdAt: string;
  lastLogin: string | null;
}

interface CustomerSummary {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  companyName: string | null;
  createdAt: string;
  lastLogin: string | null;
}

export default function AdminCustomerDataComponent() {
  const { data: session } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageInfo, setPageInfo] = useState({ limit: 10, offset: 0, total: 0, hasMore: false });

  useEffect(() => {
    if (session?.user?.role !== USER_ROLES.ADMIN) {
      router.push('/dashboard');
      return;
    }
    fetchCustomers();
  }, [session, router]);

  const fetchCustomers = async (search = '', offset = 0) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageInfo.limit.toString(),
        offset: offset.toString(),
      });
      if (search) params.append('search', search);

      const response = await fetch(`/api/admin/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.data);
        setPageInfo({
          limit: data.limit,
          offset: data.offset,
          total: data.total,
          hasMore: data.hasMore,
        });
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetail = async (customerId: number) => {
    try {
      const response = await fetch(`/api/admin/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCustomer(data);
      }
    } catch (error) {
      console.error('Failed to fetch customer detail:', error);
      toast.error('Failed to load customer details');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchTerm, 0);
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (session?.user?.role !== USER_ROLES.ADMIN) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Access denied. Admin only.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {!selectedCustomer ? (
        <Card>
          <CardHeader>
            <CardTitle>
              Customers ({pageInfo.total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No customers found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Member Since</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map(customer => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell className="text-sm">{customer.email}</TableCell>
                        <TableCell className="text-sm">{customer.companyName || '-'}</TableCell>
                        <TableCell className="text-sm">{formatDate(customer.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => fetchCustomerDetail(customer.id)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {pageInfo.hasMore && (
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => fetchCustomers(searchTerm, pageInfo.offset + pageInfo.limit)}
                    >
                      Load More
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => setSelectedCustomer(null)}
          >
            ← Back to List
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </p>
                  <p className="font-medium text-sm">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone
                  </p>
                  <p className="font-medium text-sm">{selectedCustomer.phone || '-'}</p>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm">{formatDate(selectedCustomer.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Business Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{selectedCustomer.companyName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedCustomer.businessType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registration</p>
                  <p className="font-medium text-sm">{selectedCustomer.businessRegistration || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Company Phone</p>
                  <p className="font-medium text-sm">{selectedCustomer.companyPhone || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Total Quotes</p>
                  <p className="font-bold text-xl">{selectedCustomer.quotes.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Carts</p>
                  <p className="font-bold text-xl">
                    {selectedCustomer.carts.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium text-sm">
                    {selectedCustomer.lastLogin ? formatDate(selectedCustomer.lastLogin) : '-'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Details */}
          <Tabs defaultValue="addresses" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="addresses">Addresses ({selectedCustomer.addresses.length})</TabsTrigger>
              <TabsTrigger value="carts">Cart Items ({selectedCustomer.carts.reduce((sum, c) => sum + c.items.length, 0)})</TabsTrigger>
              <TabsTrigger value="quotes">Quotes ({selectedCustomer.quotes.length})</TabsTrigger>
            </TabsList>

            {/* Addresses */}
            <TabsContent value="addresses">
              <Card>
                <CardContent className="pt-6">
                  {selectedCustomer.addresses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No addresses on file</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedCustomer.addresses.map(address => (
                        <Card key={address.id} className="border">
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <Badge variant="outline">
                                  {address.type}
                                </Badge>
                                {address.isDefault && (
                                  <Badge className="bg-green-100 text-green-800">Default</Badge>
                                )}
                              </div>
                              {address.label && (
                                <p className="font-medium text-sm">{address.label}</p>
                              )}
                              {address.contactPerson && (
                                <p className="text-sm"><strong>Contact:</strong> {address.contactPerson}</p>
                              )}
                              <p className="text-sm">{address.addressLine1}</p>
                              <p className="text-sm">{address.city}, {address.state}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cart Items */}
            <TabsContent value="carts">
              <Card>
                <CardContent className="pt-6">
                  {selectedCustomer.carts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No carts</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedCustomer.carts.map(cart => (
                        <Card key={cart.id} className="border">
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Cart ({cart.items.length} items) - {cart.status}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {cart.items.length === 0 ? (
                              <p className="text-muted-foreground">Empty cart</p>
                            ) : (
                              <div className="space-y-2">
                                {cart.items.map(item => (
                                  <div key={item.id} className="flex justify-between text-sm border-b pb-2">
                                    <div>
                                      <p className="font-medium">{item.product.name}</p>
                                      <p className="text-xs text-muted-foreground">SKU: {item.product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-medium">
                                        {item.quantity}x {formatCurrency(item.unitPrice || item.product.price)}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Total: {formatCurrency((item.unitPrice || item.product.price) * item.quantity)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quotes */}
            <TabsContent value="quotes">
              <Card>
                <CardContent className="pt-6">
                  {selectedCustomer.quotes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">No quotes</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Reference</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedCustomer.quotes.map(quote => (
                            <TableRow key={quote.id}>
                              <TableCell className="font-medium">{quote.reference}</TableCell>
                              <TableCell>{quote.lines.length}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{quote.status}</Badge>
                              </TableCell>
                              <TableCell>{formatCurrency(quote.total)}</TableCell>
                              <TableCell>{formatDate(quote.createdAt)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
