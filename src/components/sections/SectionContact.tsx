
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SectionContactProps {
  title: string;
  description: string;
  buttonText: string;
}

export function SectionContact({ title, description, buttonText }: SectionContactProps) {
  return (
    <section className="py-section-md px-container-px bg-primary text-primary-foreground">
      <div className="container-constrained text-center flex flex-col gap-6 items-center">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl">
          {description}
        </p>
        <Button asChild size="lg" variant="secondary">
          <Link href="/contact">
            {buttonText}
          </Link>
        </Button>
      </div>
    </section>
  );
}
