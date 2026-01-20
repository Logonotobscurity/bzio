'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow, format } from 'date-fns';
import { Search, UserCheck, UserX, MoreHorizontal, Shield, ShieldOff, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { updateUserRole, toggleUserStatus, verifyUserEmail, approveUser, rejectUser, deleteUser } from '../_actions/users';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  emailVerified: boolean;
  isActive?: boolean;
  company: string | null;
  quotesCount: number;
  ordersCount: number;
  createdAt: Date | string;
  lastLogin: Date | string | null;
}

interface UsersClientProps {
  users: User[];
}

export default function UsersClient({ users }: UsersClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<{ type: string; userId: number; userName: string } | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.company?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesVerified = verifiedFilter === 'all' || 
      (verifiedFilter === 'verified' && user.emailVerified) ||
      (verifiedFilter === 'unverified' && !user.emailVerified);
    
    return matchesSearch && matchesRole && matchesVerified;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    customers: users.filter(u => u.role === 'CUSTOMER').length,
    verified: users.filter(u => u.emailVerified).length,
  };

  const handleAction = (type: string, userId: number, userName: string) => {
    setConfirmAction({ type, userId, userName });
  };

  const executeAction = () => {
    if (!confirmAction) return;
    const { type, userId } = confirmAction;
    
    startTransition(async () => {
      let result;
      switch (type) {
        case 'approve':
          result = await approveUser(userId);
          break;
        case 'reject':
          result = await rejectUser(userId);
          break;
        case 'verify':
          result = await verifyUserEmail(userId);
          break;
        case 'toggle':
          result = await toggleUserStatus(userId);
          break;
        case 'makeAdmin':
          result = await updateUserRole(userId, 'ADMIN');
          break;
        case 'makeCustomer':
          result = await updateUserRole(userId, 'CUSTOMER');
          break;
        case 'delete':
          result = await deleteUser(userId);
          break;
        default:
          result = { success: false, error: 'Unknown action' };
      }
      
      if (result.success) {
        toast.success(`User ${type} successful`);
      } else {
        toast.error(result.error || `Failed to ${type} user`);
      }
      setConfirmAction(null);
    });
  };

  const getActionTitle = (type: string) => {
    const titles: Record<string, string> = {
      approve: 'Approve User',
      reject: 'Reject User',
      verify: 'Verify Email',
      toggle: 'Toggle Status',
      makeAdmin: 'Make Admin',
      makeCustomer: 'Make Customer',
      delete: 'Deactivate User',
    };
    return titles[type] || 'Confirm Action';
  };

  const getActionDescription = (type: string, userName: string) => {
    const descriptions: Record<string, string> = {
      approve: `This will activate ${userName} and verify their email.`,
      reject: `This will deactivate ${userName}'s account.`,
      verify: `This will manually verify ${userName}'s email address.`,
      toggle: `This will toggle ${userName}'s active status.`,
      makeAdmin: `This will give ${userName} admin privileges.`,
      makeCustomer: `This will remove admin privileges from ${userName}.`,
      delete: `This will deactivate ${userName}'s account.`,
    };
    return descriptions[type] || 'Are you sure you want to proceed?';
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all registered users</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Users</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.admins}</p><p className="text-xs text-muted-foreground">Admins</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.customers}</p><p className="text-xs text-muted-foreground">Customers</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-2xl font-bold">{stats.verified}</p><p className="text-xs text-muted-foreground">Verified</p></CardContent></Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by email, name, or company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="CUSTOMER">Customer</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Quotes</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{user.company || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.emailVerified ? (
                            <Badge className="bg-green-100 text-green-800 w-fit"><UserCheck className="h-3 w-3 mr-1" />Verified</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 w-fit"><UserX className="h-3 w-3 mr-1" />Pending</Badge>
                          )}
                          {user.isActive === false && (
                            <Badge className="bg-red-100 text-red-800 w-fit">Inactive</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{user.quotesCount}</TableCell>
                      <TableCell className="text-sm">{format(new Date(user.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="text-sm">{user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true }) : 'Never'}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!user.emailVerified && (
                              <>
                                <DropdownMenuItem onClick={() => handleAction('approve', parseInt(user.id), user.email)}>
                                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleAction('verify', parseInt(user.id), user.email)}>
                                  <UserCheck className="h-4 w-4 mr-2" />Verify Email
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => handleAction('toggle', parseInt(user.id), user.email)}>
                              {user.isActive !== false ? <XCircle className="h-4 w-4 mr-2 text-red-600" /> : <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
                              {user.isActive !== false ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.role === 'CUSTOMER' ? (
                              <DropdownMenuItem onClick={() => handleAction('makeAdmin', parseInt(user.id), user.email)}>
                                <Shield className="h-4 w-4 mr-2" />Make Admin
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAction('makeCustomer', parseInt(user.id), user.email)}>
                                <ShieldOff className="h-4 w-4 mr-2" />Remove Admin
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAction('reject', parseInt(user.id), user.email)} className="text-red-600">
                              <XCircle className="h-4 w-4 mr-2" />Reject/Deactivate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => { if (!open) setConfirmAction(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction && getActionTitle(confirmAction.type)}</AlertDialogTitle>
            <AlertDialogDescription>{confirmAction && getActionDescription(confirmAction.type, confirmAction.userName)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
