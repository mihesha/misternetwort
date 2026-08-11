import { useEffect, useState, useRef } from 'react';

export const useIdleTimeout = (onIdle: () => void, idleTime = 15 * 60 * 1000) => {
  const [isIdle, setIsIdle] = useState(false);
  const onIdleRef = useRef(onIdle);

  // Keep the ref updated with the latest callback to avoid stale closures
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleActivity = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsIdle(true);
        if (onIdleRef.current) {
          onIdleRef.current();
        }
      }, idleTime);
    };

    // Initialize timer
    handleActivity();

    // Listeners for activity
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    
    // Add event listeners
    events.forEach((event) => window.addEventListener(event, handleActivity));

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, [idleTime]); // Only re-run if the idleTime changes, NOT the callback

  return isIdle;
};
