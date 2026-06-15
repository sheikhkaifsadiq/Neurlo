import Link from "next/link";

export const metadata = { title: "Privacy Policy | Neurlo" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-ink/10 px-6 py-4">
        <Link href="/" className="font-display font-bold text-xl text-ink">
          Neur<span className="text-accent">lo</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl text-ink mb-4">Privacy Policy</h1>
        <p className="text-muted font-mono text-sm mb-12">Last updated: May 3, 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-ink/80 font-mono leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, including your name, email address, and payment information when you create an account or subscribe. We also automatically collect usage data, log files, and device information when you interact with our Service.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide, maintain, and improve the Service; process transactions; send transactional and promotional communications; and comply with legal obligations. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored on secure, encrypted servers. We implement industry-standard security measures including TLS encryption, bcrypt password hashing, and regular security audits. However, no system is 100% secure and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">4. Cookies</h2>
            <p>We use cookies and similar tracking technologies to maintain sessions, remember preferences, and analyze usage patterns. You can control cookie settings through your browser preferences.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">5. Third-Party Services</h2>
            <p>We use third-party services including Stripe (payments), Resend (email), and Neon (database hosting). These services have their own privacy policies governing data handling.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may request data export or account deletion at any time from your account settings or by emailing us.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. Upon deletion, we remove personally identifiable information within 30 days, subject to legal and backup retention requirements.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">8. Contact</h2>
            <p>For privacy inquiries or data requests, contact us at <a href="mailto:privacy@neurlo.tech" className="text-accent hover:underline">privacy@neurlo.tech</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-ink/10">
          <Link href="/" className="text-sm text-muted font-mono hover:text-ink transition-colors">← Back to Neurlo</Link>
        </div>
      </div>
    </div>
  );
}
