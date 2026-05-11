'use client';

import { useState, useEffect } from 'react';
import InitialLoader from '../ui/InitialLoader';

export default function LoaderProvider({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Check if the loader has already played in this session
    const hasPlayed = sessionStorage.getItem('initial_loader_played');
    
    if (hasPlayed) {
      setShowLoader(false);
    } else {
      // Allow the loader to play for its duration (approx 2.5s)
      const timer = setTimeout(() => {
        sessionStorage.setItem('initial_loader_played', 'true');
        // We don't hide it immediately here because InitialLoader handles its own exit animation
        // But we want to make sure the rest of the site is ready.
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      {showLoader && <InitialLoader />}
      <div style={{ opacity: showLoader ? 0 : 1, transition: 'opacity 1s ease 2.5s' }}>
        {children}
      </div>
    </>
  );
}
