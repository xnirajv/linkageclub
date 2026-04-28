import { redirect } from 'next/navigation';

export default function CompanyProjectsRedirectPage() {
  redirect('/dashboard/company/my-projects');
}