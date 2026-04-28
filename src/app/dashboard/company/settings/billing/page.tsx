import { redirect } from 'next/navigation';

export default function SettingsBillingRedirect() {
  redirect('/dashboard/company/billing');
}