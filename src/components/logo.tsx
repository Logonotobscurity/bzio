import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("relative block aspect-[350/174]", className)} aria-label="BZION Home">
      <h2 className="sr-only">BZION Hub</h2>
      <Image 
        src="https://i.ibb.co/1tfpsbFT/logo-2.png" 
        alt="Bzion Hub Logo"
        fill
        sizes="(max-width: 768px) 120px, 162px"
        className="object-contain"
        priority
      />
    </Link>
  );
}
