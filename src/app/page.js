'use client';

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useContext,
} from 'react';
import { GlobalContext } from '../context/GlobalContext';
import Link from 'next/link';

export default function Home() {

  const { darkMode, setDarkMode, mobileDevice, setMobileDevice } = useContext(GlobalContext);

  useEffect(() => {
    const handleResize = () => {
      setMobileDevice(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setMobileDevice]);

  return (
    <div>
      <h1>Welcome to Fluentor Agent</h1>
    </div>
  );
}
