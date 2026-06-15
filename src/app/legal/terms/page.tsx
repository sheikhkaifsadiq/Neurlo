import Link from "next/link";

export const metadata = { title: "Terms of Service | Neurlo" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-paper">
      <nav className="border-b border-ink/10 px-6 py-4">
        <Link href="/" className="font-display font-bold text-xl text-ink">
          Neur<span className="text-accent">lo</span>
        </Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-serif text-4xl text-ink mb-4">Terms of Service</h1>
        <p className="text-muted font-mono text-sm mb-12">Last updated: May 3, 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-ink/80 font-mono leading-relaxed">
          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Neurlo ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the Service.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">2. Use of the Service</h2>
            <p>You may use Neurlo only for lawful purposes and in accordance with these Terms. You agree not to use the Service to violate any applicable laws or regulations, infringe on the rights of others, or transmit harmful or malicious content.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">3. Accounts & Security</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorized use of your account. Neurlo is not liable for any loss resulting from unauthorized account access.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">4. Subscription & Billing</h2>
            <p>Paid subscriptions are billed in advance on a monthly or annual basis. Cancellations take effect at the end of the current billing period. Refunds are issued at our sole discretion.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">5. Intellectual Property</h2>
            <p>All content, features, and functionality of the Service are owned by Neurlo, Inc. and are protected by applicable intellectual property laws. You may not copy, modify, or distribute our proprietary materials without express written consent.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">6. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Neurlo shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">7. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify you of significant changes via email or in-app notification. Continued use of the Service after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="font-display font-bold text-xl text-ink mb-3">8. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:legal@neurlo.tech" className="text-accent hover:underline">legal@neurlo.tech</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-ink/10">
          <Link href="/" className="text-sm text-muted font-mono hover:text-ink transition-colors">← Back to Neurlo</Link>
        </div>
      </div>
    </div>
  );
}
