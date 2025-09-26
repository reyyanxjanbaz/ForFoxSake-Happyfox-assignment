// Hook for implementing lazy loading of images with intersection observer

import { useState, useEffect, useRef } from 'react';

export interface UseLazyImageOptions {
  src: string;
  alt: string;
  rootMargin?: string;
  threshold?: number;
}

export interface UseLazyImageReturn {
  imgRef: React.RefObject<HTMLImageElement>;
  isLoaded: boolean;
  isError: boolean;
  isInView: boolean;
  src: string | undefined;
}

export const useLazyImage = ({
  src,
  alt,
  rootMargin = '50px',
  threshold = 0.1,
}: UseLazyImageOptions): UseLazyImageReturn => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(img);

    return () => {
      observer.disconnect();
    };
  }, [src, rootMargin, threshold]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !imageSrc) return;

    const handleLoad = () => {
      setIsLoaded(true);
      setIsError(false);
    };

    const handleError = () => {
      setIsError(true);
      setIsLoaded(false);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [imageSrc]);

  return {
    imgRef,
    isLoaded,
    isError,
    isInView,
    src: imageSrc,
  };
};

export default useLazyImage;