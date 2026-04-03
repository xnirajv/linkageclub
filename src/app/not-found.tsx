import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-charcoal-100 p-3">
            <FileQuestion className="h-12 w-12 text-charcoal-600" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-charcoal-950">
          Page not found
        </h1>
        <p className="mb-6 text-charcoal-600">
          Sorry, we couldn't find the page you're looking for. It might have been
          moved or deleted.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild variant="default">
            <Link href="/">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}