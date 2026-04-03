'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { UserPlus, Trash2, Shield, Mail, Crown, MoreVertical, Users, UserCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
  joinedAt: Date;
}

interface TeamManagementProps {
  members?: TeamMember[];
  onInvite?: (email: string, role: string) => void;
  onRemove?: (memberId: string) => void;
  onChangeRole?: (memberId: string, role: string) => void;
}

const ROLE_BADGES: Record<string, { variant: any; label: string; icon: React.ElementType; color: string }> = {
  owner: { variant: 'default', label: 'Owner', icon: Crown, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  admin: { variant: 'warning', label: 'Admin', icon: Shield, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  member: { variant: 'outline', label: 'Member', icon: Users, color: 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-800 dark:text-charcoal-400' },
};

export function TeamManagement({ members = [], onInvite, onRemove, onChangeRole }: TeamManagementProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await onInvite?.(inviteEmail, inviteRole);
      setInviteEmail('');
    } finally {
      setIsInviting(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Invite Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <UserPlus className="h-4 w-4 text-primary-600" />
            </div>
            Invite Team Member
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <select
              className="rounded-xl border border-charcoal-200 dark:border-charcoal-700 bg-card dark:bg-charcoal-800 px-4 py-2 text-sm"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            <Button onClick={handleInvite} disabled={isInviting} className="gap-2">
              {isInviting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  Send Invite
                </>
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Invited members will receive an email with instructions to join your team
          </p>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="border-b border-charcoal-100 dark:border-charcoal-800 bg-charcoal-100/60">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary-100 dark:bg-primary-900/50">
              <UserCheck className="h-4 w-4 text-primary-600" />
            </div>
            Team Members
            <span className="text-sm font-normal text-muted-foreground">({members.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          {!members.length ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-charcoal-100 dark:bg-charcoal-800 flex items-center justify-center">
                <Users className="h-10 w-10 text-charcoal-400" />
              </div>
              <p className="text-muted-foreground">No team members yet</p>
              <p className="text-xs text-muted-foreground mt-1">Invite members to collaborate</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => {
                const roleConfig = ROLE_BADGES[member.role];
                const RoleIcon = roleConfig.icon;
                
                return (
                  <div
                    key={member._id}
                    className="group p-4 rounded-xl border border-charcoal-100 dark:border-charcoal-800 bg-card dark:bg-charcoal-900 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-gray-800">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary-100 to-primary-200 text-primary-700 font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-charcoal-950 dark:text-white">
                            {member.name}
                          </p>
                          <Badge className={`${roleConfig.color} border-0 gap-1`}>
                            <RoleIcon className="h-3 w-3" />
                            {roleConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-charcoal-500 dark:text-charcoal-400 mt-0.5">
                          {member.email}
                        </p>
                        <p className="text-xs text-charcoal-400 mt-1">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>

                      {member.role !== 'owner' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onChangeRole?.(member._id, 'admin')}>
                              <Shield className="h-4 w-4" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onChangeRole?.(member._id, 'member')}>
                              <Users className="h-4 w-4" />
                              Make Member
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="gap-2 cursor-pointer text-red-600" onClick={() => onRemove?.(member._id)}>
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
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