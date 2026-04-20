'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  MapPin,
  Mail,
  Calendar,
  Award,
  Briefcase,
  Star,
  Github,
  Linkedin,
  Globe,
  Code,
  Sparkles,
  CheckCircle,
  Clock,
  User,
  ExternalLink,
  GraduationCap,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/format';

type ProfileSkill = {
  name: string;
  level: 'expert' | 'advanced' | 'intermediate' | 'beginner';
  verified?: boolean;
};

type ProfileBadge = {
  name: string;
  description?: string;
};

type Education = {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  grade: string;
};

type Experience = {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
};

interface ProfileClientWrapperProps {
  user: any;
  mentorData: any;
}

export default function ProfileClientWrapper({ user, mentorData }: ProfileClientWrapperProps) {
  const profile = user;
  const skills = profile?.skills || [];
  const badges = profile?.badges || [];
  
  const verifiedSkillsCount = (skills as ProfileSkill[])?.filter((s) => s.verified).length || 0;
  const totalSkillsCount = skills?.length || 0;

  const getDisplayText = () => {
    if ((profile as any)?.headline) return (profile as any).headline;
    if (profile?.experience && profile.experience.length > 0) {
      const currentExp = profile.experience.find((exp: any) => exp.current);
      const latestExp = currentExp || profile.experience[0];
      if (latestExp.title && latestExp.company) return `${latestExp.title} @ ${latestExp.company}`;
      if (latestExp.title) return latestExp.title;
    }
    if (profile?.education && profile.education.length > 0) {
      const highestEdu = profile.education[0];
      if (highestEdu.degree && highestEdu.institution) return `${highestEdu.degree} from ${highestEdu.institution}`;
      if (highestEdu.degree) return highestEdu.degree;
      if (highestEdu.institution) return `Studying at ${highestEdu.institution}`;
    }
    return profile?.role === 'student' ? 'Student' : profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-charcoal-950 to-primary-700 dark:from-white dark:to-primary-300 bg-clip-text text-transparent">
          {profile?.name || 'User Profile'}
        </h1>
        <p className="text-charcoal-500 dark:text-charcoal-400 mt-1">
          View profile
        </p>
      </div>

      {/* Profile Header Card */}
      <Card className="p-6 md:p-8 overflow-hidden border-0 shadow-lg bg-[linear-gradient(145deg,rgba(255,255,255,0.94)_0%,rgba(241,236,228,0.72)_100%)] dark:bg-[linear-gradient(145deg,rgba(16,15,15,0.96)_0%,rgba(31,31,31,0.92)_100%)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full blur-md opacity-60" />
            <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white dark:border-charcoal-800 shadow-xl relative">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-2xl font-semibold">
                {profile?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-2xl md:text-3xl font-bold text-charcoal-950 dark:text-white">
                {profile?.name || 'User'}
              </h2>
              {profile?.role && (
                <Badge variant="skill" className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </Badge>
              )}
            </div>

            <p className="text-charcoal-600 dark:text-charcoal-400 mb-4 max-w-2xl leading-relaxed">
              {getDisplayText()}
            </p>

            <div className="flex flex-wrap gap-4 text-sm text-charcoal-500 dark:text-charcoal-400">
              {profile?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </span>
              )}
              {profile?.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                Joined {formatDate(profile?.createdAt || new Date())}
              </span>
            </div>
          </div>

          {/* Trust Score */}
          <div className="text-center bg-charcoal-100/50 dark:bg-charcoal-800/50 rounded-2xl p-4 min-w-[140px] shadow-inner">
            <div className="relative w-24 h-24 mx-auto">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="none" className="text-charcoal-200 dark:text-charcoal-300" />
                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray={2 * Math.PI * 44} strokeDashoffset={2 * Math.PI * 44 * (1 - (profile?.trustScore || 0) / 100)} className="text-primary-500 transition-all duration-1000 ease-out" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-charcoal-950 dark:text-white">{profile?.trustScore || 0}%</span>
                <span className="text-[10px] text-charcoal-500 mt-0.5">Trust Score</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Profile Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-charcoal-100 dark:bg-charcoal-800 p-1 rounded-xl w-full sm:w-auto">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-card dark:data-[state=active]:bg-charcoal-900">Overview</TabsTrigger>
          <TabsTrigger value="skills" className="rounded-lg data-[state=active]:bg-card dark:data-[state=active]:bg-charcoal-900">Skills & Badges</TabsTrigger>
          <TabsTrigger value="education" className="rounded-lg data-[state=active]:bg-card dark:data-[state=active]:bg-charcoal-900">Education</TabsTrigger>
          <TabsTrigger value="experience" className="rounded-lg data-[state=active]:bg-card dark:data-[state=active]:bg-charcoal-900">Experience</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <Card className="p-6 border-0 shadow-md">
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-primary-500" />
                  About
                </h3>
                <p className="text-charcoal-700 dark:text-charcoal-300 whitespace-pre-line leading-relaxed">
                  {profile?.bio || 'No information provided.'}
                </p>
              </Card>

              {/* Social Links */}
              {profile?.socialLinks && Object.values(profile.socialLinks).some(Boolean) && (
                <Card className="p-6 border-0 shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary-500" />
                    Connect With Me
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {profile.socialLinks.linkedin && (
                      <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 transition-all duration-200 group">
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.github && (
                      <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal-100 dark:bg-charcoal-800 text-charcoal-700 dark:text-charcoal-300 hover:bg-charcoal-200 transition-all duration-200 group">
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </a>
                    )}
                    {profile.socialLinks.portfolio && (
                      <a href={profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 transition-all duration-200 group">
                        <Globe className="h-4 w-4" />
                        <span>Portfolio</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100" />
                      </a>
                    )}
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Stats */}
            <div className="space-y-6">
              <Card className="p-6 border-0 shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary-500" />
                  Statistics
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Briefcase, label: 'Projects Completed', value: profile?.stats?.projectsCompleted || 0, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30' },
                    { icon: Star, label: 'Average Rating', value: profile?.stats?.averageRating?.toFixed(1) || '0.0', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950/30' },
                    { icon: Award, label: 'Badges Earned', value: badges?.length || 0, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
                    { icon: Code, label: 'Skills Verified', value: `${verifiedSkillsCount}/${totalSkillsCount}`, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30' },
                  ].map((stat, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${stat.bg}`}>
                      <span className="text-charcoal-600 dark:text-charcoal-400 flex items-center gap-2">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        {stat.label}
                      </span>
                      <span className="font-semibold text-lg text-charcoal-950 dark:text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Skills & Badges Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-0 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary-500" />
                  Skills
                </h3>
                {totalSkillsCount > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {verifiedSkillsCount}/{totalSkillsCount} Verified
                  </Badge>
                )}
              </div>
              {skills && skills.length > 0 ? (
                <div className="space-y-3">
                  {(skills as ProfileSkill[]).map((skill, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-charcoal-100/50 dark:bg-charcoal-800/50">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal-950 dark:text-white">{skill.name}</span>
                        <Badge variant="skill" size="sm" className="capitalize">
                          {skill.level}
                        </Badge>
                      </div>
                      {skill.verified ? (
                        <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Code className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
                  <p className="text-charcoal-500">No skills added yet</p>
                </div>
              )}
            </Card>

            <Card className="p-6 border-0 shadow-md">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary-500" />
                Badges
              </h3>
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {(badges as ProfileBadge[]).map((badge, index: number) => (
                    <div key={index} className="text-center p-4 rounded-xl border border-charcoal-100 dark:border-charcoal-700 hover:shadow-md transition-all duration-200">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                        <Award className="h-7 w-7 text-yellow-600 dark:text-yellow-500" />
                      </div>
                      <p className="font-medium text-sm text-charcoal-950 dark:text-white">{badge.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Award className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
                  <p className="text-charcoal-500">No badges earned yet</p>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education">
          <Card className="p-6 border-0 shadow-md">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary-500" />
              Education
            </h3>
            {profile?.education && profile.education.length > 0 ? (
              <div className="space-y-4">
                {(profile.education as Education[]).map((edu, index) => (
                  <div key={index} className="p-4 rounded-xl border border-charcoal-100 dark:border-charcoal-700 bg-charcoal-100/40 dark:bg-charcoal-800/30">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <h4 className="font-semibold text-charcoal-950 dark:text-white text-lg">
                        {edu.degree || 'Degree'} {edu.field && `in ${edu.field}`}
                      </h4>
                      {edu.grade && (
                        <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">
                          Grade: {edu.grade}%
                        </Badge>
                      )}
                    </div>
                    <p className="text-charcoal-700 dark:text-charcoal-300 font-medium">{edu.institution || 'Institution Name'}</p>
                    {(edu.startYear || edu.endYear) && (
                      <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-1">
                        {edu.startYear}{edu.startYear && edu.endYear && ' — '}{edu.endYear}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
                <p className="text-charcoal-500">No education added yet</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience">
          <Card className="p-6 border-0 shadow-md">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-primary-500" />
              Work Experience
            </h3>
            {profile?.experience && profile.experience.length > 0 ? (
              <div className="space-y-4">
                {(profile.experience as Experience[]).map((exp, index) => (
                  <div key={index} className="p-4 rounded-xl border border-charcoal-100 dark:border-charcoal-700 bg-charcoal-100/40 dark:bg-charcoal-800/30">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <h4 className="font-semibold text-charcoal-950 dark:text-white text-lg">
                        {exp.title || 'Position'} {exp.company && `@ ${exp.company}`}
                      </h4>
                      {exp.current && <Badge variant="success" className="gap-1"><Clock className="h-3 w-3" /> Current</Badge>}
                    </div>
                    {exp.location && <p className="text-sm text-charcoal-600 dark:text-charcoal-400 flex items-center gap-1 mb-2"><MapPin className="h-3 w-3" /> {exp.location}</p>}
                    {(exp.startDate || exp.endDate) && (
                      <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mb-2">
                        {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                        {exp.startDate && (exp.endDate || exp.current) && ' — '}
                        {exp.current ? 'Present' : exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </p>
                    )}
                    {exp.description && <p className="text-sm text-charcoal-600 dark:text-charcoal-400 mt-2 leading-relaxed">{exp.description}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
                <p className="text-charcoal-500">No work experience added yet</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Button - Only CTA */}
      <div className="text-center">
        <Button className="gap-2 bg-primary-600 hover:bg-primary-700 px-8 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-200">
          <MessageCircle className="h-4 w-4" />
          Send Message
        </Button>
      </div>
    </div>
  );
}