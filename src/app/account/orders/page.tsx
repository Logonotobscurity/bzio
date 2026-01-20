import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login?callbackUrl=/account/orders');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your orders</p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ShoppingCart className="h-6 w-6 text-gray-400" />
          </div>
          <CardTitle className="text-lg mb-2">No orders yet</CardTitle>
          <CardDescription>
            Your order history will appear here once you make a purchase
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
