import { useCallback, useEffect, useRef, useState } from 'react';

export const HorizontalScroll = ({
  children,
  className = '',
  fadeFrom = 'from-white',
  showProgress = false,
  hideArrowsOnMobile = true,
}) => {
  const scrollRef = useRef(null);
  const frameRef = useRef(0);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
    progress: 0,
    thumbWidth: 100,
  });

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    const next = {
      canScrollLeft: scrollLeft > 4,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 4,
      progress: maxScroll > 0 ? scrollLeft / maxScroll : 0,
      thumbWidth: maxScroll > 0 ? Math.max(28, (clientWidth / scrollWidth) * 100) : 100,
    };

    setScrollState((prev) => {
      if (
        prev.canScrollLeft === next.canScrollLeft &&
        prev.canScrollRight === next.canScrollRight &&
        Math.abs(prev.progress - next.progress) < 0.001 &&
        Math.abs(prev.thumbWidth - next.thumbWidth) < 0.1
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const scheduleUpdate = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(updateScrollState);
  }, [updateScrollState]);

  useEffect(() => {
    scheduleUpdate();
    const t1 = window.setTimeout(scheduleUpdate, 150);
    const t2 = window.setTimeout(scheduleUpdate, 600);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [scheduleUpdate]);

  const scrollBy = (direction) => {
    scrollRef.current?.scrollBy({
      left: direction * 220,
      behavior: 'smooth',
    });
  };

  const arrowClass = hideArrowsOnMobile
    ? 'absolute top-1/2 z-20 hidden -translate-y-1/2 sm:flex'
    : 'absolute top-1/2 z-20 flex -translate-y-1/2';

  const { canScrollLeft, canScrollRight, progress, thumbWidth } = scrollState;
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

      <div ref={scrollRef} onScroll={scheduleUpdate} className="horizontal-scroll">
        {children}
        <div className="w-1 shrink-0" aria-hidden />
      </div>

      {showProgress && (
        <div
          className={`mx-auto mt-3 h-1 max-w-[4.5rem] overflow-hidden rounded-full bg-slate-100 transition-opacity ${
            hasOverflow ? 'opacity-100' : 'opacity-0'
          }`}
        >
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
