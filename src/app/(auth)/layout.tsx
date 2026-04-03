import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | InternHub Auth',
    default: 'Authentication',
  },
  description: 'Sign in or create an account on InternHub',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell">
      {children}
    </div>
  );
}
