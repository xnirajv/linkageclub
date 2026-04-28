'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { UserPlus, Trash2, Shield, Mail, Crown, MoreVertical, Users } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

interface TeamManagementProps {
  members?: TeamMember[];
  onInvite?: (email: string, role: string) => void;
  onRemove?: (memberId: string) => void;
  onChangeRole?: (memberId: string, role: string) => void;
}

const roleConfig: Record<string, { variant: any; icon: React.ElementType; color: string }> = {
  owner: { variant: 'default', icon: Crown, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  admin: { variant: 'warning', icon: Shield, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  member: { variant: 'outline', icon: Users, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
};

export function TeamManagement({ members = [], onInvite, onRemove, onChangeRole }: TeamManagementProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    await onInvite?.(inviteEmail, inviteRole);
    setInviteEmail('');
    setIsInviting(false);
  };

  return (
    <div className="space-y-4">
      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <UserPlus className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm">Invite Team Member</h3>
          </div>
        </div>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <Input type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="rounded-xl flex-1" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm">
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <Button onClick={handleInvite} disabled={isInviting} size="sm">
              {isInviting ? 'Sending...' : <><Mail className="h-4 w-4 mr-1" />Invite</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-sm">Members ({members.length})</h3>
        </div>
        <CardContent className="p-5">
          {members.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No members yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map((member) => {
                const config = roleConfig[member.role] || roleConfig.member;
                const Icon = config.icon;
                return (
                  <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black text-xs font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <Badge className={`${config.color} text-[10px] border-0 gap-1`}>
                          <Icon className="h-3 w-3" />{member.role}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    {member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onChangeRole?.(member._id, 'admin')}><Shield className="h-4 w-4 mr-2" />Make Admin</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => onRemove?.(member._id)}><Trash2 className="h-4 w-4 mr-2" />Remove</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}