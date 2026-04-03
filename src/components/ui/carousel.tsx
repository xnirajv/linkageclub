'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './button';

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  opts?: Parameters<typeof useEmblaCarousel>[0];
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
}

const Carousel = ({
  children,
  className,
  opts = { loop: true },
  autoplay = false,
  autoplayInterval = 3000,
  showArrows = true,
  showDots = true,
}: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(opts);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
  if (!emblaApi) return;
  
  setScrollSnaps(emblaApi.scrollSnapList());
  emblaApi.on('select', onSelect);
  onSelect();

  // Agar autoplay off hai to cleanup ki zaroorat nahi
  if (!autoplay) return;
  
  // Autoplay on hai to interval set karo
  const interval = setInterval(() => {
    emblaApi.scrollNext();
  }, autoplayInterval);

  // Cleanup function
  return () => clearInterval(interval);
}, [emblaApi, onSelect, autoplay, autoplayInterval]);

  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>

      {showArrows && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm hover:bg-card"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {showDots && scrollSnaps.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-all',
                index === selectedIndex
                  ? 'w-4 bg-primary-600'
                  : 'bg-charcoal-200 hover:bg-charcoal-400'
              )}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CarouselItem = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('flex-[0_0_100%] min-w-0', className)}>
      {children}
    </div>
  );
};

export { Carousel, CarouselItem };