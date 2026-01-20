'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Mail, Building2, UserCircle, Calendar, CheckCircle } from 'lucide-react';
import type { UserAccountDetails as UserAccountDetailsType } from '../_types/dashboard';

interface UserAccountDetailsProps {
  user: UserAccountDetailsType;
}

export function UserAccountDetails({ user }: UserAccountDetailsProps) {
  const details = [
    {
      icon: Mail,
      label: 'Email',
      value: user.email,
    },
    {
      icon: Building2,
      label: 'Company',
      value: user.company || 'Not specified',
    },
    {
      icon: UserCircle,
      label: 'Role',
      value: user.role.toLowerCase(),
      capitalize: true,
    },
    {
      icon: Calendar,
      label: 'Member Since',
      value: format(new Date(user.createdAt), 'MMM yyyy'),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Account Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {details.map((detail) => {
          const Icon = detail.icon;
          return (
            <div key={detail.label} className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Icon className="h-4 w-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">{detail.label}</p>
                <p className={`text-sm font-medium truncate ${detail.capitalize ? 'capitalize' : ''}`}>
                  {detail.value}
                </p>
              </div>
            </div>
          );
        })}

        {/* Email verification status */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2">
            {user.emailVerified ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Email verified</span>
              </>
            ) : (
              <>
                <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                  Pending verification
                </Badge>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default UserAccountDetails;
