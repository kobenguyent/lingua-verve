import React, { useId } from 'react';

interface BrandMarkProps {
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ className = 'w-9 h-9' }) => {
  const uid = useId();
  const bgId = `lv-bg-${uid}`;
  const orbitId = `lv-orbit-${uid}`;
  const ivoryId = `lv-ivory-${uid}`;
  const goldId = `lv-gold-${uid}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={bgId} cx="50%" cy="32%" r="68%">
          <stop offset="0%" stopColor="#1A2846" />
          <stop offset="58%" stopColor="#0C1221" />
          <stop offset="100%" stopColor="#060911" />
        </radialGradient>
        <linearGradient id={orbitId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
          <stop offset="55%" stopColor="#F5D16B" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id={ivoryId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0EAF5" />
        </linearGradient>
        <linearGradient id={goldId} x1="0%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#FEEDAC" />
          <stop offset="52%" stopColor="#EFBE46" />
          <stop offset="100%" stopColor="#C28622" />
        </linearGradient>
      </defs>

      <rect
        x="32"
        y="32"
        width="960"
        height="960"
        rx="216"
        fill={`url(#${bgId})`}
        stroke="#F2CC6B"
        strokeOpacity="0.38"
        strokeWidth="12"
      />
      <circle cx="512" cy="512" r="340" fill="none" stroke="#F0F5FF" strokeOpacity="0.1" strokeWidth="4" />
      <circle cx="512" cy="512" r="272" fill="none" stroke="#38BDF8" strokeOpacity="0.16" strokeWidth="3" />
      <ellipse
        cx="512"
        cy="518"
        rx="350"
        ry="120"
        transform="rotate(24 512 518)"
        fill="none"
        stroke={`url(#${orbitId})`}
        strokeWidth="12"
      />
      <path d="M 276 300 H 344 V 652 H 468 L 490 708 H 296 Q 276 708 276 688 Z" fill={`url(#${ivoryId})`} />
      <path d="M 414 300 H 488 L 580 604 L 672 300 H 746 L 608 708 H 552 Z" fill={`url(#${goldId})`} />
      <path d="M 580 326 Q 584 348 606 352 Q 584 356 580 378 Q 576 356 554 352 Q 576 348 580 326 Z" fill="#59D1FF" />
    </svg>
  );
};
