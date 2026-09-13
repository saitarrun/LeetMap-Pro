import { Metadata } from 'next';
import { TimeComplexityGuide } from '@/components/TimeComplexityGuide';

export const metadata: Metadata = {
  title: 'Time & Space Complexity',
  description:
    'Master Big O notation from scratch. Learn how to calculate time and space complexity for every DSA pattern used in coding interviews.',
  alternates: {
    canonical: 'https://www.leetmap-pro.com/patterns/time-complexity',
  },
  openGraph: {
    title: 'Time & Space Complexity | LeetMap Pro',
    description:
      'Master Big O notation from scratch. Learn how to calculate time and space complexity for every DSA pattern used in coding interviews.',
    url: 'https://www.leetmap-pro.com/patterns/time-complexity',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time & Space Complexity | LeetMap Pro',
    description: 'Master Big O notation from scratch. Learn how to calculate time and space complexity for every DSA pattern used in coding interviews.',
  },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://www.leetmap-pro.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Patterns',
      item: 'https://www.leetmap-pro.com/patterns',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Time & Space Complexity',
      item: 'https://www.leetmap-pro.com/patterns/time-complexity',
    },
  ],
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: 'Time & Space Complexity Guide for Coding Interviews',
  description: 'Master Big O notation from scratch. Learn how to calculate time and space complexity for every DSA pattern.',
  author: {
    '@type': 'Organization',
    name: 'LeetMap Pro',
    url: 'https://www.leetmap-pro.com',
  },
  url: 'https://www.leetmap-pro.com/patterns/time-complexity',
};

export default function TimeComplexityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbJsonLd, articleJsonLd]) }}
      />
      <TimeComplexityGuide />
    </>
  );
}
