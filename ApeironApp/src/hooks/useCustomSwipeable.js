import { useState, useEffect, useRef } from 'react';

/**
 * Custom swipeable hook as fallback for react-swipeable
 * Provides basic swipe functionality without external dependencies
 */
export const useCustomSwipeable = ({
  onSwipedLeft,
  onSwipedRight,
  onSwiping,
  onSwiped,
  delta = 10,
  preventScrollOnSwipe = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const elementRef = useRef(null);

  const handleStart = (clientX) => {
    setStartX(clientX);
    setCurrentX(clientX);
    setIsDragging(true);
    if (onSwiping) onSwiping();
  };

  const handleMove = (clientX) => {
    if (!isDragging) return;
    setCurrentX(clientX);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    
    const diff = startX - currentX;
    const absDiff = Math.abs(diff);
    
    if (absDiff > delta) {
      if (diff > 0 && onSwipedLeft) {
        onSwipedLeft();
      } else if (diff < 0 && onSwipedRight) {
        onSwipedRight();
      }
    }
    
    setIsDragging(false);
    if (onSwiped) onSwiped();
  };

  const handleTouchStart = (e) => {
    if (preventScrollOnSwipe) {
      e.preventDefault();
    }
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    if (preventScrollOnSwipe) {
      e.preventDefault();
    }
    handleMove(e.touches[0].clientX);
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.clientX);
    }
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScrollOnSwipe });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScrollOnSwipe });
    element.addEventListener('touchend', handleEnd);

    // Mouse events
    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startX, currentX, preventScrollOnSwipe, onSwipedLeft, onSwipedRight, onSwiping, onSwiped]);

  return {
    ref: elementRef,
    style: {
      userSelect: isDragging ? 'none' : 'auto',
      touchAction: preventScrollOnSwipe ? 'none' : 'auto'
    }
  };
};

export default useCustomSwipeable;