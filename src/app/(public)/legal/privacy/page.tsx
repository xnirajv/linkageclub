import { Metadata } from 'next';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How InternHub collects, uses, and protects your data',
};

const surfaceClass =
  'glass-card rounded-[32px] border border-white/55 bg-card/88 p-8 shadow-[0_28px_70px_-40px_rgba(52,74,134,0.28)] dark:border-white/10 dark:bg-charcoal-950/78 dark:shadow-[0_28px_80px_-46px_rgba(0,0,0,0.7)]';

const headingClass = 'text-2xl font-semibold tracking-tight text-charcoal-950 dark:text-white';
const subheadingClass = 'text-lg font-semibold text-charcoal-900 dark:text-charcoal-100';
const bodyClass = 'whitespace-pre-line text-base leading-8 text-charcoal-600 dark:text-charcoal-300';

export default function PrivacyPage() {
  const lastUpdated = 'January 1, 2024';

  const sections = [
    {
      title: '1. Introduction',
      content:
        'InternHub ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and services (collectively, the "Services").',
    },
    {
      title: '2. Information We Collect',
      subsections: [
        {
          title: '2.1 Personal Information',
          content:
            'We may collect personal information that you voluntarily provide, including:\n• Name, email address, phone number\n• Profile information (bio, skills, experience)\n• Educational background\n• Professional experience\n• Payment information (processed securely by Razorpay)\n• Government ID for verification\n• Resume and portfolio materials',
        },
        {
          title: '2.2 Usage Data',
          content:
            'We automatically collect information about your use of our Services:\n• IP address and device information\n• Browser type and settings\n• Pages visited and actions taken\n• Time and duration of visits\n• Referring websites\n• Search queries',
        },
        {
          title: '2.3 Communication Data',
          content:
            'We collect information from your communications:\n• Messages sent through our platform\n• Email communications\n• Support tickets\n• Community posts and comments\n• Reviews and feedback',
        },
      ],
    },
    {
      title: '3. How We Use Your Information',
      content:
        'We use your information to:\n• Provide and maintain our Services\n• Process transactions and payments\n• Verify your identity and skills\n• Match you with relevant opportunities\n• Calculate Trust Scores\n• Communicate with you about our Services\n• Improve and personalize your experience\n• Detect and prevent fraud\n• Comply with legal obligations\n• Send important notices and updates',
    },
    {
      title: '4. Trust Score and AI Processing',
      content:
        'Your information is used to calculate your Trust Score through our AI algorithms. This includes analyzing:\n• Skill assessments and badges\n• Project completion history\n• Reviews and ratings\n• Platform activity\n• Verification status\n\nThe Trust Score helps match you with suitable opportunities and builds trust within our community.',
    },
    {
      title: '5. Information Sharing',
      content:
        'We may share your information with:\n\n5.1 Other Users:\n• Students and companies you connect with\n• Mentors you book sessions with\n• Your public profile information\n\n5.2 Service Providers:\n• Payment processors (Razorpay)\n• Cloud storage providers\n• Analytics services\n• Email communication services\n\n5.3 Legal Requirements:\n• To comply with legal obligations\n• To respond to lawful requests\n• To protect our rights and safety\n• To prevent fraud or illegal activities',
    },
    {
      title: '6. Data Security',
      content:
        'We implement appropriate technical and organizational measures to protect your information, including:\n• Encryption of data in transit and at rest\n• Regular security assessments\n• Access controls and authentication\n• Secure data centers\n• Employee training on data protection\n\nHowever, no method of transmission over the Internet is 100% secure.',
    },
    {
      title: '7. Data Retention',
      content:
        'We retain your information for as long as your account is active or as needed to provide Services. We may retain certain information as required by law or for legitimate business purposes. You may request deletion of your account and associated data at any time.',
    },
    {
      title: '8. Your Rights and Choices',
      content:
        'You have certain rights regarding your personal information:\n• Access and receive a copy of your data\n• Correct inaccurate data\n• Delete your account and data\n• Object to or restrict processing\n• Data portability\n• Withdraw consent\n\nTo exercise these rights, contact us at privacy@internhub.com.',
    },
    {
      title: '9. Cookies and Tracking',
      content:
        'We use cookies and similar technologies to:\n• Keep you logged in\n• Remember your preferences\n• Understand how you use our Services\n• Improve your experience\n• Provide personalized content\n\nYou can control cookies through your browser settings.',
    },
    {
      title: "10. Children's Privacy",
      content:
        'Our Services are not intended for individuals under the age of 18. We do not knowingly collect information from children. If you believe a child has provided us with information, please contact us.',
    },
    {
      title: '11. International Data Transfers',
      content:
        'Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.',
    },
    {
      title: '12. Third-Party Links',
      content:
        'Our Services may contain links to third-party websites. We are not responsible for their privacy practices. We encourage you to review their privacy policies.',
    },
    {
      title: '13. Changes to This Policy',
      content:
        'We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through our platform. Your continued use after changes constitutes acceptance.',
    },
    {
      title: '14. Contact Us',
      content:
        'If you have questions about this Privacy Policy, contact us at:\n\nEmail: privacy@internhub.com\nAddress: InternHub, Bengaluru, Karnataka, India\nPhone: +91 98765 43210',
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
            <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">Privacy Policy</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">
              A clear explanation of what we collect, how we use it, and how we protect your information.
            </p>
            <p className="mt-4 text-sm font-medium uppercase tracking-[0.18em] text-white/68">Last updated: {lastUpdated}</p>
          </Card>

          <Card className={`${surfaceClass} bg-[linear-gradient(180deg,rgba(224,231,255,0.48),rgba(255,255,255,0.92))] dark:bg-[linear-gradient(180deg,rgba(99,102,241,0.12),rgba(31,31,31,0.92))]`}>
            <h2 className="text-xl font-semibold text-charcoal-950 dark:text-white">Our Commitment</h2>
            <p className="mt-4 text-base leading-8 text-charcoal-700 dark:text-charcoal-200">
              At InternHub, we take your privacy seriously. We are committed to being transparent about how we collect and use your data, and this policy explains everything in plain language.
            </p>
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

          <Card className={`${surfaceClass} bg-[linear-gradient(180deg,rgba(243,232,255,0.66),rgba(255,255,255,0.94))] dark:bg-[linear-gradient(180deg,rgba(139,92,246,0.12),rgba(31,31,31,0.92))]`}>
            <h2 className="text-xl font-semibold text-charcoal-950 dark:text-white">Questions About Privacy?</h2>
            <p className="mt-4 text-base leading-8 text-charcoal-700 dark:text-charcoal-200">
              Our Data Protection Officer is here to help with any privacy concerns.
            </p>
            <div className="mt-5 space-y-3 text-sm text-charcoal-700 dark:text-charcoal-200">
              <p>
                <span className="font-semibold text-charcoal-950 dark:text-white">Email:</span>{' '}
                <a href="mailto:privacy@internhub.com" className="text-primary-700 hover:text-info-700 dark:text-primary-300 dark:hover:text-info-300">
                  privacy@internhub.com
                </a>
              </p>
              <p>
                <span className="font-semibold text-charcoal-950 dark:text-white">Phone:</span>{' '}
                <a href="tel:+919876543210" className="text-primary-700 hover:text-info-700 dark:text-primary-300 dark:hover:text-info-300">
                  +91 98765 43210
                </a>
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
