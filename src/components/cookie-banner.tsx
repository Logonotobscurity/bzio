"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldReset = params.has('reset-cookie-consent');
    if (shouldReset) {
      localStorage.removeItem('bzion-cookie-consent');
    }

    const consent = localStorage.getItem('bzion-cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('bzion-cookie-consent', 'accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('bzion-cookie-consent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-[2000] p-5 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Cookie className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900 mb-1">Cookie Consent</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We use cookies to enhance your browsing experience and analyze site traffic. By clicking "Accept," you consent to our use of cookies.
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <Button 
          onClick={handleAccept} 
          className="flex-1 rounded-xl h-10 font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Accept
        </Button>
        <Button 
          onClick={handleReject} 
          variant="outline"
          className="flex-1 rounded-xl h-10 font-bold border-2 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Reject
        </Button>
      </div>
    </div>
  );
}
