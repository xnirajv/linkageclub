'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useMentor } from '@/hooks/useMentors';
import { usePayments } from '@/hooks/usePayment';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import {
  ArrowLeft,
  Star,
  Calendar as CalendarIcon,
  Clock,
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import DashboardLayout from '@/app/dashboard/layout';
import { Mentor, MentorReview } from '@/types/mentor';
import { User } from '@/types/user';

// Extended type for populated mentor
interface PopulatedMentor extends Omit<Mentor, 'userId'> {
  userId: User; // Populated user
  reviews: (MentorReview & { student?: User })[];
}

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const mentorId = params?.id as string;
  
  const { mentor, isLoading } = useMentor(mentorId);
  const { initializeRazorpay, isProcessing } = usePayments();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Cast mentor to populated type
  const populatedMentor = mentor as PopulatedMentor | null;

  useEffect(() => {
    if (selectedDate) {
      checkSlotAvailability();
    }
  }, [selectedDate]);

  const checkSlotAvailability = async () => {
    if (!selectedDate) return;
    
    setIsCheckingAvailability(true);
    try {
      // Mock available slots - replace with actual API call
      const mockSlots = [
        '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM'
      ];
      setAvailableSlots(mockSlots);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailableSlots([]);
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  // Manual booking function
  const bookSession = async (_mentorUserId: string, bookingData: any) => {
    try {
      setIsBooking(true);
      const response = await fetch(`/api/mentors/${mentorId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) throw new Error('Failed to book session');
      
      const result = await response.json();
      return { success: true, session: result.session };
    } catch (error) {
      console.error('Error booking session:', error);
      return { success: false, error: (error as Error).message };
    } finally {
      setIsBooking(false);
    }
  };

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime || !sessionTopic || !populatedMentor?.userId?._id) return;

    try {
      // Create booking
      const bookingData = {
        date: selectedDate.toISOString(),
        time: selectedTime,
        duration: 60,
        topic: sessionTopic,
        description: sessionDescription,
      };

      const result = await bookSession(populatedMentor.userId._id, bookingData);
      
      if (result.success && result.session) {
        // Initialize payment
        await initializeRazorpay({
          amount: populatedMentor.hourlyRate,
          type: 'mentorship',
          purpose: `Mentor Session: ${sessionTopic}`,
          sessionId: result.session._id,
        });
        
        router.push('/dashboard/student/mentors/my-sessions');
      }
    } catch (error) {
      console.error('Error booking session:', error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!populatedMentor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-charcoal-950">Mentor not found</h2>
          <p className="text-charcoal-600 mt-2">The mentor you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => router.push('/dashboard/student/mentors')} className="mt-4">
            Browse Mentors
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM',
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal-950">Mentor Profile</h1>
            <p className="text-charcoal-600">View mentor details and book sessions</p>
          </div>
        </div>

        {/* Mentor Profile Card */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center text-center md:w-64">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={populatedMentor.userId?.avatar} />
                <AvatarFallback className="text-2xl">
                  {populatedMentor.userId?.name?.[0] || 'M'}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{populatedMentor.userId?.name}</h2>
              <p className="text-charcoal-600 mb-2">{populatedMentor.userId?.bio}</p>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {populatedMentor.stats?.averageRating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-charcoal-500">
                  ({populatedMentor.stats?.totalReviews || 0} reviews)
                </span>
              </div>
              {populatedMentor.isVerified && (
                <Badge variant="success" className="mb-2">
                  Verified Mentor
                </Badge>
              )}
              <Badge variant="outline" className="mb-2">
                {populatedMentor.stats?.responseRate || 100}% Response Rate
              </Badge>
              <p className="text-2xl font-bold text-primary-600 mb-4">
                {formatCurrency(populatedMentor.hourlyRate)}
                <span className="text-sm font-normal text-charcoal-500">/hour</span>
              </p>
              <Button 
                className="w-full" 
                onClick={() => setShowBookingForm(!showBookingForm)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Book Session
              </Button>
            </div>

            {/* Mentor Details */}
            <div className="flex-1">
              {/* Bio */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">About</h3>
                <p className="text-charcoal-700">
                  {populatedMentor.userId?.bio || 'No bio provided.'}
                </p>
              </div>

              {/* Expertise */}
              {populatedMentor.expertise && populatedMentor.expertise.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Expertise</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {populatedMentor.expertise.map((exp, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">{exp.skill}</p>
                          <p className="text-sm text-charcoal-500">
                            {exp.level} • {exp.yearsOfExperience} years
                            {exp.verified && ' ✓'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-3 bg-charcoal-100/50 rounded-lg text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-primary-600" />
                  <p className="text-sm text-charcoal-500">Total Sessions</p>
                  <p className="font-semibold">{populatedMentor.stats?.totalSessions || 0}</p>
                </div>
                <div className="p-3 bg-charcoal-100/50 rounded-lg text-center">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
                  <p className="text-sm text-charcoal-500">Completed</p>
                  <p className="font-semibold">{populatedMentor.stats?.completedSessions || 0}</p>
                </div>
                <div className="p-3 bg-charcoal-100/50 rounded-lg text-center">
                  <Award className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                  <p className="text-sm text-charcoal-500">Repeat Students</p>
                  <p className="font-semibold">{populatedMentor.stats?.repeatStudents || 0}</p>
                </div>
                <div className="p-3 bg-charcoal-100/50 rounded-lg text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-sm text-charcoal-500">Response Time</p>
                  <p className="font-semibold">{populatedMentor.stats?.responseTime || 0}h</p>
                </div>
              </div>

              {/* Reviews */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Recent Reviews</h3>
                {populatedMentor.reviews && populatedMentor.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {populatedMentor.reviews.slice(0, 3).map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={review.student?.avatar} />
                            <AvatarFallback>{review.student?.name?.[0] || 'S'}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{review.student?.name || 'Student'}</span>
                          <span className="text-xs text-charcoal-500">
                            {formatRelativeTime(review.createdAt.toString())}
                          </span>
                          <div className="flex items-center gap-1 ml-auto">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-charcoal-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-charcoal-500 text-center py-4">No reviews yet</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Booking Form */}
        {showBookingForm && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Book a Session</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Date</label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date: Date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Select Time</label>
                {isCheckingAvailability ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                  </div>
                ) : selectedDate ? (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => {
                      const isAvailable = availableSlots.includes(time);
                      return (
                        <Button
                          key={time}
                          variant={selectedTime === time ? 'default' : 'outline'}
                          className="w-full"
                          disabled={!isAvailable}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-charcoal-500">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Please select a date first
                  </div>
                )}
              </div>
            </div>

            {/* Session Details */}
            {selectedTime && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Session Topic *</label>
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    placeholder="e.g., React Performance Optimization"
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                  <textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    placeholder="What would you like to discuss in this session?"
                    rows={3}
                    className="w-full rounded-md border border-charcoal-300 bg-card py-2 px-3"
                  />
                </div>

                {/* Session Summary */}
                <div className="p-4 bg-charcoal-100/50 rounded-lg">
                  <h4 className="font-medium mb-2">Session Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-charcoal-600">Date:</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-600">Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-600">Duration:</span>
                      <span className="font-medium">1 hour</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-600">Rate:</span>
                      <span className="font-medium">{formatCurrency(populatedMentor.hourlyRate)}/hour</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-medium">Total:</span>
                      <span className="font-bold text-primary-600">{formatCurrency(populatedMentor.hourlyRate)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <Button variant="outline" onClick={() => setShowBookingForm(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBookSession}
                    disabled={!sessionTopic || isProcessing || isBooking}
                  >
                    {(isProcessing || isBooking) ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}