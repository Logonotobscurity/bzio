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
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Archive, Trash2, Loader2 } from 'lucide-react';

interface FormSubmission {
  id: string;
  formType: string;
  status: string;
  data: Record<string, unknown>;
  submittedAt: string;
}

interface FormActionsModalProps {
  submission: FormSubmission | null;
  onClose: () => void;
  onRespond: (id: string) => Promise<void>;
  onMarkSpam: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function FormActionsModal({
  submission,
  onClose,
  onRespond,
  onMarkSpam,
  onArchive,
  onDelete,
}: FormActionsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  if (!submission) return null;

  const handleAction = async (action: 'respond' | 'spam' | 'archive' | 'delete') => {
    setIsLoading(true);
    setPendingAction(action);
    try {
      switch (action) {
        case 'respond':
          await onRespond(submission.id);
          break;
        case 'spam':
          await onMarkSpam(submission.id);
          break;
        case 'archive':
          await onArchive(submission.id);
          break;
        case 'delete':
          await onDelete(submission.id);
          break;
      }
      onClose();
    } finally {
      setIsLoading(false);
      setPendingAction(null);
    }
  };

  return (
    <Dialog open={!!submission} onOpenChange={() => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{submission.formType} Form Submission</DialogTitle>
          <DialogDescription>
            Status: <Badge>{submission.status}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-[300px] overflow-y-auto">
            {Object.entries(submission.data || {}).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="font-semibold text-gray-700">{key}:</span>
                <span className="text-gray-600 ml-2">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAction('respond')}
                disabled={isLoading}
                variant="default"
                className="gap-2"
              >
                {pendingAction === 'respond' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <CheckCircle className="h-4 w-4" />
                Mark Responded
              </Button>
              <Button
                onClick={() => handleAction('spam')}
                disabled={isLoading}
                variant="destructive"
                className="gap-2"
              >
                {pendingAction === 'spam' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <AlertTriangle className="h-4 w-4" />
                Mark Spam
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleAction('archive')}
                disabled={isLoading}
                variant="outline"
                className="gap-2"
              >
                {pendingAction === 'archive' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Archive className="h-4 w-4" />
                Archive
              </Button>
              <Button
                onClick={() => handleAction('delete')}
                disabled={isLoading}
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700"
              >
                {pendingAction === 'delete' && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
