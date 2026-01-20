'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from 'date-fns';
import { Eye, MessageSquare, Search, Filter, CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import { updateQuoteStatus, approveQuote, rejectQuote, deleteQuote } from '../_actions/quotes';
import { toast } from 'sonner';

interface QuoteLine {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; sku: string } | null;
}

interface Quote {
  id: string;
  reference: string;
  status: string;
  totalAmount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: {
    firstName: string | null;
    lastName: string | null;
    email: string;
    company: { name: string } | null;
  } | null;
  quote_lines: QuoteLine[];
}

interface QuotesClientProps {
  quotes: Quote[];
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  NEGOTIATING: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-orange-100 text-orange-800',
};

export default function QuotesClient({ quotes }: QuotesClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isPending, startTransition] = useTransition();
  
  // Modal states
  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [rejectQuoteId, setRejectQuoteId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteQuoteId, setDeleteQuoteId] = useState<number | null>(null);
  const [messageQuoteId, setMessageQuoteId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${quote.user?.firstName} ${quote.user?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = quotes.reduce((acc, quote) => {
    acc[quote.status] = (acc[quote.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleApprove = (quoteId: string) => {
    startTransition(async () => {
      const result = await approveQuote(quoteId);
      if (result.success) {
        toast.success('Quote approved');
      } else {
        toast.error(result.error || 'Failed to approve quote');
      }
    });
  };

  const handleReject = () => {
    if (!rejectQuoteId) return;
    startTransition(async () => {
      const result = await rejectQuote(String(rejectQuoteId), rejectReason);
      if (result.success) {
        toast.success('Quote rejected');
        setRejectQuoteId(null);
        setRejectReason('');
      } else {
        toast.error(result.error || 'Failed to reject quote');
      }
    });
  };

  const handleDelete = () => {
    if (!deleteQuoteId) return;
    startTransition(async () => {
      const result = await deleteQuote(String(deleteQuoteId));
      if (result.success) {
        toast.success('Quote deleted');
        setDeleteQuoteId(null);
      } else {
        toast.error(result.error || 'Failed to delete quote');
      }
    });
  };

  const handleStatusChange = (quoteId: string, status: string) => {
    startTransition(async () => {
      const result = await updateQuoteStatus(quoteId, status);
      if (result.success) {
        toast.success(`Quote status updated to ${status}`);
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    });
  };

  const handleSendMessage = () => {
    if (!messageQuoteId || !newMessage.trim()) return;
    // TODO: Implement addQuoteMessage function in quotes actions
    toast.info('Message functionality coming soon');
    setMessageQuoteId(null);
    setNewMessage('');
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quote Management</h1>
        <p className="text-muted-foreground">View and manage all customer quote requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="cursor-pointer hover:bg-gray-50" onClick={() => setStatusFilter(status)}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by reference, email, or name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                <SelectItem value="ACCEPTED">Accepted</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.length > 0 ? (
                  filteredQuotes.map((quote) => (
                    <TableRow key={quote.id}>
                      <TableCell className="font-mono text-sm">{quote.reference}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{quote.user?.firstName} {quote.user?.lastName}</p>
                          <p className="text-xs text-muted-foreground">{quote.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{quote.user?.company?.name || '-'}</TableCell>
                      <TableCell className="text-center">{quote.lines.length}</TableCell>
                      <TableCell className="text-right font-semibold">₦{quote.totalAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Select value={quote.status} onValueChange={(status) => handleStatusChange(parseInt(quote.id), status)} disabled={isPending}>
                          <SelectTrigger className="w-32 h-8">
                            <Badge className={statusColors[quote.status] || 'bg-gray-100'}>{quote.status}</Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                            <SelectItem value="ACCEPTED">Accepted</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="EXPIRED">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm">{formatDistanceToNow(new Date(quote.createdAt), { addSuffix: true })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" title="View Details" onClick={() => setViewQuote(quote)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {quote.status === 'PENDING' && (
                            <>
                              <Button variant="ghost" size="sm" title="Approve" onClick={() => handleApprove(parseInt(quote.id))} disabled={isPending}>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Reject" onClick={() => setRejectQuoteId(parseInt(quote.id))}>
                                <XCircle className="h-4 w-4 text-red-600" />
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="sm" title="Send Message" onClick={() => setMessageQuoteId(parseInt(quote.id))}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Delete" onClick={() => setDeleteQuoteId(parseInt(quote.id))}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No quotes found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>


      {/* View Quote Modal */}
      <Dialog open={!!viewQuote} onOpenChange={(open) => { if (!open) setViewQuote(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quote Details - {viewQuote?.reference}</DialogTitle>
            <DialogDescription>Customer: {viewQuote?.user?.firstName} {viewQuote?.user?.lastName} ({viewQuote?.user?.email})</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge className={statusColors[viewQuote?.status || ''] || 'bg-gray-100'}>{viewQuote?.status}</Badge>
              <span className="font-semibold">₦{viewQuote?.totalAmount.toLocaleString()}</span>
            </div>
            <div className="border rounded-lg divide-y">
              {viewQuote?.lines.map((line) => (
                <div key={line.id} className="p-3 flex justify-between">
                  <div>
                    <p className="font-medium">{line.product?.name || 'Unknown Product'}</p>
                    <p className="text-xs text-muted-foreground">{line.product?.sku}</p>
                  </div>
                  <div className="text-right">
                    <p>{line.quantity} x ₦{line.unitPrice.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewQuote(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Quote Modal */}
      <Dialog open={!!rejectQuoteId} onOpenChange={(open) => { if (!open) { setRejectQuoteId(null); setRejectReason(''); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reject Quote</DialogTitle>
            <DialogDescription>Provide a reason for rejecting this quote (optional)</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Rejection Reason</Label>
              <Textarea placeholder="e.g., Price too high, Out of stock..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectQuoteId(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Reject Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Message Modal */}
      <Dialog open={!!messageQuoteId} onOpenChange={(open) => { if (!open) { setMessageQuoteId(null); setNewMessage(''); } }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription>Send a message to the customer about this quote</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Message</Label>
              <Textarea placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMessageQuoteId(null)}>Cancel</Button>
            <Button onClick={handleSendMessage} disabled={isPending || !newMessage.trim()}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteQuoteId} onOpenChange={(open) => { if (!open) setDeleteQuoteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The quote and all related messages will be permanently deleted.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-red-600 hover:bg-red-700">
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
