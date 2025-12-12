export interface ResourceItem {
  id: string;
  slug: string;
  category: 'News' | 'Insights' | 'Guides' | 'Case Study' | 'Webinar';
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  imageHint: string;
  content: string;
  readTime?: number;
  author?: string;
}

const resourceItems: ResourceItem[] = [
  // News Items
  {
    id: '1',
    slug: 'fmcg-trends-shaping-2024',
    category: 'News',
    title: 'Top 5 FMCG Trends Shaping the Nigerian Market in 2024',
    excerpt: 'From sustainability to digitalization, discover the key trends that are influencing consumer behavior and reshaping the FMCG landscape in Nigeria.',
    date: 'July 15, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHJldGFpbHxlbnwwfHx8fDE3NjQyMzkzODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'smart retail',
    readTime: 5,
    author: 'BZION Analytics Team',
    content: '<p>The Nigerian FMCG market is undergoing a significant transformation. As consumer preferences evolve, businesses must adapt to stay competitive. This year, we are seeing a strong push towards <strong>digital integration</strong> in the supply chain, with more retailers leveraging technology to manage inventory and streamline procurement. Another key trend is the growing demand for <strong>sustainably sourced products</strong>, as consumers become more conscious of their environmental impact. Additionally, the rise of e-commerce is forcing traditional distributors to rethink their strategies and embrace online channels to reach a wider audience.</p><p>At BZION, we are at the forefront of these changes, helping our partners navigate this new landscape with innovative solutions and a reliable supply of high-quality products.</p>'
  },
  {
    id: '2',
    slug: 'bzion-expands-to-oyo-state',
    category: 'News',
    title: 'BZION Hub Digital Expands Operations to Oyo State',
    excerpt: 'We are thrilled to announce the opening of our new distribution center in Ibadan, bringing our reliable service and quality products closer to businesses in Oyo State.',
    date: 'July 1, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1590198434099-c8273a5a753d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwZXhwYW5zaW9ufGVufDB8fHx8MTc2NDIzOTM2N3ww&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'company expansion',
    readTime: 4,
    author: 'BZION Communications',
    content: '<p>In our ongoing effort to build Nigeria\'s most reliable food supply chain, BZION is proud to announce the launch of our new distribution hub in Ibadan, Oyo State. This expansion allows us to better serve our growing network of partners in the region, offering them faster delivery times and more localized support. The new facility is equipped with modern technology to ensure efficient inventory management and order fulfillment. We are excited to bring our promise of quality, reliability, and partnership to the businesses of Oyo State and look forward to fostering new relationships in the community.</p>'
  },

  // Insights & Guides
  {
    id: '3',
    slug: 'optimizing-your-supply-chain',
    category: 'Insights',
    title: 'How to Optimize Your Supply Chain for Maximum Efficiency',
    excerpt: 'Learn practical tips for streamlining your procurement process, reducing costs, and ensuring a steady supply of goods with BZION\'s expert insights.',
    date: 'July 10, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dpc3RpY3MlMjB3YXJlaG91c2V8ZW58MHx8fHwxNzY0MjM5MzY3fDA&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'logistics warehouse',
    readTime: 6,
    author: 'Supply Chain Expert',
    content: '<p>An efficient supply chain is the backbone of any successful retail or food service business. The key to optimization lies in <strong>visibility and data</strong>. By tracking inventory levels in real-time and analyzing sales data, you can make smarter purchasing decisions and avoid stock-outs. Partnering with a reliable distributor like BZION provides access to a robust logistics network, which can significantly reduce delivery times and transportation costs. We also recommend consolidating orders to take advantage of bulk pricing and minimize shipping frequency. By implementing these strategies, you can build a more resilient and profitable business.</p>'
  },
  {
    id: '4',
    slug: 'digital-transformation-in-retail',
    category: 'Insights',
    title: 'Digital Transformation: The Future of Nigerian Retail',
    excerpt: 'Understand how digital tools are revolutionizing the retail landscape and how you can leverage technology to grow your business in Nigeria.',
    date: 'June 25, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwdHJhbnNmb3JtYXRpb258ZW58MHx8fHwxNzY0MjM5NTMwfDA&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'digital technology',
    readTime: 7,
    author: 'Technology Lead',
    content: '<p>Digital transformation is no longer optional—it\'s essential. Nigerian retailers who embrace digital tools gain a competitive advantage through better inventory management, improved customer experience, and real-time data insights. Mobile apps, cloud-based systems, and automated ordering processes are streamlining operations across the industry. BZION\'s digital platform empowers your business with real-time access to product catalogs, pricing, and delivery tracking. Whether you\'re a small shop owner or a large distribution network, our tools help you make data-driven decisions and scale efficiently.</p>'
  },
  {
    id: '5',
    slug: 'sustainable-sourcing-guide',
    category: 'Guides',
    title: 'Sustainable Sourcing: A Practical Guide for FMCG Retailers',
    excerpt: 'Learn how to build a sustainable supply chain while maintaining profitability and meeting consumer expectations.',
    date: 'June 15, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1553531088-df340cf313d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdXN0YWluYWJsZXxlbnwwfHx8fDE3NjQyMzk1NjB8MA&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'sustainable products',
    readTime: 8,
    author: 'Sustainability Officer',
    content: '<p>Consumers are increasingly conscious of their environmental impact, and retailers who offer sustainable products gain customer loyalty. This guide walks you through the process of sourcing sustainable FMCG products, evaluating supplier practices, and communicating your commitment to sustainability to your customers. BZION partners with eco-conscious suppliers and offers a curated selection of sustainable products that don\'t compromise on quality or price. By adopting sustainable sourcing, you\'re not just meeting consumer demands—you\'re investing in the future of your business.</p>'
  },
  {
    id: '6',
    slug: 'small-business-growth-strategy',
    category: 'Guides',
    title: 'Growth Strategy for Small FMCG Retailers: From Startup to Scale',
    excerpt: 'A comprehensive roadmap for small business owners to scale their operations, expand their product range, and increase profitability.',
    date: 'June 1, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGdyb3d0aHxlbnwwfHx8fDE3NjQyMzk1ODB8MA&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'business growth',
    readTime: 10,
    author: 'Business Strategy Team',
    content: '<p>Starting a small FMCG retail business is exciting, but scaling it requires strategy. This comprehensive guide covers market analysis, customer segmentation, product selection, inventory management, and pricing strategies. We also share insights from successful BZION partners who have grown from single-store operations to multi-location businesses. Key takeaways include understanding your local market, building strong supplier relationships, leveraging data for decision-making, and investing in your team. With the right approach and the right partner in BZION, your business can achieve sustainable growth.</p>'
  },
  {
    id: '7',
    slug: 'bzion-success-story-lagos',
    category: 'Case Study',
    title: 'Case Study: How Bola\'s Supermarket Increased Revenue by 45% with BZION',
    excerpt: 'Discover how one Lagos-based supermarket owner transformed their business through strategic partnerships and better inventory management.',
    date: 'May 20, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzdWNjZXNzfGVufDB8fHx8MTc2NDIzOTYwMXww&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'success story',
    readTime: 6,
    author: 'Case Study Team',
    content: '<p>Meet Bola, a supermarket owner in Lagos who faced inventory challenges and supply inconsistencies before partnering with BZION. By switching to our platform, Bola gained real-time inventory visibility, faster delivery times, and access to a wider range of quality products. Within six months, his revenue increased by 45%, customer satisfaction scores improved, and he was able to expand to a second location. This case study walks through the specific strategies Bola implemented and how BZION\'s tools and partnerships enabled his success. If you\'re facing similar challenges, this story shows what\'s possible.</p>'
  },
  {
    id: '8',
    slug: 'managing-cash-flow',
    category: 'Guides',
    title: 'Cash Flow Management for FMCG Businesses: Best Practices',
    excerpt: 'Practical strategies for managing cash flow, understanding payment terms, and maintaining healthy working capital in your FMCG business.',
    date: 'May 10, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxmaW5hbmNlJTIwbWFuYWdlbWVudHxlbnwwfHx8fDE3NjQyMzk2MjF8MA&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'cash flow management',
    readTime: 7,
    author: 'Finance Expert',
    content: '<p>Strong cash flow management is critical for FMCG businesses. Many retailers struggle with the gap between when they purchase inventory and when they receive payment from customers. This guide covers essential strategies: negotiating favorable payment terms with suppliers, implementing efficient invoicing and payment collection systems, forecasting cash needs, and leveraging credit opportunities. BZION offers flexible payment terms and credit options designed specifically for FMCG retailers, helping you maintain healthy cash flow while scaling your business.</p>'
  },
];

export function getResourceItems(): ResourceItem[] {
  return resourceItems;
}

export function getResourceItemBySlug(slug: string): ResourceItem | undefined {
  return resourceItems.find(item => item.slug === slug);
}

export function getResourcesByCategory(category: ResourceItem['category']): ResourceItem[] {
  return resourceItems.filter(item => item.category === category);
}

export function getCategories(): ResourceItem['category'][] {
  const categories = new Set(resourceItems.map(item => item.category));
  return Array.from(categories) as ResourceItem['category'][];
}
