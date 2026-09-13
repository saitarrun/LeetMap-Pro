import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { CustomSignUpForm } from '@/components/CustomSignUpForm';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your free LeetMap Pro account to track company-wise LeetCode and SQL interview progress.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <CustomSignUpForm />
      </main>
    </div>
  );
}
