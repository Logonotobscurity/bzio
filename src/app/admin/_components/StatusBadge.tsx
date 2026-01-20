'use client';

import { Badge } from '@/components/ui/badge';

type StatusType = 
  | 'draft' | 'pending' | 'negotiating' | 'accepted' | 'rejected' | 'completed' | 'expired'
  | 'active' | 'inactive' | 'verified' | 'unverified'
  | 'new' | 'read' | 'responded'
  | 'in-stock' | 'low-stock' | 'out-of-stock'
  | string;

interface StatusBadgeProps {
  status: StatusType;
  variant?: 'default' | 'outline';
  size?: 'sm' | 'default';
}

const statusConfig: Record<string, { bg: string; text: string; label?: string }> = {
  // Quote statuses
  draft: { bg: 'bg-gray-100', text: 'text-gray-800' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  negotiating: { bg: 'bg-blue-100', text: 'text-blue-800' },
  accepted: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800' },
  completed: { bg: 'bg-green-100', text: 'text-green-800' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-800' },
  
  // User statuses
  active: { bg: 'bg-green-100', text: 'text-green-800' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800' },
  verified: { bg: 'bg-green-100', text: 'text-green-800'},
  unverified: { bg: 'bg-yellow-100', text: 'text-yellow-800'},
  pending_verification: { bg: 'bg-yellow-100', text: 'text-yellow-800'},
  
  // Form statuses
  new: { bg: 'bg-blue-100', text: 'text-blue-800' },
  isRead: { bg: 'bg-gray-100', text: 'text-gray-800' },
  responded: { bg: 'bg-green-100', text: 'text-green-800' },
  
  // Stock statuses
  'in-stock': { bg: 'bg-green-100', text: 'text-green-800'},
  'low-stock': { bg: 'bg-yellow-100', text: 'text-yellow-800'},
  'out-of-stock': { bg: 'bg-red-100', text: 'text-red-800'},
  
  // Notification types
  info: { bg: 'bg-blue-100', text: 'text-blue-800' },
  success: { bg: 'bg-green-100', text: 'text-green-800' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  error: { bg: 'bg-red-100', text: 'text-red-800' },
  new_user: { bg: 'bg-purple-100', text: 'text-purple-800'},
  new_quote: { bg: 'bg-indigo-100', text: 'text-indigo-800'},
  low_stock: { bg: 'bg-orange-100', text: 'text-orange-800'},
  system_alert: { bg: 'bg-red-100', text: 'text-red-800'},
};

export function StatusBadge({ status, variant = 'default', size = 'default' }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase().replace(/ /g, '_');
  const config = statusConfig[normalizedStatus] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  
  const label = config.label || status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  
  const sizeClass = size === 'sm' ? 'text-xs px-1.5 py-0.5' : '';

  if (variant === 'outline') {
    return (
      <Badge variant="outline" className={sizeClass}>
        {label}
      </Badge>
    );
  }

  return (
    <Badge className={`${config.bg} ${config.text} ${sizeClass} hover:${config.bg}`}>
      {label}
    </Badge>
  );
}

export default StatusBadge;
