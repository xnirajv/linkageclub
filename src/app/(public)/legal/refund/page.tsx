import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Understanding refunds and cancellations on InternHub',
};

const surfaceClass =
  'glass-card rounded-[32px] border border-white/55 bg-card/88 p-8 shadow-[0_28px_70px_-40px_rgba(52,74,134,0.28)] dark:border-white/10 dark:bg-charcoal-950/78 dark:shadow-[0_28px_80px_-46px_rgba(0,0,0,0.7)]';

const headingClass = 'text-2xl font-semibold tracking-tight text-charcoal-950 dark:text-white';
const subheadingClass = 'text-lg font-semibold text-charcoal-900 dark:text-charcoal-100';
const bodyClass = 'whitespace-pre-line text-base leading-8 text-charcoal-600 dark:text-charcoal-300';

export default function RefundPage() {
  const lastUpdated = 'January 1, 2024';

  const sections = [
    {
      title: '1. Overview',
      content:
        'This Refund Policy explains your rights to refunds for various services on InternHub. We strive to be fair and transparent in all transactions. Different services have different refund policies as detailed below.',
    },
    {
      title: '2. Assessment Fees',
      subsections: [
        {
          title: '2.1 Before Starting',
          content: 'Full refund available if you cancel before starting the assessment.',
        },
        {
          title: '2.2 After Starting',
          content: "No refund once you've started an assessment, regardless of completion.",
        },
        {
          title: '2.3 Technical Issues',
          content:
            'If you experience technical issues during an assessment, contact support within 24 hours. We may offer a retake or refund at our discretion.',
        },
      ],
    },
    {
      title: '3. Project Payments',
      subsections: [
        {
          title: '3.1 Escrow System',
          content: 'Project payments are held in escrow and released only when milestones are approved by both parties.',
        },
        {
          title: '3.2 Milestone Refunds',
          content: 'Once a milestone is marked as complete and approved, the payment is released and cannot be refunded.',
        },
        {
          title: '3.3 Disputes',
          content: "If you're unsatisfied with work, you can open a dispute within 7 days of milestone submission. Our team will review and mediate.",
        },
        {
          title: '3.4 Cancellation',
          content:
            'If a project is cancelled before completion, escrow funds will be distributed based on work completed, as determined by our dispute resolution process.',
        },
      ],
    },
    {
      title: '4. Mentor Sessions',
      subsections: [
        {
          title: '4.1 Cancellation by Student',
          content:
            '• More than 24 hours before session: Full refund\n• Less than 24 hours before session: 50% refund\n• No-show: No refund',
        },
        {
          title: '4.2 Cancellation by Mentor',
          content: 'If mentor cancels, you receive full refund plus 100% credit for future session.',
        },
        {
          title: '4.3 Technical Issues',
          content: 'If technical issues prevent the session, contact support within 24 hours for a full refund or reschedule.',
        },
        {
          title: '4.4 Unsatisfactory Session',
          content: "If you're unsatisfied with the session quality, report within 48 hours for review.",
        },
      ],
    },
    {
      title: '5. Subscription Plans',
      subsections: [
        {
          title: '5.1 Monthly Plans',
          content: "Cancel anytime. You'll have access until the end of your billing period. No partial refunds for unused time.",
        },
        {
          title: '5.2 Yearly Plans',
          content: "30-day money-back guarantee if you're not satisfied. After 30 days, no refunds for the remaining months.",
        },
        {
          title: '5.3 Free Trials',
          content: 'No charge during trial period. Cancel before trial ends to avoid billing.',
        },
      ],
    },
    {
      title: '6. Wallet Balance',
      content:
        "Funds added to your InternHub wallet are non-refundable but remain in your account until used. You can request a refund within 7 days of adding funds if they haven't been used.",
    },
    {
      title: '7. How to Request a Refund',
      content:
        'To request a refund:\n\n1. Go to the relevant transaction in your dashboard\n2. Click "Request Refund"\n3. Select the reason and provide details\n4. Submit the request\n\nOr contact support at refunds@internhub.com with:\n• Transaction ID\n• Date of transaction\n• Reason for refund request\n• Any supporting documentation',
    },
    {
      title: '8. Refund Processing Time',
      content:
        'Approved refunds are processed within:\n• UPI payments: 3-5 business days\n• Credit/debit cards: 5-7 business days\n• Net banking: 5-7 business days\n• Wallet balance: Instant\n\nRefunds are credited to the original payment method.',
    },
    {
      title: '9. Fraud Prevention',
      content:
        'We monitor for abuse of our refund policy. Repeated refund requests may result in:\n• Warning notices\n• Temporary account restrictions\n• Permanent account suspension\n• Legal action in severe cases',
    },
    {
      title: '10. Exceptions',
      content:
        'Refunds may be denied in cases of:\n• Violation of Terms of Service\n• Suspected fraudulent activity\n• Requests outside the stated timeframes\n• Insufficient evidence for disputes\n• Force majeure events',
    },
    {
      title: '11. Contact for Refund Issues',
      content:
        'If you have questions about refunds:\n\nEmail: refunds@internhub.com\nSupport: help.internhub.com/refunds\nPhone: +91 98765 43210 (Mon-Fri, 9AM-6PM IST)',
    },
  ];

  return (
    <div className="premium-shell min-h-screen">
      <section className="container-custom relative z-10 py-10 sm:py-14 lg:py-20">
        <div className="absolute inset-x-0 top-8 -z-10 hidden h-[420px] rounded-[48px] bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_36%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_34%),radial-gradient(circle_at_bottom,rgba(139,92,246,0.12),transparent_36%)] blur-3xl lg:block" />

        <div className="mx-auto max-w-5xl space-y-8">
          <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(225,221,214,0.28),_transparent_34%),linear-gradient(135deg,_rgba(52,74,134,0.96),_rgba(64,119,148,0.94)_60%,_rgba(75,73,69,0.92))] p-8 text-white shadow-[0_28px_80px_rgba(52,74,134,0.24)] md:p-10">
            <div className="inline-flex rounded-full border border-white/20 bg-card/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">
              Legal
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">Refund Policy</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
              Clear refund rules for assessments, mentoring, subscriptions, and project payments.
            </p>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-white/68">Last updated: {lastUpdated}</p>
          </Card>

          <Card className={surfaceClass}>
            <h2 className="text-xl font-semibold text-charcoal-950 dark:text-white">Quick Reference</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/55 dark:border-white/10">
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-500 dark:text-charcoal-400">Service</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-500 dark:text-charcoal-400">Cancellation Window</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-charcoal-500 dark:text-charcoal-400">Refund Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Assessments', 'Before starting', '100%'],
                    ['Mentor Sessions', 'More than 24 hours before', '100%'],
                    ['Mentor Sessions', 'Less than 24 hours before', '50%'],
                    ['Monthly Subscriptions', 'Anytime', 'No prorated refund'],
                    ['Yearly Subscriptions', 'First 30 days', '100%'],
                  ].map((row, index) => (
                    <tr key={row[0] + index} className="border-b border-white/45 last:border-b-0 dark:border-white/10">
                      {row.map((cell) => (
                        <td key={cell} className="px-3 py-4 text-sm text-charcoal-700 dark:text-charcoal-200">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-8">
            {sections.map((section) => (
              <Card
                key={section.title}
                id={section.title.toLowerCase().replace(/\s+/g, '-')}
                className={`${surfaceClass} scroll-mt-24`}
              >
                <h2 className={headingClass}>{section.title}</h2>

                {section.subsections ? (
                  <div className="mt-6 space-y-6">
                    {section.subsections.map((subsection) => (
                      <div key={subsection.title} className="rounded-[24px] border border-white/55 bg-card/55 p-5 dark:border-white/8 dark:bg-charcoal-900/35">
                        <h3 className={subheadingClass}>{subsection.title}</h3>
                        <p className={`mt-3 ${bodyClass}`}>{subsection.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`mt-5 ${bodyClass}`}>{section.content}</p>
                )}
              </Card>
            ))}
          </div>

          <Card className="overflow-hidden border-none bg-[radial-gradient(circle_at_top_left,_rgba(225,221,214,0.18),_transparent_28%),linear-gradient(135deg,_rgba(52,74,134,0.96),_rgba(64,119,148,0.94)_56%,_rgba(75,73,69,0.92))] p-8 text-white shadow-[0_24px_60px_rgba(52,74,134,0.22)] md:p-10">
            <h2 className="text-2xl font-semibold text-white">Need to Request a Refund?</h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">
              We&apos;re here to help. Start your refund request through your dashboard or contact support if you need guidance.
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/dashboard/settings/payments"
                className="inline-flex items-center justify-center rounded-2xl bg-card px-6 py-3 font-medium text-charcoal-950 transition hover:bg-card/92"
              >
                Go to Payments
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-card/10 px-6 py-3 font-medium text-white transition hover:bg-card/16"
              >
                Contact Support
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
