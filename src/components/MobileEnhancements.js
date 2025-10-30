import React, { useEffect, useState } from 'react';

// Hook for detecting mobile devices
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};

// Hook for handling swipe gestures
export const useSwipeGesture = (onSwipeLeft, onSwipeRight) => {
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) > swipeThreshold) {
        if (swipeDistance > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (swipeDistance < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight]);
};

// Touch-friendly button component
export const TouchButton = ({ children, onClick, className = '', disabled = false, ...props }) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <button
      className={`touch-button ${className} ${isPressed ? 'pressed' : ''}`}
      onClick={onClick}
      disabled={disabled}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      {...props}
    >
      {children}
    </button>
  );
};

// Pull to refresh component
export const PullToRefresh = ({ onRefresh, children }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  useEffect(() => {
    let touchStartY = 0;
    let touchCurrentY = 0;
    let pullStarted = false;

    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        pullStarted = true;
      }
    };

    const handleTouchMove = (e) => {
      if (!pullStarted) return;

      touchCurrentY = e.touches[0].clientY;
      const distance = touchCurrentY - touchStartY;

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, 100));
        setIsPulling(distance > 50);
      }
    };

    const handleTouchEnd = () => {
      if (pullDistance > 50 && onRefresh) {
        onRefresh();
      }
      setPullDistance(0);
      setIsPulling(false);
      pullStarted = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, onRefresh]);

  return (
    <div className="pull-to-refresh-container">
      <div 
        className={`pull-indicator ${isPulling ? 'active' : ''}`}
        style={{ transform: `translateY(${pullDistance * 0.5}px)` }}
      >
        {isPulling ? '↻ Release to refresh' : '↓ Pull to refresh'}
      </div>
      <div style={{ transform: `translateY(${pullDistance * 0.3}px)` }}>
        {children}
      </div>
    </div>
  );
};

const MobileEnhancements = {
  useIsMobile,
  useSwipeGesture,
  TouchButton,
  PullToRefresh
};

export default MobileEnhancements;