'use client';

import React, { useState } from 'react';
import { User } from '@/types/user';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Ban, Trash2, Eye, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface UserTableProps {
  users: User[];
  onBan?: (userId: string) => void;
  onDelete?: (userId: string) => void;
  onVerify?: (userId: string) => void;
}

const ROLE_VARIANTS: Record<string, any> = {
  student: 'skill',
  company: 'default',
  mentor: 'success',
  founder: 'warning',
  admin: 'error',
};

export function UserTable({ users, onBan, onDelete, onVerify }: UserTableProps) {
  const [confirmAction, setConfirmAction] = useState<{ type: 'ban' | 'delete'; userId: string } | null>(null);

  const handleConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'ban') onBan?.(confirmAction.userId);
    else onDelete?.(confirmAction.userId);
    setConfirmAction(null);
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left">
              <th className="py-3 px-4 text-sm font-medium">User</th>
              <th className="py-3 px-4 text-sm font-medium">Role</th>
              <th className="py-3 px-4 text-sm font-medium">Status</th>
              <th className="py-3 px-4 text-sm font-medium">Trust Score</th>
              <th className="py-3 px-4 text-sm font-medium">Joined</th>
              <th className="py-3 px-4 text-sm font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={ROLE_VARIANTS[user.role]} size="sm" className="capitalize">{user.role}</Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={user.emailVerified ? 'verified' : 'pending'} size="sm">
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-sm font-medium ${user.trustScore >= 70 ? 'text-success-600' : user.trustScore >= 40 ? 'text-warning-600' : 'text-error-600'}`}>
                    {user.trustScore}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon-sm" asChild title="View user">
                      <Link href={`/dashboard/admin/users/${user._id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    {!user.isVerified && onVerify && (
                      <Button variant="ghost" size="icon-sm" onClick={() => onVerify(user._id)} title="Verify user" className="text-success-600">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {onBan && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setConfirmAction({ type: 'ban', userId: user._id })} title="Ban user" className="text-warning-600">
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button variant="ghost" size="icon-sm" onClick={() => setConfirmAction({ type: 'delete', userId: user._id })} title="Delete user" className="text-error-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!users.length && (
          <div className="text-center py-10 text-muted-foreground">No users found</div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirm}
        title={confirmAction?.type === 'ban' ? 'Ban User' : 'Delete User'}
        description={confirmAction?.type === 'ban'
          ? 'Are you sure you want to ban this user? They will lose access to the platform.'
          : 'Are you sure you want to delete this user? This action cannot be undone.'}
        confirmLabel={confirmAction?.type === 'ban' ? 'Ban User' : 'Delete User'}
        variant="destructive"
      />
    </>
  );
}
