import { BarChart3, Briefcase, Clock3, ShieldCheck } from 'lucide-react';
import { MarketingPage } from '@/components/marketing/MarketingPage';

export default function CompaniesPage() {
  return (
    <MarketingPage
      eyebrow="For companies"
      title="Hire with a premium brand presence and higher trust from the first click."
      description="InternHub helps companies present opportunities beautifully, surface stronger candidates quickly, and run hiring with more confidence across projects, internships, and full-time roles."
      primaryCta={{ label: 'Start hiring', href: '/signup?role=company' }}
      secondaryCta={{ label: 'View pricing', href: '/pricing' }}
      heroPanelTitle="Designed for modern hiring teams"
      heroPanelBody="Showcase your brand, clarify the role, filter confidently, and move candidates through a refined application experience."
      heroBullets={[
        'Premium company presentation',
        'Better shortlists with trust signals',
        'Faster project and role fulfillment',
      ]}
      stats={[
        { value: '3x', label: 'faster qualified shortlists' },
        { value: '70%', label: 'less screening overhead' },
        { value: '500+', label: 'teams already hiring' },
      ]}
      featuresTitle="Everything needed for faster, cleaner hiring"
      features={[
        {
          title: 'Sharper role storytelling',
          description: 'Present jobs and projects with stronger visual hierarchy, brand presence, and high-conviction calls to action.',
          icon: Briefcase,
          accent: 'primary',
        },
        {
          title: 'Trust-led filtering',
          description: 'Use richer profiles and credibility indicators to reduce noise before your team invests interview time.',
          icon: ShieldCheck,
          accent: 'secondary',
        },
        {
          title: 'Operational clarity',
          description: 'Track role performance, conversion health, and candidate momentum in polished dashboards built for action.',
          icon: BarChart3,
          accent: 'info',
        },
        {
          title: 'Time back for your team',
          description: 'Spend less time compensating for poor signal and more time evaluating the people who actually fit.',
          icon: Clock3,
          accent: 'charcoal',
        },
      ]}
      stepsTitle="From role brief to accepted offer"
      steps={[
        {
          title: 'Launch a premium opportunity page',
          description: 'Tell a clearer story about the role, your company, and the experience candidates can expect.',
        },
        {
          title: 'Review high-signal matches',
          description: 'Prioritize candidates with stronger proof, better positioning, and more reliable evaluation context.',
        },
        {
          title: 'Convert faster',
          description: 'Give shortlisted talent a hiring flow that feels intentional, modern, and worth responding to.',
        },
      ]}
      plansTitle="Hiring plans"
      plans={[
        {
          name: 'Startup',
          price: '₹1,999/mo',
          description: 'For lean teams hiring intermittently but wanting a premium brand presence.',
          items: ['Project and job postings', 'Core AI matching', 'Application management'],
          href: '/pricing',
        },
        {
          name: 'Business',
          price: '₹4,999/mo',
          description: 'For growing companies running multiple roles and wanting deeper visibility.',
          items: ['Advanced filtering', 'Team workflows', 'Hiring analytics'],
          href: '/pricing',
          featured: true,
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          description: 'For larger organizations needing premium support and scale-ready infrastructure.',
          items: ['Dedicated support', 'Custom workflows', 'High-volume access'],
          href: '/contact',
        },
      ]}
      testimonialTitle="Teams want less noise and more confidence"
      testimonials={[
        {
          name: 'Rohan Mehta',
          role: 'Founder, QuickCart',
          quote: 'Our company page finally feels premium. Candidate quality improved because the opportunity itself now feels more credible.',
        },
        {
          name: 'Sana Kapoor',
          role: 'Talent Lead, Finstack',
          quote: 'The experience gives our team a cleaner shortlist and a better conversion rate from application to interview.',
        },
        {
          name: 'Amit Verma',
          role: 'Head of Product, LoopOS',
          quote: 'This feels far more polished than a generic jobs board. It makes our employer brand work harder for us.',
        },
      ]}
    />
  );
}
