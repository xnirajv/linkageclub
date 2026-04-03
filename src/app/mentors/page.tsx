import { CalendarClock, GraduationCap, Medal, MessageSquareMore, Sparkles, Wallet } from 'lucide-react';
import { MarketingPage } from '@/components/marketing/MarketingPage';

export default function MentorsPage() {
  return (
    <MarketingPage
      eyebrow="For mentors"
      title="Turn expertise into a premium mentorship business with a platform that feels worthy of your reputation."
      description="InternHub helps experienced operators package their knowledge, earn through mentorship, and build authority through a refined public presence, clear booking flows, and strong trust signals."
      primaryCta={{ label: 'Become a mentor', href: '/signup?role=mentor' }}
      secondaryCta={{ label: 'See how pricing works', href: '/pricing' }}
      heroPanelTitle="Mentorship that feels elevated"
      heroPanelBody="Offer sessions, publish resources, and grow your professional brand with a calmer, more premium student experience."
      heroBullets={[
        'Polished public mentor profile',
        'High-trust booking and session flow',
        'Built-in credibility through outcomes and reviews',
      ]}
      stats={[
        { value: '₹1L+', label: 'monthly top mentor earnings' },
        { value: '4.9/5', label: 'average premium session rating' },
        { value: '10k+', label: 'learners seeking guidance' },
      ]}
      featuresTitle="Designed for serious experts, not side-project chaos"
      features={[
        {
          title: 'Premium mentor profiles',
          description: 'Showcase expertise, specialties, outcomes, and proof in a layout built to inspire confidence.',
          icon: Medal,
          accent: 'primary',
        },
        {
          title: 'Structured availability',
          description: 'Let students book through a cleaner interface that respects your time and feels premium on every device.',
          icon: CalendarClock,
          accent: 'secondary',
        },
        {
          title: 'Reputation that compounds',
          description: 'Reviews, credibility signals, and public positioning work together to help you charge appropriately.',
          icon: Sparkles,
          accent: 'info',
        },
        {
          title: 'Monetization clarity',
          description: 'Connect your expertise to outcomes, paid sessions, and content in one polished system.',
          icon: Wallet,
          accent: 'charcoal',
        },
      ]}
      stepsTitle="A premium mentorship loop"
      steps={[
        {
          title: 'Set your positioning',
          description: 'Define your niche, strengths, and session offers in a profile that feels intentional rather than generic.',
        },
        {
          title: 'Attract the right learners',
          description: 'Use stronger visual hierarchy and clear session framing to attract students who value expert time.',
        },
        {
          title: 'Build long-term authority',
          description: 'Turn each strong session into more trust, more reach, and more premium demand for your expertise.',
        },
      ]}
      testimonialTitle="Mentors deserve a premium surface too"
      testimonials={[
        {
          name: 'Vikram Singh',
          role: 'Senior engineer and mentor',
          quote: 'The new mentor presentation feels aligned with the level of professionalism I bring to sessions.',
        },
        {
          name: 'Priya Patel',
          role: 'Frontend lead, mentor',
          quote: 'Booking, profile presentation, and trust cues finally feel polished enough to support paid mentorship seriously.',
        },
        {
          name: 'Rahul Sharma',
          role: 'Full-time mentor',
          quote: 'This redesign makes it much easier to position mentorship as a premium service instead of an informal side chat.',
        },
      ]}
    />
  );
}
