'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Loader2 } from 'lucide-react';

interface QuoteAction {
  id: string;
  reference: string;
  status: string;
}

interface QuoteActionsModalProps {
  quote: QuoteAction | null;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export function QuoteActionsModal({
  quote,
  onClose,
  onApprove,
  onReject,
}: QuoteActionsModalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!quote) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      await onApprove(quote.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) return;
    setIsLoading(true);
    try {
      await onReject(quote.id, reason);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={!!quote} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Quote {quote.reference}</DialogTitle>
          <DialogDescription>
            Current Status: <strong>{quote.status}</strong>
          </DialogDescription>
        </DialogHeader>

        {action === null && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              What would you like to do with this quote?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setAction('approve')}
                variant="default"
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={() => setAction('reject')}
                variant="destructive"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        )}

        {action === 'approve' && (
          <div className="space-y-4">
            <p className="text-sm">
              Are you sure you want to approve quote <strong>{quote.reference}</strong>?
            </p>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAction(null)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Approval
              </Button>
            </DialogFooter>
          </div>
        )}

        {action === 'reject' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Reason for Rejection</label>
              <Textarea
                placeholder="Explain why you're rejecting this quote..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAction(null)}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading || !reason.trim()}
                className="gap-2"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Reject Quote
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
