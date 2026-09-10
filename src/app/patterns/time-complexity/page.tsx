import { Metadata } from 'next';
import { TimeComplexityGuide } from '@/components/TimeComplexityGuide';

export const metadata: Metadata = {
  title: 'Time & Space Complexity — LeetMap',
  description:
    'Master Big O notation from scratch. Learn how to calculate time and space complexity for every DSA pattern used in coding interviews.',
};

export default function TimeComplexityPage() {
  return <TimeComplexityGuide />;
}
