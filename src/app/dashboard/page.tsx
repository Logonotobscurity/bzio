
'use client';

import OrderDashboard from '@/components/order-dashboard';

export default function DashboardPage() {

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order Dashboard</h1>
      <OrderDashboard />
    </div>
  );
}
