'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { 
  ArrowLeft, 
  Upload, 
  Save, 
  Plus, 
  X, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Github,
  Linkedin,
  Globe
} from 'lucide-react';
import Link from 'next/link';

interface Education {
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  grade: string;
}

interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export default function EditStudentProfilePage() {
  const router = useRouter();
  const { profile, updateProfile, uploadAvatar, addSkill, removeSkill } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [educations, setEducations] = useState<Education[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    skills: true,
    education: true,
    experience: true,
    career: true,
    social: true,
  });
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    phone: profile?.phone || '',
    linkedin: profile?.socialLinks?.linkedin || '',
    github: profile?.socialLinks?.github || '',
    portfolio: profile?.socialLinks?.portfolio || '',
    expectedCTC: profile?.expectedCTC || '',
    availability: profile?.availability || 'immediate',
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await uploadAvatar(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddSkill = async () => {
    if (newSkill.trim()) {
      await addSkill({ name: newSkill.trim(), level: 'beginner' });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = async (skillName: string) => {
    await removeSkill(skillName);
  };

  const handleAddEducation = () => {
    setEducations([...educations, {
      institution: '',
      degree: '',
      field: '',
      startYear: '',
      endYear: '',
      grade: '',
    }]);
  };

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const updated = [...educations];
    updated[index] = { ...updated[index], [field]: value };
    setEducations(updated);
  };

  const handleRemoveEducation = (index: number) => {
    setEducations(educations.filter((_, i) => i !== index));
  };

  const handleAddExperience = () => {
    setExperiences([...experiences, {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    }]);
  };

  const handleExperienceChange = (index: number, field: keyof Experience, value: string | boolean) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        socialLinks: {
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio,
        },
        expectedCTC: formData.expectedCTC,
        availability: formData.availability,
        education: educations,
        experience: experiences,
      });
      router.push('/dashboard/student/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifiedSkillsCount = profile?.skills?.filter((s: any) => s.verified).length || 0;
  const totalSkillsCount = profile?.skills?.length || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header - Enhanced */}
      <div className="flex items-center gap-4 sticky top-0 bg-card/80 dark:bg-charcoal-900/80 backdrop-blur-sm z-10 py-4 border-b">
        <Button variant="ghost" size="icon" asChild className="hover:bg-charcoal-100 dark:hover:bg-charcoal-800">
          <Link href="/dashboard/student/profile">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-charcoal-950 to-charcoal-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Edit Profile
          </h1>
          <p className="text-charcoal-500 dark:text-charcoal-400 text-sm mt-1">
            Update your personal information and portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/student/profile')}
            disabled={isSubmitting}
            className="gap-2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow-md transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <form className="space-y-6">
        {/* Avatar Upload - Enhanced */}
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary-500" />
            Profile Photo
          </h2>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full blur-md opacity-60" />
              <Avatar className="h-24 w-24 border-4 border-white dark:border-charcoal-800 shadow-xl relative">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary-500 to-primary-600 text-white text-xl font-semibold">
                  {profile?.name?.[0] || 'S'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <input
                type="file"
                id="avatar-upload"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {isUploading ? 'Uploading...' : 'Upload New Photo'}
              </Button>
              <p className="text-xs text-charcoal-500 dark:text-charcoal-400 mt-2">
                Recommended: Square image, at least 200×200px, max 5MB
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information - Collapsible */}
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <button
            type="button"
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between group"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-primary-500" />
              Basic Information
            </h2>
            {expandedSections.basic ? (
              <ChevronUp className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
            )}
          </button>
          
          {expandedSections.basic && (
            <div className="space-y-4 mt-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  required
                  className="rounded-lg border-charcoal-200 focus:border-primary-300 focus:ring-primary-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300">
                  Bio
                </label>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself, your skills, and what you're looking for..."
                  rows={4}
                  className="resize-none rounded-lg"
                />
                <p className="text-xs text-charcoal-400 mt-1">
                  {formData.bio.length}/500 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300 items-center gap-1">
                    <MapPin className="h-4 w-4 text-charcoal-400" />
                    Location
                  </label>
                  <Input
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, Country"
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300 items-center gap-1">
                    <Phone className="h-4 w-4 text-charcoal-400" />
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 98765 43210"
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Skills - Collapsible */}
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <button
            type="button"
            onClick={() => toggleSection('skills')}
            className="w-full flex items-center justify-between group"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary-500" />
              Skills
              {totalSkillsCount > 0 && (
                <Badge variant="outline" className="ml-2 gap-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {verifiedSkillsCount}/{totalSkillsCount} Verified
                </Badge>
              )}
            </h2>
            {expandedSections.skills ? (
              <ChevronUp className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
            )}
          </button>
          
          {expandedSections.skills && (
            <div className="space-y-4 mt-4 pt-2">
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill (e.g., React, Python)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="rounded-lg"
                />
                <Button 
                  type="button" 
                  onClick={handleAddSkill} 
                  variant="outline"
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile?.skills?.map((skill: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                      skill.verified 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    }`}
                  >
                    <span>{skill.name}</span>
                    {skill.verified ? (
                      <CheckCircle className="h-3.5 w-3.5 ml-0.5" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill.name)}
                        className="hover:text-red-500 transition-colors ml-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {profile?.skills?.length === 0 && (
                <div className="text-center py-6">
                  <Sparkles className="h-10 w-10 text-charcoal-300 mx-auto mb-2" />
                  <p className="text-charcoal-500 text-sm">No skills added yet</p>
                  <p className="text-xs text-charcoal-400 mt-1">Add your first skill above</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Education - Collapsible */}
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => toggleSection('education')}
              className="flex items-center gap-2 group"
            >
              <GraduationCap className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold">Education</h2>
              {expandedSections.education ? (
                <ChevronUp className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
              ) : (
                <ChevronDown className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
              )}
            </button>
            {expandedSections.education && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddEducation}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Education
              </Button>
            )}
          </div>

          {expandedSections.education && (
            <>
              {educations.map((edu, index) => (
                <div key={index} className="relative p-4 mb-4 rounded-xl border border-charcoal-100 dark:border-charcoal-700 bg-charcoal-100/40 dark:bg-charcoal-800/30 hover:bg-charcoal-100/50 dark:hover:bg-charcoal-800/50 transition-all duration-200">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveEducation(index)}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <h4 className="font-medium mb-3 text-charcoal-700 dark:text-charcoal-300">
                    Education {index + 1}
                  </h4>
                  <div className="space-y-3">
                    <Input
                      placeholder="Institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                      className="rounded-lg"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="rounded-lg"
                      />
                      <Input
                        placeholder="Field of Study"
                        value={edu.field}
                        onChange={(e) => handleEducationChange(index, 'field', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="Start Year"
                        value={edu.startYear}
                        onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)}
                        className="rounded-lg"
                      />
                      <Input
                        placeholder="End Year"
                        value={edu.endYear}
                        onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)}
                        className="rounded-lg"
                      />
                      <Input
                        placeholder="Grade (%)"
                        value={edu.grade}
                        onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {educations.length === 0 && (
                <div className="text-center py-8">
                  <GraduationCap className="h-10 w-10 text-charcoal-300 mx-auto mb-2" />
                  <p className="text-charcoal-500 text-sm">No education added yet</p>
                  <p className="text-xs text-charcoal-400 mt-1">Click "Add Education" to get started</p>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Work Experience - Collapsible */}
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => toggleSection('experience')}
              className="flex items-center gap-2 group"
            >
              <Briefcase className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold">Work Experience</h2>
              {expandedSections.experience ? (
                <ChevronUp className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
              ) : (
                <ChevronDown className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
              )}
            </button>
            {expandedSections.experience && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddExperience}
                className="gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Experience
              </Button>
            )}
          </div>

          {expandedSections.experience && (
            <>
              {experiences.map((exp, index) => (
                <div key={index} className="relative p-4 mb-4 rounded-xl border border-charcoal-100 dark:border-charcoal-700 bg-charcoal-100/40 dark:bg-charcoal-800/30 hover:bg-charcoal-100/50 dark:hover:bg-charcoal-800/50 transition-all duration-200">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveExperience(index)}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full hover:bg-red-100 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <h4 className="font-medium mb-3 text-charcoal-700 dark:text-charcoal-300">
                    Experience {index + 1}
                  </h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        placeholder="Job Title"
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, 'title', e.target.value)}
                        className="rounded-lg"
                      />
                      <Input
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        className="rounded-lg"
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={exp.location}
                      onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                      className="rounded-lg"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        type="month"
                        placeholder="Start Date"
                        value={exp.startDate}
                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                        className="rounded-lg"
                      />
                      <Input
                        type="month"
                        placeholder="End Date"
                        value={exp.endDate}
                        onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                        disabled={exp.current}
                        className="rounded-lg"
                      />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                        className="rounded border-charcoal-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-charcoal-600 dark:text-charcoal-400">I currently work here</span>
                    </label>
                    <Textarea
                      placeholder="Description of your responsibilities and achievements"
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      rows={3}
                      className="rounded-lg resize-none"
                    />
                  </div>
                </div>
              ))}

              {experiences.length === 0 && (
                <div className="text-center py-8">
                  <Briefcase className="h-10 w-10 text-charcoal-300 mx-auto mb-2" />
                  <p className="text-charcoal-500 text-sm">No work experience added yet</p>
                  <p className="text-xs text-charcoal-400 mt-1">Click "Add Experience" to get started</p>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Career Preferences - Collapsible */}
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <button
            type="button"
            onClick={() => toggleSection('career')}
            className="w-full flex items-center justify-between group"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-500" />
              Career Preferences
            </h2>
            {expandedSections.career ? (
              <ChevronUp className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
            )}
          </button>
          
          {expandedSections.career && (
            <div className="space-y-4 mt-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300">
                  Expected CTC (₹)
                </label>
                <Input
                  name="expectedCTC"
                  value={formData.expectedCTC}
                  onChange={handleInputChange}
                  placeholder="e.g., 8-12 LPA"
                  className="rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300">
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-charcoal-200 dark:border-charcoal-700 bg-card dark:bg-charcoal-800 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="immediate">Immediate</option>
                  <option value="2weeks">Within 2 weeks</option>
                  <option value="1month">Within 1 month</option>
                  <option value="3months">Within 3 months</option>
                </select>
              </div>
            </div>
          )}
        </Card>

        {/* Social Links - Collapsible */}
        <Card className="p-6 border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <button
            type="button"
            onClick={() => toggleSection('social')}
            className="w-full flex items-center justify-between group"
          >
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary-500" />
              Social Links
            </h2>
            {expandedSections.social ? (
              <ChevronUp className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-charcoal-400 group-hover:text-charcoal-600 transition-colors" />
            )}
          </button>
          
          {expandedSections.social && (
            <div className="space-y-4 mt-4 pt-2">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300 items-center gap-1">
                  <Linkedin className="h-4 w-4 text-blue-600" />
                  LinkedIn
                </label>
                <Input
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                  className="rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300 items-center gap-1">
                  <Github className="h-4 w-4 text-charcoal-950 dark:text-charcoal-400" />
                  GitHub
                </label>
                <Input
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username"
                  className="rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-charcoal-700 dark:text-charcoal-300 items-center gap-1">
                  <Globe className="h-4 w-4 text-green-600" />
                  Portfolio Website
                </label>
                <Input
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleInputChange}
                  placeholder="https://yourportfolio.com"
                  className="rounded-lg"
                />
              </div>
            </div>
          )}
        </Card>

        {/* Save Progress Indicator */}
        <div className="sticky bottom-4 bg-card dark:bg-charcoal-900 border border-charcoal-200 dark:border-charcoal-700 rounded-xl p-4 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-charcoal-600 dark:text-charcoal-400">
            <Sparkles className="h-4 w-4 text-primary-500" />
            <span>Your progress is saved when you click "Save Changes"</span>
          </div>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2 bg-primary-600 hover:bg-primary-700 shadow-sm hover:shadow-md transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}