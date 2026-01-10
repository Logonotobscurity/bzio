'use client';

import AdminCustomerDataComponent from '@/components/admin-customer-data-component';
import { Section } from '@/components/ui/section';

export default function CustomersPage() {
  return (
    <Section className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
        <p className="text-muted-foreground">
          View and manage all customer data including addresses, quotes, and cart items.
        </p>
      </div>
      <AdminCustomerDataComponent />
    </Section>
  );
}
