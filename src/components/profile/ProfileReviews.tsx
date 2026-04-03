'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Rating } from '@/components/ui/rating';
import { EmptyState } from '@/components/shared/EmptyState';
import { MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Loader } from '../shared/Loader';

interface ProfileReviewsProps {
  userId: string;
}

export function ProfileReviews({ userId }: ProfileReviewsProps) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [userId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No reviews yet"
        description="This user hasn't received any reviews"
      />
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review: any) => (
        <Card key={review._id}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar src={review.reviewer.avatar} alt={review.reviewer.name} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold">{review.reviewer.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <Rating value={review.rating} readOnly size="sm" />
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
