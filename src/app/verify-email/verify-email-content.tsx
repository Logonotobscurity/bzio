'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const token = searchParams.get('token');

  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Auto-verify token on component mount
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setError('No verification token provided');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setUserEmail(data.email || '');
          setIsVerified(true);
          toast({
            title: 'Success',
            description: 'Your email has been verified successfully!',
          });
        } else {
          const errorMessage = data.error || 'Failed to verify email';
          setError(errorMessage);
          setCanResend(true);
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        setCanResend(true);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [token, toast]);

  // Resend verification email
  const handleResend = async () => {
    setResendLoading(true);
    setCanResend(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Verification email sent! Check your inbox.',
        });
        setResendCountdown(60);
        const interval = setInterval(() => {
          setResendCountdown(prev => {
            if (prev <= 1) {
              clearInterval(interval);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to resend verification email',
          variant: 'destructive',
        });
        setCanResend(true);
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email',
        variant: 'destructive',
      });
      setCanResend(true);
    } finally {
      setResendLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="w-full max-w-md">
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex flex-col items-center gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
                <div>
                  <h2 className="text-2xl font-bold">Verifying Email</h2>
                  <p className="text-sm text-muted-foreground">Please wait while we verify your email...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8">
        <div className="w-full max-w-md">
          <div className="w-full max-w-md">
            <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex flex-col items-center gap-4 text-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold">Email Verified</h2>
                  <p className="text-sm text-muted-foreground">
                    Your email has been verified successfully. You can now log in.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex flex-col items-center gap-4 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h2 className="text-2xl font-bold">Verification Failed</h2>
                <p className="text-sm text-muted-foreground mt-2">{error}</p>
              </div>

              {canResend && userEmail && (
                <Button
                  onClick={handleResend}
                  disabled={resendLoading || resendCountdown > 0}
                  variant="outline"
                  className="w-full"
                >
                  {resendLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : resendCountdown > 0 ? (
                    `Resend Email (${resendCountdown}s)`
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              )}

              <Button
                onClick={() => router.push('/login')}
                variant="ghost"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
