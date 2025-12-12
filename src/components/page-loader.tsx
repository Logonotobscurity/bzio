'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  isLoading?: boolean;
  fullScreen?: boolean;
  message?: string;
}

export const PageLoader = ({
  isLoading = true,
  fullScreen = true,
  message = 'Loading...'
}: PageLoaderProps) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-white z-50',
        fullScreen
          ? 'fixed inset-0'
          : 'relative w-full h-96'
      )}
    >
      <style>{`
        @keyframes stroke-dash {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
          }
          100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
          }
        }
        .stroke-dash-animation {
          animation: stroke-dash 1.5s ease-in-out infinite;
        }
      `}</style>
      {/* Animated SVG Spinner with Logo */}
      <div className="relative flex items-center justify-center">
        {/* Animated spinner circle */}
        <svg
          className="absolute animate-spin-loader"
          viewBox="25 25 50 50"
          width="120"
          height="120"
        >
          <circle
            r="20"
            cy="50"
            cx="50"
            className="stroke-primary stroke-dash-animation"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* BZION Logo in center */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <Image
            src="https://i.ibb.co/tp7n1sG7/faicon.png"
            alt="BZION"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
      </div>

      {/* Loading message */}
      {message && (
        <div className="mt-8 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">{message}</p>
          <div className="flex justify-center gap-1">
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-0" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-200" />
            <span className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-400" />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes rotate4 {
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes dash4 {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }

          50% {
            stroke-dasharray: 90, 200;
            stroke-dashoffset: -35px;
          }

          100% {
            stroke-dashoffset: -125px;
          }
        }

        .animate-spin-loader {
          width: 3.25em;
          transform-origin: center;
          animation: rotate4 2s linear infinite;
        }

        .animation-delay-0 {
          animation-delay: 0s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default PageLoader;
