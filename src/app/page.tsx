import { BadgeCheck, Briefcase, GraduationCap, Sparkles } from 'lucide-react';
import { MarketingPage } from '@/components/marketing/MarketingPage';

export default function HomePage() {
  return (
    <MarketingPage
      eyebrow="InternHub ecosystem"
      title="A modern talent platform where learning, hiring, and earning finally feel premium."
      description="InternHub brings verified talent, trusted mentorship, real company projects, and operator-grade hiring into one beautifully designed ecosystem. Every interaction is calmer, faster, and more credible."
      primaryCta={{ label: 'Create your profile', href: '/signup' }}
      secondaryCta={{ label: 'Explore pricing', href: '/pricing' }}
      heroPanelTitle="Built for high-trust decisions"
      heroPanelBody="From first profile impression to final hire, every surface is designed to create confidence. Better matching, better storytelling, better conversion."
      heroBullets={[
        'Verified skills, portfolios, and trust signals',
        'Hiring flows for companies, mentors, and founders',
        'Responsive premium experience across every screen',
      ]}
      stats={[
        { value: '500+', label: 'active hiring teams' },
        { value: '50k+', label: 'ambitious candidates' },
        { value: '92%', label: 'high-match shortlist accuracy' },
      ]}
      featuresTitle="One platform, four growth engines"
      features={[
        {
          title: 'Verified talent profiles',
          description: 'Showcase proof of work, trust signals, and richer context that makes profiles feel credible at first glance.',
          icon: BadgeCheck,
          accent: 'primary',
        },
        {
          title: 'Company-ready hiring',
          description: 'Move from search to shortlist with polished role pages, stronger filtering, and premium candidate presentation.',
          icon: Briefcase,
          accent: 'secondary',
        },
        {
          title: 'Learning to earning',
          description: 'Help talent grow through assessments, mentorship, and project experiences that compound into better opportunities.',
          icon: GraduationCap,
          accent: 'info',
        },
        {
          title: 'Founder momentum',
          description: 'Find aligned collaborators, structure early teams, and present startup opportunities with more clarity and polish.',
          icon: Sparkles,
          accent: 'charcoal',
        },
      ]}
      stepsTitle="A polished journey from discovery to outcome"
      steps={[
        {
          title: 'Create a signal-rich presence',
          description: 'Profiles, projects, and opportunities are framed with better hierarchy, stronger content blocks, and intentional trust cues.',
        },
        {
          title: 'Match with the right people faster',
          description: 'Use premium discovery flows to connect talent, mentors, companies, and founders without the usual noise.',
        },
        {
          title: 'Convert with confidence',
          description: 'Applicants, buyers, and partners get a calmer, more premium interface that supports better decision-making.',
        },
      ]}
      plansTitle="Plans that scale with ambition"
      plans={[
        {
          name: 'Starter',
          price: 'Free',
          description: 'A polished entry point for exploring the platform and building momentum.',
          items: ['Profile setup', 'Core discovery access', 'Foundational applications'],
          href: '/signup',
        },
        {
          name: 'Pro',
          price: 'Rs 499/mo',
          description: 'For people and teams who need more visibility, better tools, and faster outcomes.',
          items: ['Priority visibility', 'Advanced matching', 'Enhanced trust signals'],
          href: '/pricing',
          featured: true,
        },
        {
          name: 'Scale',
          price: 'Custom',
          description: 'For businesses and operators running multi-role hiring or premium programs.',
          items: ['Team workflows', 'Premium support', 'High-volume hiring capabilities'],
          href: '/contact',
        },
      ]}
      testimonialTitle="People remember how premium products make decisions easier"
      testimonials={[
        {
          name: 'Ananya Rao',
          role: 'Student turned product engineer',
          quote: 'InternHub feels like a serious career platform now. My profile finally looks as polished as the work I have done.',
        },
        {
          name: 'Rahul Mehta',
          role: 'Founder, QuickCart',
          quote: 'The new experience gives our company page a lot more credibility. Candidates trust the opportunity much faster.',
        },
        {
          name: 'Priya Sharma',
          role: 'Mentor, Frontend Lead',
          quote: 'The platform presentation now matches the premium nature of paid mentorship. It feels built for real professionals.',
        },
      ]}
    />
  );
}
