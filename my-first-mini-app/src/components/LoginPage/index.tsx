'use client';

import { AuthButton } from '@/components/AuthButton';
import backgroundGif from '@/assets/background-noma.gif';
import nomadLogo from '@/assets/NOMADLOGIN.svg';
import Image from 'next/image';

export const LoginPage = () => {

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Animated Background GIF */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={backgroundGif}
          alt="Background"
          fill
          className="object-cover"
          unoptimized
          priority
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* Logo NOMADLOGIN - positioned in upper left */}
      <div className="absolute top-8 left-6 z-10 animate-bounce-slow">
        <Image
          src={nomadLogo}
          alt="NOMADLOGIN Logo"
          width={240}
          height={80}
          priority
        />
      </div>

      {/* Text Content - centered on screen */}
      <div className="relative z-10 text-center mb-12 mt-20">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md" style={{ fontFamily: 'var(--font-quicksand)' }}>
          Go outside
        </h1>
        <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-md" style={{ fontFamily: 'var(--font-quicksand)' }}>
          Meet safely
        </h2>
        <h3 className="text-4xl font-bold text-white drop-shadow-md relative inline-block" style={{ fontFamily: 'var(--font-quicksand)' }}>
          Trust{' '}
          <span className="relative">
            the journey
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="8"
              viewBox="0 0 200 8"
              preserveAspectRatio="none"
            >
              <path
                d="M 0 4 Q 20 2, 40 4 T 80 4 T 120 4 T 160 4 T 200 4"
                stroke="white"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </h3>
      </div>

      {/* Login Button */}
      <div className="relative z-10 w-full max-w-xs flex justify-center">
        <AuthButton />
      </div>
    </div>
  );
};

