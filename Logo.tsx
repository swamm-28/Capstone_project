import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon';
  className?: string;
  showSubtitle?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'full',
  className = '',
  showSubtitle = true,
}) => {
  // Dimension definitions
  const dimensions = {
    sm: { icon: 28, text: 'text-sm', sub: 'text-[9px]', badge: 'text-[8px] px-1 py-0.2' },
    md: { icon: 38, text: 'text-lg', sub: 'text-[10px]', badge: 'text-[9px] px-1.5 py-0.5' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs', badge: 'text-[10px] px-2 py-0.5' },
    xl: { icon: 60, text: 'text-3xl', sub: 'text-sm', badge: 'text-xs px-2.5 py-1' },
  }[size];

  const dim = dimensions.icon;

  return (
    <div className={`flex items-center space-x-3 select-none group ${className}`}>
      {/* Attractive Glowing FinTech Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Ambient Glow */}
        <div
          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-amber-400 opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-300"
          style={{ width: dim, height: dim }}
        />

        {/* SVG Crest */}
        <svg
          width={dim}
          height={dim}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative drop-shadow-md transform transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Background Shield Gradient */}
            <linearGradient id="shieldGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#0B1329" />
            </linearGradient>

            {/* Glowing Border Gradient */}
            <linearGradient id="borderGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Golden Bridge / Arrow Gradient */}
            <linearGradient id="bridgeGrad" x1="15" y1="85" x2="85" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="45%" stopColor="#06B6D4" />
              <stop offset="85%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#FBBF24" />
            </linearGradient>

            {/* Rupee Glow */}
            <linearGradient id="rupeeGrad" x1="35" y1="35" x2="65" y2="65" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>

            {/* Inner Shadow Filter */}
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Shield Container */}
          <path
            d="M50 4 L88 18 C88 56 68 84 50 96 C32 84 12 56 12 18 Z"
            fill="url(#shieldGrad)"
            stroke="url(#borderGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Subtle Inner Accent Grid Lines */}
          <path
            d="M25 45 C40 38 60 38 75 45"
            stroke="#1E3A8A"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.6"
          />
          <path
            d="M20 60 C38 52 62 52 80 60"
            stroke="#1E3A8A"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.6"
          />

          {/* Setu (Bridge Arch) Spanning Across Pillars */}
          <path
            d="M22 68 C 36 50, 64 50, 78 68"
            stroke="url(#bridgeGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Bridge Suspension Cables */}
          <line x1="36" y1="56" x2="36" y2="66" stroke="#38BDF8" strokeWidth="1.5" opacity="0.8" />
          <line x1="50" y1="52" x2="50" y2="64" stroke="#06B6D4" strokeWidth="1.5" opacity="0.9" />
          <line x1="64" y1="56" x2="64" y2="66" stroke="#F59E0B" strokeWidth="1.5" opacity="0.8" />

          {/* Rising Wealth Growth Arc with Arrowhead (Dhan Ascendance) */}
          <path
            d="M24 76 C 42 74, 58 56, 76 30"
            stroke="url(#bridgeGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glowFilter)"
          />
          {/* Dynamic Arrowhead */}
          <polygon
            points="76,23 83,32 71,34"
            fill="url(#rupeeGrad)"
            stroke="#F59E0B"
            strokeWidth="1"
          />

          {/* Central Golden Rupee Symbol (₹) Inside Floating Gem */}
          <circle cx="50" cy="40" r="13" fill="#0F172A" stroke="url(#borderGrad)" strokeWidth="2" />
          <text
            x="50"
            y="45"
            textAnchor="middle"
            fill="url(#rupeeGrad)"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Arial, sans-serif"
          >
            ₹
          </text>

          {/* Modern Sparkle Star */}
          <path
            d="M74 16 L76 21 L81 23 L76 25 L74 30 L72 25 L67 23 L72 21 Z"
            fill="#FDE047"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Typography & Brand Elements */}
      {variant !== 'icon' && (
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <span className={`font-black tracking-tight text-white font-sans ${dimensions.text}`}>
              DHAN
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                SETU
              </span>
            </span>

            {/* Hindi Badge */}
            <span
              className={`font-semibold rounded-md bg-amber-500/10 border border-amber-500/25 text-amber-300 font-sans tracking-wide ${dimensions.badge}`}
              title="DhanSetu (धनसेतु) - Bridge to Wealth"
            >
              धनसेतु
            </span>

            {variant === 'full' && (
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400">
                CIBIL 360°
              </span>
            )}
          </div>

          {showSubtitle && variant === 'full' && (
            <p className={`text-slate-400 tracking-wide font-medium flex items-center space-x-1 ${dimensions.sub}`}>
              <span>AI Credit Health &amp; Wealth Bridge</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};
