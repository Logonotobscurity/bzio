'use client';

import { useEffect } from 'react';
import { Section } from '@/components/ui/section';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { BulkPackagesCarousel } from '@/components/banner/bulk-packages-carousel';

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

// Dummy data for bulk packages
const bulkPackages: BulkPackage[] = [
  {
    id: 1,
    name: 'Restaurant Starter Pack',
    category: 'BULK PACKAGES',
    description: 'Perfect for small restaurants and food service businesses. Includes assorted oils, flour, and specialty items.',
    includedItems: ['5L Vegetable Oil', '25kg All-Purpose Flour', '1L Soya Oil', '+ 3 more items...'],
    moq: '50 Units',
    leadTime: '7-10 Days',
    delivery: 'Nationwide',
    badge: 'BULK DEAL',
    isTopSeller: true,
    images: [
      'https://i.ibb.co/2TmQrfM/activa-5ltrs.png',
      'https://i.ibb.co/4wtcjvk6/Golden-penny-prime-flour-50kg.jpg',
      'https://i.ibb.co/8LMKBtJ4/Terra-oil-1-4-L.png',
    ],
  },
  {
    id: 2,
    name: 'Bakers Essential Kit',
    category: 'BULK PACKAGES',
    description: 'Everything a small to medium-sized bakery needs for consistent quality. Features premium flour and sugar.',
    includedItems: ['50kg Prime Flour', '10kg Granulated Sugar', '5kg Margarine Spread', '+ 2 more items...'],
    moq: '30 Kits',
    leadTime: '5-7 Days',
    delivery: 'Nationwide',
    badge: 'SAVE 15%',
    isTopSeller: false,
    images: [
        'https://i.ibb.co/PZ9gxtMB/Mama-Gold-Flour-50kg.webp',
        'https://i.ibb.co/VY07nMWV/Dangote-1kg-sugar-x10.png',
        'https://i.ibb.co/rKRn7jpJ/Golden-Penny-Spread.jpg',
    ],
  },
  {
    id: 3,
    name: 'Retailer Restock Bundle',
    category: 'BULK PACKAGES',
    description: 'A curated bundle of fast-moving consumer goods perfect for retail shelves. Includes noodles, pasta, and seasonings.',
    includedItems: ['Carton of Indomie Noodles', 'Pack of Golden Penny Spaghetti', 'Box of Terra Cubes', '+ 5 more items...'],
    moq: '100 Bundles',
    leadTime: '3-5 Days',
    delivery: 'Lagos Only',
    badge: 'WHOLESALE',
    isTopSeller: true,
    images: [
      'https://i.ibb.co/DHrY3r6D/Indomie-Chicken-Noodles-70g.png',
      'https://i.ibb.co/Wv1C38Cf/Golden-Penny-Spaghetti-500g.png',
      'https://i.ibb.co/fYSwD5Fq/Terra-beef-1cube.webp',
    ],
  },
];

const BulkPackageCard = ({ pkg }: { pkg: BulkPackage }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-lg h-full flex flex-col border border-transparent hover:border-amber-400 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 ease-in-out group">
    <div className="relative h-72 w-full bg-gradient-to-br from-amber-50 to-amber-100 p-5 flex items-end justify-center overflow-hidden border-b border-gray-200">
      {pkg.badge && (
        <div className="absolute top-3 left-3 bg-amber-400 text-slate-900 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider shadow-md z-10">
          {pkg.badge}
        </div>
      )}
      {pkg.isTopSeller && (
        <div className="absolute top-3 right-3 bg-sky-900 text-white w-14 h-14 rounded-full flex items-center justify-center text-center text-[11px] font-bold z-10 leading-none shadow-lg">
          ⭐<br/>TOP SELLER
        </div>
      )}
      <div className="flex items-end justify-center -space-x-8 max-h-56 w-full">
        {pkg.images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`${pkg.name} item ${index + 1}`}
            className={`max-h-52 object-contain transition-transform duration-300 ease-in-out group-hover:scale-105 z-${10 - index}`}
            style={{ transform: `translateX(${(index - 1) * 10}px)` }}
          />
        ))}
      </div>
    </div>
    <div className="p-5 flex flex-col gap-3 flex-grow justify-between bg-white">
      <div>
        <span className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{pkg.category}</span>
        <h3 className="text-lg font-bold text-slate-900 leading-tight mt-1 mb-2 truncate-2-lines">{pkg.name}</h3>
        <p className="text-sm text-gray-600 leading-snug truncate-2-lines">{pkg.description}</p>
        <div className="mt-4 mb-3">
          <ul className="text-xs font-semibold text-sky-800 space-y-1 max-h-16 overflow-hidden">
            {pkg.includedItems.map((item, i) => <li key={i}>✓ {item}</li>)}
          </ul>
        </div>
      </div>
      <div>
        <div className="bg-gray-100 p-3 rounded-lg flex justify-between gap-3 mt-3 text-xs font-semibold">
          <div className="text-center">
            <span className="text-gray-500 block">MOQ</span>
            <span className="text-slate-800">{pkg.moq}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block">Lead Time</span>
            <span className="text-slate-800">{pkg.leadTime}</span>
          </div>
          <div className="text-center">
            <span className="text-gray-500 block">Delivery</span>
            <span className="text-slate-800">{pkg.delivery}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 mt-4">
          <Button size="lg" className="w-full !text-sm !font-bold rounded-full bg-slate-900 hover:bg-sky-800 active:scale-[0.98] shadow-lg hover:shadow-sky-200 transition-all">
            Request Quote
          </Button>
          <Button variant="outline" size="sm" className="w-full font-semibold text-slate-800 border-gray-300 hover:bg-gray-100 hover:border-slate-800">
            View Details <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

export const FeaturedBulkPackages = () => {
  const useCarousel = process.env.NEXT_PUBLIC_USE_BANNER_CAROUSEL !== 'false';

  useEffect(() => {
    const styleId = 'truncate-2-lines-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .truncate-2-lines {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (useCarousel) {
    return <BulkPackagesCarousel packages={bulkPackages} />;
  }

  return (
    <div className="bg-gradient-to-b from-yellow-50 via-yellow-100 to-white">
    <Section className="max-w-full py-16 px-6">
      <div className="text-center max-w-4xl mx-auto mb-12">
        <p className="font-bold text-sky-800 text-sm uppercase tracking-widest">WHOLESALE PACKAGES</p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tighter mt-3 mb-4 leading-tight">
            Curated Bulk Packages for B2B Orders
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Pre-configured bulk packages designed for restaurants, retailers, wholesalers, and food service businesses. Mix and match or request custom packages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 max-w-7xl mx-auto px-6">
        {bulkPackages.map((pkg) => (
          <BulkPackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </Section>
    </div>
  );
};

export default FeaturedBulkPackages;
