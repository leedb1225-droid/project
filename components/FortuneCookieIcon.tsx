import React from 'react';

interface FortuneCookieIconProps {
  className?: string;
  fill?: string;
}

export default function FortuneCookieIcon({ className = 'w-6 h-6', fill = 'currentColor' }: FortuneCookieIconProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 70 C15 50 25 25 50 20 C75 25 85 50 80 70 C70 80 50 75 50 48 C50 75 30 80 20 70 Z"
        fill={fill}
      />
      <path
        d="M50 48 C48 35 38 28 30 35"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M50 48 C52 35 62 28 70 35"
        stroke="rgba(0,0,0,0.15)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
