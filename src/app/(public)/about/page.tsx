import { Metadata } from 'next';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Target, Award, Heart, Globe, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about InternHub - India\'s first AI-powered tech talent ecosystem',
};

export default function AboutPage() {
  const stats = [
    { label: 'Students', value: '10,000+' },
    { label: 'Companies', value: '500+' },
    { label: 'Total Earnings', value: '₹2.5Cr+' },
    { label: 'Success Rate', value: '94%' },
  ];

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We exist to bridge the gap between learning and earning for every tech student in India.',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'We believe in the power of community to learn, grow, and succeed together.',
    },
    {
      icon: Award,
      title: 'Quality Assured',
      description: 'Every skill is verified, every project is vetted, every connection matters.',
    },
    {
      icon: Heart,
      title: 'Student Success',
      description: 'Your success is our success. We measure our impact by your achievements.',
    },
    {
      icon: Globe,
      title: 'Pan-India Access',
      description: 'Breaking geographical barriers - quality opportunities for every Indian student.',
    },
    {
      icon: Zap,
      title: 'AI-Powered',
      description: 'Leveraging cutting-edge AI to make perfect matches between talent and opportunities.',
    },
  ];

  const team = [
    {
      name: 'Rahul Sharma',
      role: 'Co-Founder & CEO',
      image: '/images/team/rahul.jpg',
      bio: 'Ex-Google, IIT Delhi alumnus with 10+ years in edtech',
    },
    {
      name: 'Priya Patel',
      role: 'Co-Founder & CTO',
      image: '/images/team/priya.jpg',
      bio: 'Ex-Amazon, BITS Pilani, AI/ML expert',
    },
    {
      name: 'Amit Kumar',
      role: 'Head of Partnerships',
      image: '/images/team/amit.jpg',
      bio: 'Building relationships with 500+ companies',
    },
    {
      name: 'Neha Singh',
      role: 'Head of Student Success',
      image: '/images/team/neha.jpg',
      bio: 'Passionate about mentoring and student growth',
    },
  ];

  return (
    <div className="premium-shell flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,221,214,0.22),transparent_28%),linear-gradient(135deg,rgba(52,74,134,0.96),rgba(64,119,148,0.94)_56%,rgba(75,73,69,0.92))]" />
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Building India&apos;s Tech Talent Ecosystem
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            We&apos;re on a mission to create India&apos;s largest AI-powered platform where 
            students learn, get verified, work on real projects, and get hired.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/signup">Join Our Mission</Link>
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent dark:from-charcoal-950" />
      </section>

      {/* Stats Section */}
      <section className="bg-card/70 py-16 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-charcoal-600 dark:text-charcoal-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="bg-charcoal-100/50 py-16 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="mb-6 text-3xl font-bold text-charcoal-950 dark:text-white">Our Story</h2>
              <p className="mb-4 text-charcoal-600 dark:text-charcoal-300">
                InternHub was born from a simple observation: millions of talented 
                Indian students struggle to find quality internships and jobs, while 
                companies struggle to find verified talent.
              </p>
              <p className="mb-4 text-charcoal-600 dark:text-charcoal-300">
                In 2022, our founders - themselves once students searching for 
                opportunities - decided to build a solution. They combined their 
                tech expertise with AI to create a platform that doesn&apos;t just 
                connect students with opportunities, but verifies skills, provides 
                learning paths, and ensures perfect matches.
              </p>
              <p className="text-charcoal-600 dark:text-charcoal-300">
                Today, we&apos;ve helped over 10,000 students start their careers and 
                partnered with 500+ companies to find their dream team members. 
                But we&apos;re just getting started.
              </p>
            </div>
            <div className="flex-1">
              <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/about/team.jpg"
                  alt="InternHub Team"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-card/70 py-16 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-charcoal-950 dark:text-white">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-charcoal-950/72">
                  <div className="mb-4 w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-charcoal-950 dark:text-white">{value.title}</h3>
                  <p className="text-charcoal-600 dark:text-charcoal-300">{value.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-charcoal-100/50 py-16 dark:bg-transparent">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold text-charcoal-950 dark:text-white">Meet Our Team</h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-charcoal-600 dark:text-charcoal-300">
            Passionate individuals working tirelessly to transform India&apos;s tech talent landscape
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-lg dark:bg-charcoal-950/72">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 animate-pulse" />
                  <div className="absolute inset-1 bg-card rounded-full overflow-hidden">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-charcoal-950 dark:text-white">{member.name}</h3>
                <p className="text-primary-600 text-sm mb-2">{member.role}</p>
                <p className="text-sm text-charcoal-600 dark:text-charcoal-300">{member.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-16 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,221,214,0.18),transparent_30%),linear-gradient(135deg,rgba(52,74,134,0.96),rgba(64,119,148,0.94)_56%,rgba(75,73,69,0.92))]" />
        <div className="container relative mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students who have already transformed their careers with InternHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup?role=student">Join as Student</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/25 bg-card/10 text-white hover:bg-card hover:text-charcoal-950">
              <Link href="/signup?role=company">Hire Talent</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
