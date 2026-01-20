'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { User, Settings, ShoppingCart, FileText, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogoutButton } from '@/components/auth/logout-button';
import { USER_ROLES } from '@/lib/auth-constants';

export function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-slate-600">Loading...</span>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Get Started</Link>
        </Button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = session.user as any;
  const isAdmin = user.role === USER_ROLES.ADMIN;
  const initials = user.name 
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="flex items-center gap-3">
      {/* Quick Actions */}
      <div className="hidden md:flex items-center gap-2">
        {!isAdmin && (
          <Button asChild variant="ghost" size="sm">
            <Link href="/checkout" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden lg:inline">Cart</span>
            </Link>
          </Button>
        )}
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user.name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
              {user.company && (
                <p className="text-xs leading-none text-muted-foreground">
                  {user.company}
                </p>
              )}
              <div className="flex items-center gap-1 mt-1">
                {isAdmin && <Shield className="h-3 w-3 text-amber-600" />}
                <span className="text-xs font-medium text-slate-600 capitalize">
                  {user.role?.toLowerCase() || 'User'}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {/* Navigation Items */}
          {isAdmin ? (
            <>
              <DropdownMenuItem asChild>
                <Link href="/admin" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/quotes" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  Manage Quotes
                </Link>
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem asChild>
                <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" />
                  My Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/checkout" className="flex items-center gap-2 cursor-pointer">
                  <ShoppingCart className="h-4 w-4" />
                  My Cart
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/account/quotes" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4" />
                  My Quotes
                </Link>
              </DropdownMenuItem>
            </>
          )}
          
          <DropdownMenuItem asChild>
            <Link href="/account/settings" className="flex items-center gap-2 cursor-pointer">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem asChild>
            <LogoutButton 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start p-0 h-auto font-normal"
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}