// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import {
//   LayoutDashboard, PenSquare, Briefcase, Users, Search,
//   Building2, BarChart3, CreditCard, Settings, LogOut,
//   ChevronLeft, ChevronRight, Bell, UserPlus,
// } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { cn } from '@/lib/utils/cn';
// import { useAuth } from '@/hooks/useAuth';

// const sidebarLinks = [
//   { href: '/dashboard/company', label: 'Overview', icon: LayoutDashboard },
//   { href: '/dashboard/company/post-project', label: 'Post Project', icon: PenSquare },
//   { href: '/dashboard/company/my-projects', label: 'My Projects', icon: Briefcase },
//   { href: '/dashboard/company/applications', label: 'Applications', icon: Users },
//   { href: '/dashboard/company/jobs', label: 'Jobs', icon: Briefcase },
//   { href: '/dashboard/company/talent-search', label: 'Talent Search', icon: Search },
//   { href: '/dashboard/company/team', label: 'Team', icon: UserPlus },
//   { href: '/dashboard/company/profile', label: 'Profile', icon: Building2 },
//   { href: '/dashboard/company/analytics', label: 'Analytics', icon: BarChart3 },
//   { href: '/dashboard/company/billing', label: 'Billing', icon: CreditCard },
//   { href: '/dashboard/company/settings', label: 'Settings', icon: Settings },
// ];

// export default function CompanyDashboardLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();
//   const { user } = useAuth();
//   const [collapsed, setCollapsed] = React.useState(false);

//   const companyName = (user as any)?.companyName || user?.name || 'Company';
//   const initials = companyName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

//   return (
//     <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a]">
//       {/* Sidebar */}
//       <aside className={cn(
//         'fixed left-0 top-0 z-40 h-full border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111] transition-all duration-200 flex flex-col',
//         collapsed ? 'w-[68px]' : 'w-[240px]'
//       )}>
//         {/* Logo */}
//         <div className="flex items-center h-14 px-4 border-b border-gray-200 dark:border-gray-800">
//           <Link href="/dashboard/company" className="flex items-center gap-2.5 font-semibold text-sm">
//             <div className="w-6 h-6 rounded bg-black dark:bg-white flex items-center justify-center">
//               <span className="text-white dark:text-black text-xs font-bold">I</span>
//             </div>
//             {!collapsed && <span className="truncate">InternHub</span>}
//           </Link>
//         </div>

//         {/* Nav */}
//         <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
//           {sidebarLinks.map((link) => {
//             const Icon = link.icon;
//             const isActive = pathname === link.href || (link.href !== '/dashboard/company' && pathname.startsWith(link.href));
//             return (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 title={collapsed ? link.label : undefined}
//                 className={cn(
//                   'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] font-medium transition-colors',
//                   isActive
//                     ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
//                     : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50'
//                 )}
//               >
//                 <Icon className="h-4 w-4 flex-shrink-0" />
//                 {!collapsed && <span className="truncate">{link.label}</span>}
//               </Link>
//             );
//           })}
//         </nav>

//         {/* Bottom */}
//         <div className="border-t border-gray-200 dark:border-gray-800 p-2">
//           <div className={cn('flex items-center gap-2.5 px-2.5 py-2', collapsed && 'justify-center')}>
//             <Avatar className="h-7 w-7">
//               <AvatarImage src={user?.avatar} />
//               <AvatarFallback className="text-[10px] bg-gray-200 dark:bg-gray-700">{initials}</AvatarFallback>
//             </Avatar>
//             {!collapsed && (
//               <div className="flex-1 min-w-0">
//                 <p className="text-[13px] font-medium truncate">{companyName}</p>
//                 <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
//               </div>
//             )}
//           </div>
//           <Link
//             href="/api/auth/signout"
//             className="flex items-center gap-2.5 px-2.5 py-2 mt-0.5 rounded-md text-[13px] text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
//           >
//             <LogOut className="h-4 w-4" />
//             {!collapsed && <span>Log out</span>}
//           </Link>
//         </div>

//         {/* Collapse Button */}
//         <button
//           onClick={() => setCollapsed(!collapsed)}
//           className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
//         >
//           {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
//         </button>
//       </aside>

//       {/* Main */}
//       <div className={cn('transition-all duration-200', collapsed ? 'ml-[68px]' : 'ml-[240px]')}>
//         {/* Top Bar */}
//         <header className="sticky top-0 z-30 h-14 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-[#111]/80 backdrop-blur-sm flex items-center justify-between px-6">
//           <div />
//           <div className="flex items-center gap-2">
//             <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
//               <Link href="/dashboard/company/notifications">
//                 <Bell className="h-4 w-4" />
//               </Link>
//             </Button>
//             <Link href="/dashboard/company/profile">
//               <Avatar className="h-7 w-7">
//                 <AvatarImage src={user?.avatar} />
//                 <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
//               </Avatar>
//             </Link>
//           </div>
//         </header>
//         <main className="p-6">{children}</main>
//       </div>
//     </div>
//   );
// }