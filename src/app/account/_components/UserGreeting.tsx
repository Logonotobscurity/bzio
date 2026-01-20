'use client';

import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow, format } from 'date-fns';
import type { UserAccountDetails } from '../_types/dashboard';

interface UserGreetingProps {
  user: UserAccountDetails;
}

export function UserGreeting({ user }: UserGreetingProps) {
  const lastLoginText = user.lastLoginAt
    ? `${formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })} / ${format(new Date(user.lastLoginAt), 'MMM d, yyyy')}`
    : 'First visit';

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {user.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              className={
                user.status === 'active'
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
              }
            >
              {user.status === 'active' ? '🟢 Active Now' : '⚪ Inactive'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last login: {lastLoginText}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.emailVerified && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              ✓ Verified
            </Badge>
          )}
          <Badge variant="outline" className="capitalize">
            {user.role.toLowerCase()}
          </Badge>
        </div>
      </div>
    </div>
  );
}

export default UserGreeting;
