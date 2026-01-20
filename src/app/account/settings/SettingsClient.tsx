'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Bell, Shield, Save, MapPin, Building2, Plus, Trash2, Loader2 } from 'lucide-react';
import {
  updateUserProfile,
  createAddress,
  deleteAddress,
  setDefaultAddress,
  updateCompany,
  changePassword,
  updateNotificationPreferences,
} from '../_actions/settings';

interface Address {
  id: number;
  type: 'BILLING' | 'SHIPPING';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface Company {
  id: number;
  name: string;
  industry: string;
  website: string;
  isVerified: boolean;
}

interface Profile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  company: Company | null;
  addresses: Address[];
}

interface NotificationPrefs {
  emailNotifications: boolean;
  marketingEmails: boolean;
  quoteUpdates: boolean;
  productAlerts: boolean;
}

interface SettingsClientProps {
  profile: Profile;
  notificationPrefs: NotificationPrefs;
}

export default function SettingsClient({ profile, notificationPrefs }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition();
  
  // Profile state
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [phone, setPhone] = useState(profile.phone);
  
  // Company state
  const [companyName, setCompanyName] = useState(profile.company?.name || '');
  const [industry, setIndustry] = useState(profile.company?.industry || '');
  const [website, setWebsite] = useState(profile.company?.website || '');
  
  // Address state
  const [addresses, setAddresses] = useState<Address[]>(profile.addresses);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    type: 'BILLING' as 'BILLING' | 'SHIPPING',
    isDefault: false,
  });
  
  // Password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Notification preferences - initialized from server data
  const [emailNotifications, setEmailNotifications] = useState(notificationPrefs.emailNotifications);
  const [marketingEmails, setMarketingEmails] = useState(notificationPrefs.marketingEmails);
  const [quoteUpdates, setQuoteUpdates] = useState(notificationPrefs.quoteUpdates);
  const [productAlerts, setProductAlerts] = useState(notificationPrefs.productAlerts);
  
  // Messages
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Profile handlers
  const handleSaveProfile = () => {
    startTransition(async () => {
      try {
        await updateUserProfile({ firstName, lastName, phone });
        showMessage('success', 'Profile updated successfully');
      } catch {
        showMessage('error', 'Failed to update profile');
      }
    });
  };

  // Company handlers
  const handleSaveCompany = () => {
    startTransition(async () => {
      try {
        await updateCompany({
          name: companyName,
          industry,
          website: website || undefined,
        });
        showMessage('success', 'Company information updated');
      } catch {
        showMessage('error', 'Failed to update company');
      }
    });
  };

  // Address handlers
  const handleAddAddress = () => {
    startTransition(async () => {
      try {
        const result = await createAddress(newAddress);
        if (result.success && result.address) {
          setAddresses([...addresses, result.address as Address]);
          setShowAddressDialog(false);
          setNewAddress({
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'Nigeria',
            type: 'BILLING',
            isDefault: false,
          });
          showMessage('success', 'Address added successfully');
        }
      } catch {
        showMessage('error', 'Failed to add address');
      }
    });
  };

  const handleDeleteAddress = (addressId: number) => {
    startTransition(async () => {
      try {
        await deleteAddress(addressId);
        setAddresses(addresses.filter(a => a.id !== addressId));
        showMessage('success', 'Address removed');
      } catch {
        showMessage('error', 'Failed to delete address');
      }
    });
  };

  const handleSetDefault = (addressId: number) => {
    startTransition(async () => {
      try {
        await setDefaultAddress(addressId);
        const addr = addresses.find(a => a.id === addressId);
        if (addr) {
          setAddresses(addresses.map(a => ({
            ...a,
            isDefault: a.id === addressId && a.type === addr.type ? true : 
                       a.type === addr.type ? false : a.isDefault
          })));
        }
        showMessage('success', 'Default address updated');
      } catch {
        showMessage('error', 'Failed to set default address');
      }
    });
  };

  // Password handler
  const handleChangePassword = () => {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    startTransition(async () => {
      try {
        const result = await changePassword({
          currentPassword,
          newPassword,
          confirmPassword,
        });
        if (result.success) {
          setShowPasswordDialog(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          showMessage('success', 'Password changed successfully');
        } else {
          setPasswordError(result.error || 'Failed to change password');
        }
      } catch {
        setPasswordError('Failed to change password');
      }
    });
  };

  // Notification preferences handler
  const handleSaveNotifications = () => {
    startTransition(async () => {
      try {
        await updateNotificationPreferences({
          emailNotifications,
          marketingEmails,
          quoteUpdates,
          productAlerts,
        });
        showMessage('success', 'Notification preferences saved');
      } catch {
        showMessage('error', 'Failed to save preferences');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled className="bg-gray-50" />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
          <Button onClick={handleSaveProfile} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Address Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Addresses</CardTitle>
            </div>
            <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                  <DialogDescription>Enter your address details</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={newAddress.type} onValueChange={(v) => setNewAddress({...newAddress, type: v as 'BILLING' | 'SHIPPING'})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BILLING">Billing</SelectItem>
                        <SelectItem value="SHIPPING">Shipping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Street Address</Label>
                    <Input value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Input value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Postal Code</Label>
                      <Input value={newAddress.postalCode} onChange={(e) => setNewAddress({...newAddress, postalCode: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input value={newAddress.country} onChange={(e) => setNewAddress({...newAddress, country: e.target.value})} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={newAddress.isDefault} onCheckedChange={(v) => setNewAddress({...newAddress, isDefault: v})} />
                    <Label>Set as default</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddressDialog(false)}>Cancel</Button>
                  <Button onClick={handleAddAddress} disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Add Address
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Manage your billing and shipping addresses</CardDescription>
        </CardHeader>
        <CardContent>
          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div key={address.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={address.type === 'BILLING' ? 'default' : 'secondary'}>
                        {address.type}
                      </Badge>
                      {address.isDefault && <Badge variant="outline">Default</Badge>}
                    </div>
                    <p className="text-sm">{address.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-muted-foreground">{address.country}</p>
                  </div>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)}>
                        Set Default
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(address.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No addresses added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <CardTitle>Company Information</CardTitle>
          </div>
          <CardDescription>Business details for B2B transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Company name"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Industry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <Button onClick={handleSaveCompany} disabled={isPending || !companyName}>
            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Company Info
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive updates about your quotes and orders</p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Quote Updates</p>
              <p className="text-sm text-muted-foreground">Get notified when your quotes are updated</p>
            </div>
            <Switch checked={quoteUpdates} onCheckedChange={setQuoteUpdates} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Product Alerts</p>
              <p className="text-sm text-muted-foreground">Receive alerts about products you viewed</p>
            </div>
            <Switch checked={productAlerts} onCheckedChange={setProductAlerts} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Marketing Emails</p>
              <p className="text-sm text-muted-foreground">Receive news, promotions, and product updates</p>
            </div>
            <Switch checked={marketingEmails} onCheckedChange={setMarketingEmails} />
          </div>
          <Button onClick={handleSaveNotifications} disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Change Password</p>
              <p className="text-sm text-muted-foreground">Update your password regularly for security</p>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">Change</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Enter your current password and choose a new one</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {passwordError && (
                    <div className="p-3 bg-red-50 text-red-800 rounded-lg text-sm">{passwordError}</div>
                  )}
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                  <Button onClick={handleChangePassword} disabled={isPending}>
                    {isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Change Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" disabled>Coming Soon</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
