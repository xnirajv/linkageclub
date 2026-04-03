'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useJob } from '@/hooks/useJobs';
import { 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Clock, 
  Building2, 
  Share2,
  Bookmark,
  ArrowLeft,
  CheckCircle} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/app/dashboard/layout';
import { cn } from '@/lib/utils/cn';

export default function StudentJobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { job, similarJobs, isLoading, checkIfSaved } = useJob(params.id as string);
  const [isSaved, setIsSaved] = React.useState(false);
  const [hasApplied, setHasApplied] = React.useState(false);

  React.useEffect(() => {
    if (job) {
      checkIfSaved().then(setIsSaved);
      setHasApplied(job.hasApplied || false);
    }
  }, [job, checkIfSaved]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-charcoal-950">Job not found</h2>
          <p className="text-charcoal-600 mt-2">The job you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={job.company?.avatar} />
                  <AvatarFallback>{job.company?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-charcoal-950">{job.title}</h1>
                  <p className="text-charcoal-600 mt-1">{job.company?.name}</p>
                  
                  <div className="flex flex-wrap gap-4 mt-3">
                    <span className="flex items-center gap-1 text-sm text-charcoal-600">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-charcoal-600">
                      <IndianRupee className="h-4 w-4" />
                      ₹{job.salary?.min?.toLocaleString()} - ₹{job.salary?.max?.toLocaleString()} /{job.salary?.period}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-charcoal-600">
                      <Briefcase className="h-4 w-4" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-charcoal-600">
                      <Clock className="h-4 w-4" />
                      {job.experience?.min}-{job.experience?.max} years
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                {hasApplied ? (
                  <Button disabled className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Applied
                  </Button>
                ) : (
                  <Button 
                    className="flex-1" 
                    onClick={() => router.push(`/dashboard/student/jobs/${job._id}/apply`)}
                  >
                    Apply Now
                  </Button>
                )}
                <Button variant="outline" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
                </Button>
              </div>
            </Card>

            {/* Job Description */}
            <Card className="p-6">
              <Tabs defaultValue="description">
                <TabsList>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="benefits">Benefits</TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-4">
                  <div className="prose max-w-none">
                    <p>{job.description}</p>
                  </div>
                </TabsContent>

                <TabsContent value="responsibilities" className="mt-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {job.responsibilities?.map((item: string, index: number) => (
                      <li key={index} className="text-charcoal-700">{item}</li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="requirements" className="mt-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {job.requirements?.map((item: string, index: number) => (
                      <li key={index} className="text-charcoal-700">{item}</li>
                    ))}
                  </ul>
                  
                  {job.preferredQualifications && (
                    <>
                      <h4 className="font-semibold mt-4 mb-2">Preferred Qualifications:</h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {job.preferredQualifications.map((item: string, index: number) => (
                          <li key={index} className="text-charcoal-700">{item}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="benefits" className="mt-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {job.benefits?.map((item: string, index: number) => (
                      <li key={index} className="text-charcoal-700">{item}</li>
                    ))}
                  </ul>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Skills Required */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Skills Required</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills?.map((skill: any, index: number) => (
                  <Badge 
                    key={index} 
                    variant={skill.mandatory ? 'default' : 'skill'}
                    className="px-3 py-1"
                  >
                    {skill.name}
                    {skill.mandatory && <span className="ml-1 text-xs">*</span>}
                  </Badge>
                ))}
              </div>
            </Card>

            {/* Application Questions */}
            {job.questions && job.questions.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Application Questions</h3>
                <div className="space-y-4">
                  {job.questions.map((question: any, index: number) => (
                    <div key={index} className="p-4 bg-charcoal-100/50 rounded-lg">
                      <p className="font-medium">{question.question}</p>
                      <p className="text-sm text-charcoal-500 mt-1">
                        Type: {question.type} • {question.required ? 'Required' : 'Optional'}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Company Info & Similar Jobs */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">About Company</h3>
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={job.company?.avatar} />
                  <AvatarFallback>{job.company?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{job.company?.name}</p>
                  {job.company?.isVerified && (
                    <Badge variant="success" size="sm">Verified</Badge>
                  )}
                </div>
              </div>
              
              {job.company?.bio && (
                <p className="text-sm text-charcoal-600 mb-4">{job.company.bio}</p>
              )}

              <div className="space-y-2 text-sm">
                {job.company?.location && (
                  <p className="flex items-center gap-2 text-charcoal-600">
                    <MapPin className="h-4 w-4" />
                    {job.company.location}
                  </p>
                )}
                {job.company?.website && (
                  <a 
                    href={job.company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary-600 hover:underline"
                  >
                    <Building2 className="h-4 w-4" />
                    Visit Website
                  </a>
                )}
              </div>
            </Card>

            {/* Job Overview */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Job Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Posted</span>
                  <span className="font-medium">
                    {new Date(job.postedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Openings</span>
                  <span className="font-medium">{job.openings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-600">Applications</span>
                  <span className="font-medium">{job.applicationsCount}</span>
                </div>
                {job.deadline && (
                  <div className="flex justify-between">
                    <span className="text-charcoal-600">Deadline</span>
                    <span className="font-medium text-red-600">
                      {new Date(job.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Similar Jobs */}
            {similarJobs && similarJobs.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Similar Jobs</h3>
                <div className="space-y-4">
                  {similarJobs.map((similarJob: any) => (
                    <Link 
                      key={similarJob._id} 
                      href={`/dashboard/student/jobs/${similarJob._id}`}
                      className="block group"
                    >
                      <div className="p-3 border rounded-lg hover:border-primary-300 transition-colors">
                        <h4 className="font-medium group-hover:text-primary-600">
                          {similarJob.title}
                        </h4>
                        <p className="text-sm text-charcoal-600 mt-1">{similarJob.company?.name}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-charcoal-500">
                          <span>{similarJob.location}</span>
                          <span>•</span>
                          <span>₹{similarJob.salary?.min?.toLocaleString()}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}