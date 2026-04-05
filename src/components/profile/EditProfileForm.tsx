'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/forms/Textarea';
import { ImageUpload } from '@/components/shared/ImageUpload';
import { User } from '@/types';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
    portfolio: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  user: User;
  onSuccess?: () => void;
}

export function EditProfileForm({ user, onSuccess }: EditProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const { update } = useSession();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      bio: user.bio || '',
      location: user.location || '',
      phone: user.phone || '',
      socialLinks: {
        linkedin: user.socialLinks?.linkedin || '',
        github: user.socialLinks?.github || '',
        portfolio: user.socialLinks?.portfolio || '',
        twitter: user.socialLinks?.twitter || '',
      },
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value as string);
        }
      });

      if (avatar) {
        formData.append('avatar', avatar);
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        await update({
          user: {
            name: data.name
          }
        });

        onSuccess?.();
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <ImageUpload
        value={user.avatar}
        onChange={setAvatar}
        error={errors.name?.message}
      />

      <div>
        <label className="block text-sm font-medium mb-2">Name</label>
        <Input {...register('name')} error={errors.name?.message} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bio</label>
        <Textarea {...register('bio')} error={errors.bio?.message} rows={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <Input {...register('location')} error={errors.location?.message} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone</label>
          <Input {...register('phone')} error={errors.phone?.message} />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Social Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            {...register('socialLinks.linkedin')}
            placeholder="LinkedIn URL"
            error={errors.socialLinks?.linkedin?.message}
          />
          <Input
            {...register('socialLinks.github')}
            placeholder="GitHub URL"
            error={errors.socialLinks?.github?.message}
          />
          <Input
            {...register('socialLinks.portfolio')}
            placeholder="Portfolio URL"
            error={errors.socialLinks?.portfolio?.message}
          />
          <Input
            {...register('socialLinks.twitter')}
            placeholder="Twitter URL"
            error={errors.socialLinks?.twitter?.message}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}