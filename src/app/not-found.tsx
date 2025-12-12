
import { Section } from '@/components/ui/section';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex-grow bg-slate-50">
        <Section className="py-20 text-center">
            <h1 className="text-4xl font-bold text-primary">404 - Page Not Found</h1>
            <p className="mt-4 text-lg text-slate-600">
                Sorry, the page you are looking for does not exist.
            </p>
            <div className="mt-8">
                <Link href="/" className="inline-block rounded-md bg-primary px-6 py-3 text-lg font-semibold text-white hover:bg-primary/90">
                    Go back home
                </Link>
            </div>
        </Section>
    </main>
  );
}
