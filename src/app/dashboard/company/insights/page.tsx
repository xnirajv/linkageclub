import { redirect } from 'next/navigation';

export default function CompanyInsightsRedirectPage() {
  redirect('/dashboard/company/analytics');
}