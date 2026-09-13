import React from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { PublicProfileView } from '@/components/PublicProfileView';
import { fetchPublicUserProfile } from '@/utils/server-user';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const profileData = await fetchPublicUserProfile(username);

  if (!profileData) {
    return {
      title: 'User Profile Not Found | LeetMap Pro',
      description: 'The requested LeetMap Pro user profile could not be found.',
    };
  }

  const { user, stats } = profileData;
  const title = `${user.name} (@${user.username}) | LeetMap Pro Profile`;
  const description = `${user.name} has solved ${stats.totalSolved} LeetCode problems with a ${stats.currentStreak}-day active study streak. View verified interview pattern readiness on LeetMap Pro.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.leetmap-pro.com/u/${user.username}`,
    },
    openGraph: {
      title,
      description,
      url: `https://www.leetmap-pro.com/u/${user.username}`,
      type: 'profile',
      images: [
        {
          url: user.avatarUrl,
          width: 256,
          height: 256,
          alt: user.name,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [user.avatarUrl],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const profileData = await fetchPublicUserProfile(username);

  if (!profileData) {
    notFound();
  }

  const { user, stats } = profileData;

  const profileJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: user.name,
      alternateName: user.username,
      image: user.avatarUrl,
      url: `https://www.leetmap-pro.com/u/${user.username}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
      />
      <Header />
      <main className="flex-1 pb-16">
        <PublicProfileView initialData={profileData} />
      </main>
    </div>
  );
}
