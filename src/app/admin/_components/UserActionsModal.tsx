'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { format, formatDistanceToNow } from 'date-fns';
import { Shield, User, Mail, Building2, Calendar, Loader2, UserCheck, UserX } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  emailVerified: boolean;
  company: string | null;
  quotesCount: number;
  ordersCount: number;
  createdAt: Date | string;
  lastLogin: Date | string | null;
}

interface UserActionsModalProps {
  user: UserData | null;
  open: boolean;
  onClose: () => void;
  onRoleUpdate: (userId: string, role: 'ADMIN' | 'CUSTOMER') => Promise<void>;
  onStatusToggle: (userId: string) => Promise<void>;
}

export function UserActionsModal({ user, open, onClose, onRoleUpdate, onStatusToggle }: UserActionsModalProps) {
  const [newRole, setNewRole] = useState(user?.role || '');
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<'role' | 'status' | null>(null);

  if (!user) return null;

  const handleRoleUpdate = async () => {
    if (!newRole || newRole === user.role) return;
    
    setIsLoading(true);
    setAction('role');
    try {
      await onRoleUpdate(user.id, newRole as 'ADMIN' | 'CUSTOMER');
      onClose();
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  const handleStatusToggle = async () => {
    setIsLoading(true);
    setAction('status');
    try {
      await onStatusToggle(user.id);
      onClose();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    } finally {
      setIsLoading(false);
      setAction(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View and manage user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {(user.firstName?.[0] || user.email[0]).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {user.role === 'ADMIN' ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                  {user.role}
                </Badge>
                {user.emailVerified ? (
                  <Badge className="bg-green-100 text-green-800">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <UserX className="h-3 w-3 mr-1" />
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Company</p>
                <p className="text-sm font-medium">{user.company || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="text-sm font-medium">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quotes</p>
              <p className="text-lg font-bold">{user.quotesCount}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Orders</p>
              <p className="text-lg font-bold">{user.ordersCount}</p>
            </div>
          </div>

          {/* Last Login */}
          <div className="text-sm text-muted-foreground">
            Last login: {user.lastLogin 
              ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })
              : 'Never'}
          </div>

          {/* Actions */}
          <div className="space-y-4 border-t pt-4">
            <div className="space-y-2">
              <Label>Change Role</Label>
              <div className="flex gap-2">
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleRoleUpdate}
                  disabled={isLoading || !newRole || newRole === user.role}
                >
                  {isLoading && action === 'role' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Update
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button 
            variant="outline"
            onClick={handleStatusToggle}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading && action === 'status' && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UserActionsModal;
