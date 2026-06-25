import { useCallback, useEffect, useRef, useState } from 'react';

export const HorizontalScroll = ({
  children,
  className = '',
  fadeFrom = 'from-white',
  showProgress = false,
  hideArrowsOnMobile = true,
}) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [progress, setProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(100);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);

    if (maxScroll > 0) {
      setProgress(scrollLeft / maxScroll);
      setThumbWidth(Math.max(28, (clientWidth / scrollWidth) * 100));
    } else {
      setProgress(0);
      setThumbWidth(100);
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => observer.disconnect();
  }, [updateScrollState, children]);

  const scrollBy = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction * 220,
      behavior: 'smooth',
    });
  };

  const arrowClass = hideArrowsOnMobile
    ? 'absolute top-1/2 z-20 hidden -translate-y-1/2 sm:flex'
    : 'absolute top-1/2 z-20 flex -translate-y-1/2';

  const hasOverflow = canScrollLeft || canScrollRight;

  return (
    <div className={`relative ${className}`}>
      {canScrollLeft && (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r ${fadeFrom} to-transparent sm:w-10`}
          />
          <button
            type="button"
            aria-label="Cuộn trái"
            onClick={() => scrollBy(-1)}
            className={`${arrowClass} left-0.5 h-7 w-7 items-center justify-center rounded-full bg-white/95 text-xs text-ink shadow-sm ring-1 ring-border/80 backdrop-blur-sm`}
          >
            ‹
          </button>
        </>
      )}

      {canScrollRight && (
        <>
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l ${fadeFrom} to-transparent sm:w-12`}
          />
          <button
            type="button"
            aria-label="Cuộn phải"
            onClick={() => scrollBy(1)}
            className={`${arrowClass} right-0.5 h-7 w-7 items-center justify-center rounded-full bg-white/95 text-xs text-ink shadow-sm ring-1 ring-border/80 backdrop-blur-sm`}
          >
            ›
          </button>
        </>
      )}

      <div ref={scrollRef} onScroll={updateScrollState} className="horizontal-scroll">
        {children}
        <div className="w-1 shrink-0" aria-hidden />
      </div>

      {showProgress && hasOverflow && (
        <div className="mx-auto mt-3 h-1 max-w-[4.5rem] overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-brand-500/70 transition-[margin,width] duration-150 ease-out"
            style={{
              width: `${thumbWidth}%`,
              marginLeft: `${progress * (100 - thumbWidth)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
};
