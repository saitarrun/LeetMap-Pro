import { UserProfile } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings | LeetMap Pro",
  description: "Manage your LeetMap Pro user profile, connected accounts, security keys, and sessions.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in?redirect_url=/account");
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="apple-press inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to LeetMap Pro</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted &amp; Privacy-First</span>
          </div>
        </div>

        {/* UserProfile Component */}
        <div className="flex justify-center pb-12">
          <UserProfile
            routing="path"
            path="/account"
            appearance={{
              elements: {
                rootBox: "w-full max-w-3xl",
                cardBox: "w-full shadow-none border border-[var(--border)] rounded-2xl bg-[var(--bg-card)]",
                navbar: "border-r border-[var(--border)]",
                navbarMobileMenuButton: "text-[var(--text-main)]",
                headerTitle: "text-[var(--text-main)] font-bold",
                headerSubtitle: "text-[var(--text-muted)]",
                profileSectionTitleText: "text-[var(--text-main)] font-semibold",
                userPreviewSecondaryIdentifier: "text-[var(--text-muted)]",
              },
            }}
          />
        </div>
      </main>
    </div>
  );
}
