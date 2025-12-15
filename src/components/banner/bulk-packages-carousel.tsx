'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuoteStore } from '@/stores/quoteStore';
import { useRouter } from 'next/navigation';
import { type Product } from '@/lib/schema';

interface BulkPackage {
  id: number;
  name: string;
  category: string;
  description: string;
  includedItems: string[];
  moq: string;
  leadTime: string;
  delivery: string;
  badge: string;
  isTopSeller: boolean;
  images: string[];
}

const BulkPackageFlyer = ({ pkg }: { pkg: BulkPackage }) => {
  const router = useRouter();
  const { addProduct, setOpen } = useQuoteStore();

  const handleRequestQuote = () => {
    const product: Product = {
      id: pkg.id,
      sku: `BULK-${pkg.id}`,
      name: pkg.name,
      slug: pkg.name.toLowerCase().replace(/\s+/g, '-'),
      brand: pkg.category,
      brandId: 0,
      company: 'Bzion',
      companyId: 0,
      category: pkg.category,
      categorySlug: pkg.category.toLowerCase().replace(/\s+/g, '-'),
      description: pkg.description,
      detailedDescription: `${pkg.description}\n\nIncluded Items:\n${pkg.includedItems.join('\n')}`,
      price: 0,
      moq: parseInt(pkg.moq) || 1,
      unit: 'Package',
      inStock: true,
      quantity: 1,
      images: pkg.images,
      specifications: {
        brand: pkg.category,
        company: 'Bzion',
        unit: 'Package',
        moq: parseInt(pkg.moq) || 1,
        sku: `BULK-${pkg.id}`,
      },
      isFeatured: pkg.isTopSeller,
      imageUrl: pkg.images[0] || '',
    };
    addProduct(product, 1);
    setOpen(true);
  };

  const handleViewDetails = () => {
    router.push('/products');
  };

  return (
    <article className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[900px] lg:max-w-[1000px] flex-none flex flex-col md:flex-row gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-gradient-to-r from-white to-amber-50 shadow-md border border-amber-100">
      <div className="flex-none w-full md:w-1/3 flex items-center justify-center">
        <div className="relative w-full h-40 sm:h-48 md:h-60 rounded-lg overflow-hidden bg-white/50 flex items-center justify-center">
          <div className="flex items-center justify-center -space-x-4 sm:-space-x-6">
            {pkg.images.slice(0, 3).map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${pkg.name} ${i + 1}`}
                loading="lazy"
                className="max-h-32 sm:max-h-44 object-contain drop-shadow-md"
                style={{ transform: `translateX(${i * 4}px)`, zIndex: 30 - i }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-auto flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 md:gap-4">
            <div>
              <span className="text-amber-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{pkg.badge}</span>
              <h3 className="font-extrabold text-slate-900 mt-1 md:mt-2" style={{ fontSize: 'clamp(1.125rem, 4vw, 1.875rem)' }}>{pkg.name}</h3>
            </div>
            {pkg.isTopSeller && (
              <div className="text-xs sm:text-sm text-white bg-sky-900 px-2 sm:px-3 py-1 sm:py-2 rounded-full font-semibold flex items-center gap-1 sm:gap-2 shadow flex-shrink-0">
                <span>⭐</span>
                <span className="hidden sm:inline">Top</span>
              </div>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-700 mt-2 md:mt-3 line-clamp-2">{pkg.description}</p>

          <ul className="mt-3 md:mt-4 text-xs sm:text-sm text-sky-900 font-semibold space-y-0.5 sm:space-y-1">
            {pkg.includedItems.slice(0, 3).map((it, i) => (
              <li key={i} className="line-clamp-1">✓ {it}</li>
            ))}
            {pkg.includedItems.length > 3 && (
              <li className="text-[10px] sm:text-xs text-slate-500">+{pkg.includedItems.length - 3} more</li>
            )}
          </ul>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 sm:px-4 py-2 text-xs text-slate-700 flex gap-3 sm:gap-6 justify-around">
            <div className="text-center">
              <div className="text-[9px] sm:text-[10px] text-gray-500">MOQ</div>
              <div className="font-bold text-[10px] sm:text-xs">{pkg.moq}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] sm:text-[10px] text-gray-500">Lead</div>
              <div className="font-bold text-[10px] sm:text-xs">{pkg.leadTime}</div>
            </div>
            <div className="text-center">
              <div className="text-[9px] sm:text-[10px] text-gray-500">Ship</div>
              <div className="font-bold text-[10px] sm:text-xs">{pkg.delivery}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={handleRequestQuote} 
              className="flex-1 sm:flex-none px-3 sm:px-5 py-2 rounded-full bg-slate-900 text-white font-bold hover:bg-sky-800 hover:scale-105 active:scale-95 transition-all duration-200 text-xs sm:text-sm shadow-md"
            >
              Request Quote
            </button>
            <button 
              onClick={handleViewDetails} 
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-full border border-slate-200 text-slate-800 hover:bg-gray-50 hover:border-slate-800 hover:scale-105 active:scale-95 transition-all duration-200 text-xs sm:text-sm"
            >
              Details →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

interface Props {
  packages: BulkPackage[];
}

export const BulkPackagesCarousel = ({ packages }: Props) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goToSlide = (index: number) => {
    const el = trackRef.current;
    if (!el) return;
    const slideWidth = el.offsetWidth;
    el.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
    setCurrentIndex(index);
  };

  const goNext = () => {
    const nextIndex = currentIndex === packages.length - 1 ? 0 : currentIndex + 1;
    goToSlide(nextIndex);
  };

  const goPrev = () => {
    const prevIndex = currentIndex === 0 ? packages.length - 1 : currentIndex - 1;
    goToSlide(prevIndex);
  };

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goNext, 5000);
    return () => clearInterval(interval);
  }, [currentIndex, isPaused]);

  return (
    <section className="relative py-12 bg-gradient-to-b from-yellow-50 via-yellow-100 to-white">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-amber-600 font-bold uppercase text-[10px] sm:text-xs tracking-widest">WHOLESALE PACKAGES</p>
            <h2 className="font-extrabold text-slate-900 mt-2" style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)' }}>Curated Bulk Packages</h2>
            <p className="text-gray-600 mt-1 md:mt-2 text-xs sm:text-sm md:text-base">Pre-configured packages for restaurants, retailers & wholesalers</p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={goPrev}
              className="p-3 rounded-full bg-white border hover:shadow-lg focus:outline-none focus:ring-2 transition"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="p-3 rounded-full bg-white border hover:shadow-lg focus:outline-none focus:ring-2 transition"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="overflow-x-hidden scroll-smooth"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex transition-transform duration-500">
            {packages.map((pkg) => (
              <div key={pkg.id} className="flex-shrink-0 w-full flex justify-center px-4">
                <BulkPackageFlyer pkg={pkg} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {packages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentIndex ? 'bg-amber-600 w-8' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="sr-only" aria-live="polite">
          Showing package {currentIndex + 1} of {packages.length}: {packages[currentIndex]?.name}
        </div>
      </div>
    </section>
  );
};
