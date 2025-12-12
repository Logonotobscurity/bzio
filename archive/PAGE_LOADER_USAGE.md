// Page Loader Usage Guide

// 1. AUTOMATIC LOADER (Already integrated in layout)
// The PageLoadingProvider automatically shows/hides loader on route changes

// 2. MANUAL USAGE in any client component:
'use client';

import { usePageLoading } from '@/components/layout/PageLoadingProvider';

export function MyComponent() {
  const { showLoader, hideLoader, isLoading } = usePageLoading();

  const handleAction = async () => {
    showLoader('Processing your request...');
    
    try {
      // Your async operation here
      await fetch('/api/some-endpoint');
    } catch (error) {
      console.error(error);
    } finally {
      hideLoader();
    }
  };

  return (
    <button onClick={handleAction}>
      {isLoading ? 'Loading...' : 'Click me'}
    </button>
  );
}

// 3. STANDALONE USAGE:
import PageLoader from '@/components/page-loader';

export function MyPage() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <PageLoader isLoading={isLoading} message="Please wait..." />
      {/* Your page content */}
    </>
  );
}

// 4. FEATURES:
// - Automatic 3-second timeout safety
// - Hides on route changes
// - Custom loading messages
// - Logo-centered with animated spinner
// - Responsive animations
// - Smooth bouncing dots indicator

// 5. CUSTOMIZATION:
// - Edit PageLoader component for styling changes
// - Modify animation timing in globals.css
// - Change logo in public/favicon.svg
// - Adjust timeout in PageLoadingProvider useEffect
