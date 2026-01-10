
'use client';

import OrderDashboard from '@/components/order-dashboard';
import { Section } from '@/components/ui/section';

export default function DashboardPage() {
  return (
    <Section className="py-6 sm:py-8 md:py-10 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-2">Order Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">View and manage all your orders and quote requests</p>
        </div>
        <OrderDashboard />
      </div>
    </Section>
  );
}
