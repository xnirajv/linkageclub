import { useIntersectionObserver } from './useIntersectionObserver';

interface UseInViewOptions {
  threshold?: number;
  triggerOnce?: boolean;
  rootMargin?: string;
}

export function useInView<T extends Element>(options: UseInViewOptions = {}) {
  const { elementRef, isIntersecting } = useIntersectionObserver<T>({
    threshold: options.threshold || 0,
    triggerOnce: options.triggerOnce || false,
    rootMargin: options.rootMargin || '0px',
  });

  return { ref: elementRef, inView: isIntersecting };
}