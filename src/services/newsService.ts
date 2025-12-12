export interface NewsItem {
  id: string;
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  imageUrl: string;
  imageHint: string;
  content: string;
}

const newsItems: NewsItem[] = [
  {
    id: '1',
    slug: 'fmcg-trends-shaping-2024',
    category: 'Market Trends',
    title: 'Top 5 FMCG Trends Shaping the Nigerian Market in 2024',
    excerpt: 'From sustainability to digitalization, discover the key trends that are influencing consumer behavior and reshaping the FMCG landscape in Nigeria.',
    date: 'July 15, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxzbWFydCUyMHJldGFpbHxlbnwwfHx8fDE3NjQyMzkzODR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    imageHint: 'smart retail',
    content: '<p>The Nigerian FMCG market is undergoing a significant transformation. As consumer preferences evolve, businesses must adapt to stay competitive. This year, we are seeing a strong push towards <strong>digital integration</strong> in the supply chain, with more retailers leveraging technology to manage inventory and streamline procurement. Another key trend is the growing demand for <strong>sustainably sourced products</strong>, as consumers become more conscious of their environmental impact. Additionally, the rise of e-commerce is forcing traditional distributors to rethink their strategies and embrace online channels to reach a wider audience.</p><p>At BZION, we are at the forefront of these changes, helping our partners navigate this new landscape with innovative solutions and a reliable supply of high-quality products.</p>'
  },
  {
    id: '2',
    slug: 'optimizing-your-supply-chain',
    category: 'Business Tips',
    title: 'How to Optimize Your Supply Chain for Maximum Efficiency',
    excerpt: 'Learn practical tips for streamlining your procurement process, reducing costs, and ensuring a steady supply of goods with BZION’s expert insights.',
    date: 'July 10, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1578574577315-3fbeb0cecdc2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxsb2dpc3RpY3MlMjB3YXJlaG91c2V8ZW58MHx8fHwxNzY0MjM5MzY3fDA&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'logistics warehouse',
    content: '<p>An efficient supply chain is the backbone of any successful retail or food service business. The key to optimization lies in <strong>visibility and data</strong>. By tracking inventory levels in real-time and analyzing sales data, you can make smarter purchasing decisions and avoid stock-outs. Partnering with a reliable distributor like BZION provides access to a robust logistics network, which can significantly reduce delivery times and transportation costs. We also recommend consolidating orders to take advantage of bulk pricing and minimize shipping frequency. By implementing these strategies, you can build a more resilient and profitable business.</p>'
  },
  {
    id: '3',
    slug: 'bzion-expands-to-oyo-state',
    category: 'Company News',
    title: 'BZION Hub Digital Expands Operations to Oyo State',
    excerpt: 'We are thrilled to announce the opening of our new distribution center in Ibadan, bringing our reliable service and quality products closer to businesses in Oyo State.',
    date: 'July 1, 2024',
    imageUrl: 'https://images.unsplash.com/photo-1590198434099-c8273a5a753d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjb21wYW55JTIwZXhwYW5zaW9ufGVufDB8fHx8MTc2NDIzOTM2N3ww&ixlib.rb-4.1.0&q=80&w=1080',
    imageHint: 'company expansion',
    content: '<p>In our ongoing effort to build Nigeria’s most reliable food supply chain, BZION is proud to announce the launch of our new distribution hub in Ibadan, Oyo State. This expansion allows us to better serve our growing network of partners in the region, offering them faster delivery times and more localized support. The new facility is equipped with modern technology to ensure efficient inventory management and order fulfillment. We are excited to bring our promise of quality, reliability, and partnership to the businesses of Oyo State and look forward to fostering new relationships in the community.</p>'
  },
];

export function getNewsItems(): NewsItem[] {
  return newsItems;
}

export function getNewsItemBySlug(slug: string): NewsItem | undefined {
  return newsItems.find(item => item.slug === slug);
}
