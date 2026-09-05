import React from 'react';
import { useApp } from '../../context/AppContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'giant';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showText = false, className = '' }) => {
  const { settings } = useApp();

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    giant: 'w-32 h-32'
  };

  const textMap = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-xl',
    giant: 'text-2xl'
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Graphic Logo representation matching Image 2 or custom uploaded logo */}
      <div className={`relative flex items-center justify-center ${sizeMap[size]}`}>
        {settings?.logoUrl ? (
          <img
            src={settings.logoUrl}
            alt="Lab Logo"
            className="w-full h-full object-contain drop-shadow-sm rounded-lg"
          />
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Outer Blue Crescent Moon */}
            <path
              d="M 65,10 A 42,42 0 1 0 65,90 A 35,35 0 1 1 65,10 Z"
              fill="#0b3b8c"
              className="transition-all"
            />
            {/* Inner Light Blue Accent */}
            <path
              d="M 68,18 A 34,34 0 1 0 68,82 A 28,28 0 1 1 68,18 Z"
              fill="#2563eb"
              opacity="0.9"
            />
            {/* Large Bold Red "M" inside crescent */}
            <text
              x="48"
              y="65"
              fontSize="44"
              fontWeight="900"
              fontFamily="Arial, sans-serif"
              fill="#dc2626"
              textAnchor="middle"
            >
              M
            </text>
            {/* Microscope graphic touching top right of M */}
            <g transform="translate(56, 16) scale(0.6)" fill="#1d4ed8">
              <path d="M12 2L6 8l4 4 6-6-4-4zm-4 8L4 14l2 2 4-4-2-2zM4 18c0 3 2 5 5 5h4v-3H9c-1.5 0-2-1-2-2v-2H4v2z" />
              <circle cx="16" cy="4" r="2" fill="#dc2626" />
              <path d="M14 22h10v3H14z" fill="#0b3b8c" />
            </g>
          </svg>
        )}
      </div>

      {showText && (
        <div className="text-center mt-1">
          <h1 className={`font-bold tracking-tight text-[#0b3b8c] leading-tight ${textMap[size]}`}>
            {settings?.labNameAr || 'عيادة ومختبرات المنار الطبية'}
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-wider text-blue-800 opacity-80">
            {settings?.labNameEn || 'AL-Manar Medical'}
          </p>
        </div>
      )}
    </div>
  );
};

