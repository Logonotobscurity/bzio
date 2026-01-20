'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow, format } from 'date-fns';
import { FileText, Eye } from 'lucide-react';
import Link from 'next/link';
import { RequestQuoteButton } from '../_components/RequestQuoteButton';

interface Quote {
  id: string;
  reference: string;
  status: string;
  totalAmount: number;
  itemCount: number;
  createdAt: Date;
}

interface QuotesClientProps {
  quotes: Quote[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
};

export default function QuotesClient({ quotes }: QuotesClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Quotes</h1>
          <p className="text-muted-foreground">View and manage your quote requests</p>
        </div>
        <RequestQuoteButton label="New Quote" emptyCartLabel="Request Quote" />
      </div>

      {quotes.length > 0 ? (
        <div className="grid gap-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{quote.reference}</CardTitle>
                    <CardDescription>
                      {format(new Date(quote.createdAt), 'MMM d, yyyy')} •{' '}
                      {formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}
                    </CardDescription>
                  </div>
                  <Badge className={statusColors[quote.status.toLowerCase()] || 'bg-gray-100'}>
                    {quote.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{quote.itemCount} item{quote.itemCount !== 1 ? 's' : ''}</span>
                    <span>₦{quote.totalAmount.toLocaleString()}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/quotes/${quote.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900">No quotes yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Request a quote to get started
            </p>
            <RequestQuoteButton />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
