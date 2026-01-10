'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, MapPin, Loader } from 'lucide-react';
import { toast } from 'sonner';

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

interface Address {
  id: number;
  type: string;
  label: string | null;
  contactPerson: string | null;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export default function ProfileEditComponent() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    companyName: '',
    companyPhone: '',
    businessType: '',
    businessRegistration: '',
  });

  const [addressForm, setAddressForm] = useState({
    type: 'shipping',
    label: '',
    contactPerson: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
    isDefault: false,
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
      fetchAddresses();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setProfileForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phone: data.phone || '',
          companyName: data.companyName || '',
          companyPhone: data.companyPhone || '',
          businessType: data.businessType || '',
          businessRegistration: data.businessRegistration || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addressForm.addressLine1 || !addressForm.city || !addressForm.state) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const method = editingAddressId ? 'PUT' : 'POST';
      const url = editingAddressId
        ? `/api/user/addresses/${editingAddressId}`
        : '/api/user/addresses';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });

      if (response.ok) {
        await fetchAddresses();
        resetAddressForm();
        toast.success(editingAddressId ? 'Address updated' : 'Address added');
      } else {
        toast.error('Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('An error occurred');
    }
  };

  const handleEditAddress = (address: Address) => {
    setAddressForm({
      type: address.type,
      label: address.label || '',
      contactPerson: address.contactPerson || '',
      phone: address.phone || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode || '',
      country: address.country,
      isDefault: address.isDefault,
    });
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAddresses();
        toast.success('Address deleted');
      } else {
        toast.error('Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('An error occurred');
    } finally {
      setDeletingAddressId(null);
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'shipping',
      label: '',
      contactPerson: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Nigeria',
      isDefault: false,
    });
    setEditingAddressId(null);
    setIsAddingAddress(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 text-xs sm:text-sm">
          <TabsTrigger value="account">Account Details</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        {/* Account Details Tab */}
        <TabsContent value="account" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="rounded-lg sm:rounded-2xl border-0 sm:border">
            <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
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
                    <Label htmlFor="email" className="text-xs sm:text-sm">Email (Read-only)</Label>
                    <Input
                      id="email"
                      disabled
                      value={profile?.email || ''}
                      className="mt-1 sm:mt-2 text-sm"
                    />
                  </div>
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
                </div>

                <div className="border-t pt-4 sm:pt-6">
                  <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4">Business Information</h3>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
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
                  </div>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto text-sm sm:text-base">
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {!isAddingAddress ? (
            <>
              <Button onClick={() => setIsAddingAddress(true)} className="w-full sm:w-auto text-sm sm:text-base">
                <Plus className="h-4 w-4 mr-2" />
                Add New Address
              </Button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {addresses.map(address => (
                  <Card key={address.id} className="rounded-lg sm:rounded-xl">
                    <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="h-4 w-4 flex-shrink-0" />
                          <CardTitle className="text-sm sm:text-base truncate">
                            {address.label || address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                          </CardTitle>
                        </div>
                        {address.isDefault && (
                          <span className="text-[10px] sm:text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex-shrink-0">
                            Default
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1 sm:space-y-2 text-[11px] sm:text-sm px-3 sm:px-6 pb-3 sm:pb-4">
                      {address.contactPerson && (
                        <p><strong>Contact:</strong> {address.contactPerson}</p>
                      )}
                      <p className="line-clamp-1">{address.addressLine1}</p>
                      {address.addressLine2 && <p className="line-clamp-1">{address.addressLine2}</p>}
                      <p>
                        {address.city}, {address.state} {address.postalCode}
                      </p>
                      <p>{address.country}</p>
                      {address.phone && (
                        <p><strong>Phone:</strong> {address.phone}</p>
                      )}

                      <div className="flex gap-1 sm:gap-2 pt-2 sm:pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditAddress(address)}
                          className="flex-1 text-xs sm:text-sm h-7 sm:h-9"
                        >
                          <Edit2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 flex-1 text-xs sm:text-sm h-7 sm:h-9"
                          onClick={() => setDeletingAddressId(address.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {addresses.length === 0 && (
                <Card>
                  <CardContent className="pt-6 sm:pt-8 text-center text-muted-foreground text-sm">
                    No addresses added yet. Click "Add New Address" to get started.
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="rounded-lg sm:rounded-2xl">
              <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                <CardTitle className="text-base sm:text-lg">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
                <form onSubmit={handleAddressSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="type" className="text-xs sm:text-sm">Address Type *</Label>
                      <Select value={addressForm.type} onValueChange={(value) => setAddressForm(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger id="type" className="mt-1 sm:mt-2 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="shipping">Shipping</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="label" className="text-xs sm:text-sm">Label (Optional)</Label>
                      <Input
                        id="label"
                        name="label"
                        value={addressForm.label}
                        onChange={handleAddressChange}
                        placeholder="e.g., Home, Office"
                        className="mt-1 sm:mt-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="contactPerson" className="text-xs sm:text-sm">Contact Person (Optional)</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        value={addressForm.contactPerson}
                        onChange={handleAddressChange}
                        placeholder="Full name"
                        className="mt-1 sm:mt-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="addressPhone" className="text-xs sm:text-sm">Phone (Optional)</Label>
                      <Input
                        id="addressPhone"
                        name="phone"
                        type="tel"
                        value={addressForm.phone}
                        onChange={handleAddressChange}
                        placeholder="Phone number"
                        className="mt-1 sm:mt-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1" className="text-xs sm:text-sm">Address Line 1 *</Label>
                    <Input
                      id="addressLine1"
                      name="addressLine1"
                      value={addressForm.addressLine1}
                      onChange={handleAddressChange}
                      placeholder="Street address"
                      className="mt-1 sm:mt-2 text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2" className="text-xs sm:text-sm">Address Line 2 (Optional)</Label>
                    <Input
                      id="addressLine2"
                      name="addressLine2"
                      value={addressForm.addressLine2}
                      onChange={handleAddressChange}
                      placeholder="Apartment, suite, etc."
                      className="mt-1 sm:mt-2 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="city" className="text-xs sm:text-sm">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        placeholder="City"
                        className="mt-1 sm:mt-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-xs sm:text-sm">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        placeholder="State"
                        className="mt-1 sm:mt-2 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode" className="text-xs sm:text-sm">Postal Code (Optional)</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={addressForm.postalCode}
                        onChange={handleAddressChange}
                        placeholder="Postal code"
                        className="mt-1 sm:mt-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="rounded w-4 h-4"
                      aria-label="Set as default address"
                    />
                    <Label htmlFor="isDefault" className="mb-0 text-xs sm:text-sm cursor-pointer">Set as default address</Label>
                  </div>

                  <div className="flex gap-2 pt-2 sm:pt-4">
                    <Button type="submit" size="sm" className="flex-1 text-sm">
                      {editingAddressId ? 'Update Address' : 'Add Address'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" className="flex-1 text-sm" onClick={resetAddressForm}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deletingAddressId !== null} onOpenChange={() => setDeletingAddressId(null)}>
        <AlertDialogContent className="w-11/12">
          <AlertDialogTitle className="text-base sm:text-lg">Delete Address</AlertDialogTitle>
          <AlertDialogDescription className="text-xs sm:text-sm">
            Are you sure you want to delete this address? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingAddressId) {
                  handleDeleteAddress(deletingAddressId);
                }
              }}
              className="bg-red-600 text-xs sm:text-sm"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
