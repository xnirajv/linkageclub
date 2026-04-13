import { redirect } from 'next/navigation';

export default function CompanyMessagesRedirectPage() {
  redirect('/dashboard/messages');
}
