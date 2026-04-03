import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  // Redirect to role-specific dashboard
  switch (session.user.role) {
    case 'student':
      redirect('/dashboard/student');
    case 'company':
      redirect('/dashboard/company');
    case 'mentor':
      redirect('/dashboard/mentor');
    case 'founder':
      redirect('/dashboard/founder');
    case 'admin':
      redirect('/dashboard/admin');
    default:
      redirect('/dashboard/student');
  }
}
