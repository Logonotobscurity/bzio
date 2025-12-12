import { Building, Truck, ShieldCheck, Banknote, Cake, Package, Warehouse, Scaling, Hotel, LucideIcon } from 'lucide-react';

export const FOOTER_LINKS = {
    platform: [
        { title: 'Products', href: '/products' },
        { title: 'Suppliers', href: '/suppliers' },
        { title: 'Request a Quote', href: '/rfq' },
        { title: 'Compliance', href: '/compliance' },
    ],
    company: [
        { title: 'About Us', href: '/about' },
        { title: 'Careers', href: '/careers' },
        { title: 'Contact', href: '/contact' },
        { title: 'Resources', href: '/resources' },
    ],
    customers: [
        { title: 'For Schools & Institutions', href: '/customers' },
        { title: 'For Retail & Supermarkets', href: '/customers' },
        { title: 'For Bulk Buyers & Wholesalers', href: '/customers' },
        { title: 'For Export & International Orders', href: '/customers' },
    ],
};

export interface CustomerSegment {
  preamble: string;
  title: string;
  description: string;
  imageId: string;
  href: string;
  features: {
    icon: LucideIcon;
    label: string;
  }[];
}

export const CUSTOMER_SEGMENTS: CustomerSegment[] = [
  {
    preamble: 'For Schools & Institutions',
    title: 'Reliable, Safe, & Budget-Friendly Provisions',
    description: 'Ensure safe, consistent, and timely food supply for your community. We offer scheduled deliveries of NAFDAC-certified products, making budget planning and kitchen management simple and predictable.',
    imageId: 'customer-institutions',
    href: '/customers#customer-institutions',
    features: [
        { icon: Building, label: 'Scheduled Deliveries' },
        { icon: ShieldCheck, label: 'NAFDAC Certified' },
        { icon: Banknote, label: 'Budget-Friendly' },
    ]
  },
  {
    preamble: 'For Events & Celebrations',
    title: 'Make Your Events Memorable with Quality Ingredients',
    description: 'From weddings to corporate events, we provide high-quality ingredients to make your celebrations a success. We offer flexible delivery options to meet the unique needs of your event.',
    imageId: 'customer-events',
    href: '/customers#customer-events',
    features: [
      { icon: Cake, label: 'Premium Ingredients' },
      { icon: Truck, label: 'Flexible Delivery' },
      { icon: ShieldCheck, label: 'Quality Guaranteed' },
    ]
  },
  {
    preamble: 'For Retail & Supermarkets',
    title: 'Keep Your Shelves Stocked & Customers Loyal',
    description: 'Eliminate stock-outs of high-demand consumer goods. Our direct brand partnerships give you priority access to the products your customers want, ensuring they always find what they’re looking for.',
    imageId: 'customer-retail',
    href: '/customers#customer-retail',
    features: [
      { icon: Package, label: 'In-Demand Stock' },
      { icon: Warehouse, label: 'Zero Stock-Outs' },
      { icon: Scaling, label: 'Competitive Edge' },
    ]
  },
  {
    preamble: 'For Bulk Buyers & Wholesalers',
    title: 'Scale Your Network with a Stronger Supply Chain',
    description: 'Strengthen your supply chain with direct-from-manufacturer sourcing. Access bulk pricing and a robust logistics network to improve your margins and deliver reliably to your own network.',
    imageId: 'customer-wholesalers',
    href: '/customers#customer-wholesalers',
    features: [
        { icon: Package, label: 'Direct Sourcing' },
        { icon: Truck, label: 'Logistics Network' },
        { icon: Scaling, label: 'Better Margins' },
    ]
  },
  {
    preamble: 'For Export & International Orders',
    title: 'Global Sourcing and Logistics for International Markets',
    description: 'Expand your business globally with our expert export services. We handle all logistics to ensure your products arrive safely and on time to any international destination.',
    imageId: 'customer-export',
    href: '/customers#customer-export',
    features: [
      { icon: Truck, label: 'Worldwide Shipping' },
      { icon: Package, label: 'Expert Handling' },
      { icon: ShieldCheck, label: 'Customs Compliance' },
    ]
  },
  {
    preamble: 'For Healthcare & Hospitality',
    title: 'Uphold Your Standard of Excellence in Care and Service',
    description: 'We provide a dependable supply of premium, authentic food and beverage ingredients for hospitals, hotels, and other hospitality services, so you can consistently deliver the excellence your brand promises.',
    imageId: 'customer-hospitality',
    href: '/customers#customer-hospitality',
    features: [
      { icon: Hotel, label: 'Premium Selection' },
      { icon: ShieldCheck, label: 'Unwavering Quality' },
      { icon: Truck, label: 'Dedicated Support' },
    ]
  },
];


export const TESTIMONIALS = [
  {
    quote: "I started doing business with Bzion 5 years ago. What endeared me to the organisation was primarily its customer service and relationship.",
    author: "Godspower E.U Udi",
    company: "MD, Buktek & Buktek Nig ltd"
  },
  {
    quote: "I have been doing business with Bzion for over 15 years and can testify to their excellent service. Their product are of good quality at a reasonable price. They have good customer relationships. Partner with them today and I can assure you will not regret it.",
    author: "Olayioye Abiola",
    company: "MD, Wuraolaikeoluwe"
  },
  {
    quote: "I implore everyone to shop Bzion. Bzion put me through and gave me the necessary resources I needed for starting my business. They have so many products and they’re good at keeping relationships and ensuring your business is stocked with what you need.",
    author: "Mercy Oshoma",
    company: "MD, Mercy Store"
  }
];
