import { Layers3, Rocket, ShieldCheck, UsersRound } from 'lucide-react';
import { MarketingPage } from '@/components/marketing/MarketingPage';

export default function FoundersPage() {
  return (
    <MarketingPage
      eyebrow="For founders"
      title="Build your startup with a premium operating layer for co-founders, early hires, and momentum."
      description="InternHub gives founders a cleaner way to present their vision, discover aligned collaborators, and attract early talent through a more credible and design-forward product experience."
      primaryCta={{ label: 'Launch your founder profile', href: '/signup?role=founder' }}
      secondaryCta={{ label: 'Talk to our team', href: '/contact' }}
      heroPanelTitle="For startup teams that need credibility early"
      heroPanelBody="Early-stage founders often need trust before they have scale. This experience helps your idea, team, and opportunity feel much more real."
      heroBullets={[
        'Better founder and startup storytelling',
        'Co-founder and team discovery with stronger signal',
        'Premium presentation for early-stage opportunities',
      ]}
      stats={[
        { value: '94%', label: 'top co-founder match confidence' },
        { value: '3x', label: 'better response quality' },
        { value: '1,000+', label: 'startup builders on platform' },
      ]}
      featuresTitle="Everything early teams need to build faster"
      features={[
        {
          title: 'Stronger startup presence',
          description: 'Turn an early-stage idea into a polished opportunity page that communicates seriousness and ambition.',
          icon: Rocket,
          accent: 'primary',
        },
        {
          title: 'Aligned collaborator discovery',
          description: 'Surface co-founders and early hires with better context around skills, incentives, and operating style.',
          icon: UsersRound,
          accent: 'secondary',
        },
        {
          title: 'Clearer team formation',
          description: 'Show the gaps in your startup and position each opportunity with better clarity and visual structure.',
          icon: Layers3,
          accent: 'info',
        },
        {
          title: 'Founder-grade confidence',
          description: 'Use design, hierarchy, and credibility signals to help great people say yes earlier.',
          icon: ShieldCheck,
          accent: 'charcoal',
        },
      ]}
      stepsTitle="A cleaner founder workflow"
      steps={[
        {
          title: 'Frame the opportunity',
          description: 'Explain the product, stage, role, and upside with more polish than a generic startup job board can offer.',
        },
        {
          title: 'Find aligned operators',
          description: 'Review co-founders and early teammates through a more premium, signal-rich discovery flow.',
        },
        {
          title: 'Build momentum publicly',
          description: 'Use a design-forward presence to attract the kind of builders who want to join something ambitious.',
        },
      ]}
      testimonialTitle="Founders need trust before scale"
      testimonials={[
        {
          name: 'Rohan Mehta',
          role: 'Founder, QuickCart',
          quote: 'The redesign makes our startup feel much more investable and serious, even at an early stage.',
        },
        {
          name: 'Priya Sharma',
          role: 'Co-founder, FinWise',
          quote: 'We’ve seen stronger responses simply because the platform now frames our vision with much more credibility.',
        },
        {
          name: 'Ankit Singh',
          role: 'Technical founder',
          quote: 'The new founder flow is calm, premium, and much better at helping the right collaborators understand what we’re building.',
        },
      ]}
    />
  );
}
