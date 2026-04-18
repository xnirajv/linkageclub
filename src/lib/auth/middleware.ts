// import { NextRequest, NextResponse } from 'next/server';
// import { getToken } from 'next-auth/jwt';

// export async function authMiddleware(req: NextRequest) {
//   const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
//   const { pathname } = req.nextUrl;

//   // Allow public routes
//   const publicPaths = [
//     '/',
//     '/login',
//     '/signup',
//     '/forgot-password',
//     '/reset-password',
//     '/verify-email',
//     '/about',
//     '/contact',
//     '/pricing',
//     '/help',
//     '/blog',
//     '/legal',
//     '/projects',
//     '/jobs',
//     '/mentors',
//   ];

//   const isPublicPath = publicPaths.some(path => 
//     pathname === path || pathname.startsWith(path + '/')
//   );

//   if (isPublicPath) {
//     return NextResponse.next();
//   }

//   // Protect dashboard routes
//   if (pathname.startsWith('/dashboard')) {
//     if (!token) {
//       const url = new URL('/login', req.url);
//       url.searchParams.set('callbackUrl', pathname);
//       return NextResponse.redirect(url);
//     }

//     // Role-based access control
//     const role = token.role as string;
//     const segments = pathname.split('/');
//     const dashboardRole = segments[2]; // /dashboard/[role]

//     if (dashboardRole && dashboardRole !== role && role !== 'admin') {
//       // Redirect to correct dashboard
//       const correctDashboard = `/dashboard/${role}`;
//       return NextResponse.redirect(new URL(correctDashboard, req.url));
//     }
//   }

//   // Protect API routes (except public ones)
//   if (pathname.startsWith('/api/')) {
//     // Admin routes - require admin role
//     if (pathname.startsWith('/api/admin')) {
//       if (!token) {
//         return NextResponse.json(
//           { error: 'Authentication required' },
//           { status: 401 }
//         );
//       }
      
//       if (token.role !== 'admin') {
//         return NextResponse.json(
//           { error: 'Forbidden: Admin access required' },
//           { status: 403 }
//         );
//       }
      
//       return NextResponse.next();
//     }

//     const publicApiPaths = [
//       '/api/auth',
//       '/api/projects',
//       '/api/jobs',
//       '/api/mentors',
//       '/api/search',
//     ];

//     const isPublicApi = publicApiPaths.some(path => pathname.startsWith(path));

//     // Some endpoints within public paths still require auth
//     if (!isPublicApi) {
//       if (!token) {
//         return NextResponse.json(
//           { error: 'Authentication required' },
//           { status: 401 }
//         );
//       }
//     }
//   }

//   return NextResponse.next();
// }

// export function requireRole(allowedRoles: string[]) {
//   return (req: NextRequest, token: any) => {
//     if (!token) {
//       return false;
//     }

//     const userRole = token.role as string;
//     return allowedRoles.includes(userRole) || userRole === 'admin';
//   };
// }

// export function checkPermission(token: any, permission: string): boolean {
//   // Admin has all permissions
//   if (token?.role === 'admin') {
//     return true;
//   }

//   // Define permissions for each role
//   const rolePermissions: Record<string, string[]> = {
//     student: [
//       'apply_to_projects',
//       'apply_to_jobs',
//       'book_mentors',
//       'take_assessments',
//       'create_posts',
//       'comment',
//       'update_own_profile',
//     ],
//     company: [
//       'post_jobs',
//       'post_projects',
//       'review_applications',
//       'message_applicants',
//       'view_analytics',
//       'update_own_profile',
//     ],
//     mentor: [
//       'create_sessions',
//       'manage_availability',
//       'share_resources',
//       'view_earnings',
//       'update_own_profile',
//     ],
//     founder: [
//       'post_jobs',
//       'find_cofounders',
//       'build_team',
//       'access_startup_resources',
//       'update_own_profile',
//     ],
//   };

//   const userRole = token?.role as string;
//   const permissions = rolePermissions[userRole] || [];

//   return permissions.includes(permission);
// }