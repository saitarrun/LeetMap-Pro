import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Settings | LeetMap Pro',
  description: 'Manage your LeetMap Pro user profile, connected accounts, security keys, and sessions.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
