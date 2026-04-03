import { Metadata } from 'next';
import Link from 'next/link';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using InternHub',
};

const surfaceClass =
  'glass-card rounded-[32px] border border-white/55 bg-card/88 p-8 shadow-[0_28px_70px_-40px_rgba(52,74,134,0.28)] dark:border-white/10 dark:bg-charcoal-950/78 dark:shadow-[0_28px_80px_-46px_rgba(0,0,0,0.7)]';

const headingClass = 'text-2xl font-semibold tracking-tight text-charcoal-950 dark:text-white';
const subheadingClass = 'text-lg font-semibold text-charcoal-900 dark:text-charcoal-100';
const bodyClass = 'whitespace-pre-line text-base leading-8 text-charcoal-600 dark:text-charcoal-300';

export default function TermsPage() {
  const lastUpdated = 'January 1, 2024';

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        `By accessing or using InternHub's platform, website, and services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Services.`,
    },
    {
      title: '2. Description of Services',
      content:
        'InternHub provides an AI-powered platform that connects students with companies, mentors, and learning resources. Our Services include but are not limited to:\n• Skill assessments and verification\n• Project and job matching\n• Mentorship sessions\n• Learning resources and paths\n• Community features\n• Payment processing for services rendered',
    },
    {
      title: '3. User Accounts',
      content:
        'To use certain features of our Services, you must create an account. You agree to:\n• Provide accurate and complete information\n• Maintain the security of your account credentials\n• Promptly update your information if it changes\n• Accept responsibility for all activities under your account\n• Not share your account credentials with others\n• Not create multiple accounts for abusive purposes',
    },
    {
      title: '4. User Roles and Responsibilities',
      subsections: [
        {
          title: '4.1 Students',
          content:
            'Students agree to:\n• Complete assessments honestly\n• Deliver project work as agreed\n• Communicate professionally\n• Respect intellectual property rights\n• Not misuse platform features\n• Maintain academic integrity',
        },
        {
          title: '4.2 Companies',
          content:
            'Companies agree to:\n• Provide accurate project descriptions\n• Pay for completed work promptly\n• Treat freelancers professionally\n• Not exploit students\n• Respect confidentiality\n• Provide fair feedback',
        },
        {
          title: '4.3 Mentors',
          content:
            'Mentors agree to:\n• Provide quality guidance\n• Maintain professional conduct\n• Respect student privacy\n• Honor scheduled sessions\n• Not misuse mentor privileges',
        },
      ],
    },
    {
      title: '5. Fees and Payments',
      content:
        'InternHub charges fees for certain services:\n• Assessment fees are non-refundable once started\n• Project payments are held in escrow until milestones are approved\n• Mentor session fees are processed at time of booking\n• Platform fees are clearly displayed before transaction\n• Refunds are processed according to our Refund Policy\n• All payments are in Indian Rupees (INR)',
    },
    {
      title: '6. Intellectual Property',
      content:
        '6.1 Our IP: InternHub owns all rights to the platform, including software, design, and content.\n\n6.2 User Content: You retain ownership of content you post, but grant us license to display it.\n\n6.3 Project Work: Work created through projects belongs to the client upon full payment.',
    },
    {
      title: '7. Trust Score System',
      content:
        'The Trust Score is calculated based on various factors including:\n• Verified skills and assessments\n• Project completion history\n• User reviews and ratings\n• Platform activity\n• Verification status\n\nInternHub reserves the right to adjust Trust Scores based on user behavior and platform policies.',
    },
    {
      title: '8. Prohibited Conduct',
      content:
        "You agree not to:\n• Violate any laws or regulations\n• Infringe on others' rights\n• Post false or misleading information\n• Harass or abuse other users\n• Attempt to manipulate the platform\n• Use automated tools or bots\n• Engage in fraudulent activities\n• Share inappropriate content\n• Attempt to bypass security measures",
    },
    {
      title: '9. Dispute Resolution',
      content:
        '9.1 Informal Resolution: Before filing a claim, you agree to try resolving disputes informally by contacting support.\n\n9.2 Binding Arbitration: If informal resolution fails, disputes will be resolved through binding arbitration in Bengaluru, India.\n\n9.3 Class Action Waiver: You agree to resolve disputes on an individual basis, not as a class action.',
    },
    {
      title: '10. Limitation of Liability',
      content:
        'To the maximum extent permitted by law, InternHub shall not be liable for:\n• Indirect or consequential damages\n• Lost profits or opportunities\n• Service interruptions\n• User conduct on the platform\n• Third-party actions\n\nOur total liability shall not exceed the fees you paid in the past 12 months.',
    },
    {
      title: '11. Termination',
      content:
        'We may terminate or suspend your account for:\n• Violation of these Terms\n• Illegal or fraudulent activity\n• Extended inactivity\n• At your request\n\nYou may delete your account at any time through settings.',
    },
    {
      title: '12. Changes to Terms',
      content:
        "We may modify these Terms at any time. We'll notify you of significant changes via email or platform notice. Continued use after changes constitutes acceptance.",
    },
    {
      title: '13. Governing Law',
      content:
        'These Terms are governed by the laws of India. Any legal actions shall be brought in the courts of Bengaluru, Karnataka.',
    },
    {
      title: '14. Contact Information',
      content:
        'For questions about these Terms, contact us at:\nEmail: legal@internhub.com\nAddress: InternHub, Bengaluru, Karnataka, India',
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
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">Terms of Service</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
              The terms that govern how InternHub works for students, companies, mentors, and founders.
            </p>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-white/68">Last updated: {lastUpdated}</p>
          </Card>

          <Card className={surfaceClass}>
            <h2 className="text-xl font-semibold text-charcoal-950 dark:text-white">Quick Links</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <Link
                  key={section.title}
                  href={`#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="rounded-2xl border border-white/55 bg-card/55 px-4 py-3 text-sm font-medium text-primary-700 transition hover:border-primary-200 hover:text-info-700 dark:border-white/8 dark:bg-charcoal-900/35 dark:text-primary-300 dark:hover:border-primary-700/40 dark:hover:text-info-300"
                >
                  {section.title}
                </Link>
              ))}
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

          <Card className={`${surfaceClass} bg-[linear-gradient(180deg,rgba(224,231,255,0.52),rgba(255,255,255,0.94))] dark:bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(31,31,31,0.92))]`}>
            <p className="text-base leading-8 text-charcoal-700 dark:text-charcoal-200">
              By using InternHub, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
            </p>
            <p className="mt-4 text-sm text-charcoal-500 dark:text-charcoal-400">
              If you have any questions about these Terms, please{' '}
              <Link href="/contact" className="font-medium text-primary-700 hover:text-info-700 dark:text-primary-300 dark:hover:text-info-300">
                contact us
              </Link>
              .
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}
