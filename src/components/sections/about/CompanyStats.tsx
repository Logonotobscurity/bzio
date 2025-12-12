'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Section } from '@/components/ui/section';
import { GsapScrollTrigger } from '@/components/ui/GsapScrollTrigger';

// Animated SVG Icons
const CustomersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="currentColor"
  >
    <path d="m49.5 17.5c0 9.6358-7.5824 17.5-17 17.5s-17-7.8642-17-17.5c0-9.6358 7.5824-17.5 17-17.5s17 7.8642 17 17.5zm-17 16.5c8.8365 0 16-7.3873 16-16.5s-7.1635-16.5-16-16.5c-8.8366 0-16 7.3873-16 16.5s7.1634 16.5 16 16.5zm-0.5 7.5c-11.062 0-17.904 3.541-21.938 8.0413-4.0205 4.4852-5.2014 9.8682-5.0495 13.48l0.02014 0.479h53.934l0.0202-0.479c0.1518-3.6115-1.0291-8.9945-5.0496-13.48-4.0339-4.5003-10.876-8.0413-21.938-8.0413zm21.193 8.7087c3.6467 4.0683 4.8291 8.9122 4.8066 12.291h-51.999c-0.02248-3.3791 1.1599-8.223 4.8066-12.291 3.8094-4.2497 10.358-7.7087 21.193-7.7087 10.834 0 17.384 3.459 21.193 7.7087z" />
  </svg>
);

const BrandsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="currentColor"
  >
    <path d="M32 8L42 18L48 24L40 32L32 24L24 32L16 24L22 18L32 8M12 36H52V56H12Z" />
  </svg>
);

const ExperienceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="currentColor"
  >
    <path d="M32 4C18.75 4 8 14.75 8 28c0 7.25 3.25 13.75 8.5 18.25V56h4V50h27v6h4V46.25C52.75 41.75 56 35.25 56 28 56 14.75 45.25 4 32 4zm0 48c-11 0-20-9-20-20S21 12 32 12s20 9 20 20-9 20-20 20zm0-36c-8.25 0-16 6.75-16 16s6.75 16 16 16 16-6.75 16-16-6.75-16-16-16z" />
  </svg>
);

// Types
interface StatItem {
  id: string;
  value: number;
  suffix: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CountUpNumberProps {
  value: number;
  suffix?: string;
  duration?: number;
}

// Count up animation component
const CountUpNumber: React.FC<CountUpNumberProps> = ({
  value,
  suffix = '',
  duration = 2000,
}) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentCount = Math.floor(value * progress);
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(value);
            }
          };

          animate();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [value, duration]);

  return (
    <span ref={elementRef} className="font-black">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// Stat card component
interface StatCardProps {
  stat: StatItem;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ stat, delay = 0 }) => {
  const Icon = stat.icon;

  return (
    <GsapScrollTrigger delay={delay}>
      <div className="group relative">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 p-8 border-2 border-slate-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          {/* Icon */}
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Icon className="h-7 w-7 text-primary" />
          </div>

          {/* Number */}
          <div className="mb-3">
            <span className="text-6xl font-black text-slate-900">
              <CountUpNumber value={stat.value} suffix={stat.suffix} />
            </span>
          </div>

          {/* Label */}
          <p className="text-lg font-semibold text-slate-600">
            {stat.label}
          </p>
        </div>
      </div>
    </GsapScrollTrigger>
  );
};

// Secondary stats data
const statsData: StatItem[] = [
  {
    id: 'experience',
    value: 20,
    suffix: '+',
    label: 'Years in Business',
    icon: ExperienceIcon,
  },
  {
    id: 'customers',
    value: 3000,
    suffix: '+',
    label: 'Happy Customers',
    icon: CustomersIcon,
  },
  {
    id: 'brands',
    value: 50,
    suffix: '+',
    label: 'Partner Brands',
    icon: BrandsIcon,
  },
];

// Secondary stats data
const secondaryStatsData = [
  { label: '20+', value: 'Years in Business' },
  { label: '3,000+', value: 'Happy Customers' },
  { label: 'Nationwide', value: 'Delivery Coverage' },
  { label: '50+', value: 'Partner Brands' },
];

// Main component
const CompanyStats: React.FC = () => {
  return (
    <Section className="bg-slate-50 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <GsapScrollTrigger>
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-secondary">
              Our Achievement
            </p>
            <h2 className="mb-4 text-4xl md:text-5xl font-bold text-slate-900">
              BZION by the Numbers
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-600">
              Trusted by thousands of businesses across Nigeria with proven results and consistent growth
            </p>
          </div>
        </GsapScrollTrigger>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {statsData.map((stat, index) => (
            <StatCard key={stat.id} stat={stat} delay={index * 0.15} />
          ))}
        </div>

        {/* Secondary Stats */}
        <GsapScrollTrigger delay={0.45}>
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {secondaryStatsData.map((stat, index) => (
                <div key={`${stat.label}-${index}`} className="text-center">
                  <p className="mb-2 text-5xl font-black text-primary">
                    {stat.label}
                  </p>
                  <p className="text-base text-slate-600 font-semibold">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </GsapScrollTrigger>
      </div>
    </Section>
  );
};

export default CompanyStats;
