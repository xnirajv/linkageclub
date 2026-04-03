import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="app-shell text-foreground">
      <Navbar />
      <main className="relative overflow-hidden pt-24">{children}</main>
      <Footer />
    </div>
  );
}
