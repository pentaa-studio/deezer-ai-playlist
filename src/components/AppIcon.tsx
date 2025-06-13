interface AppIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export default function AppIcon({ size = 24, className = "", animated = false }: AppIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main gradient */}
        <linearGradient id={`mainGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#a238ff', stopOpacity: 1}} />
          <stop offset="50%" style={{stopColor: '#9333ea', stopOpacity: 1}} />
          <stop offset="100%" style={{stopColor: '#8b2bdb', stopOpacity: 1}} />
        </linearGradient>
        
        {/* Shine effect */}
        <linearGradient id={`shine-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: '#ffffff', stopOpacity: 0.3}} />
          <stop offset="50%" style={{stopColor: '#ffffff', stopOpacity: 0.1}} />
          <stop offset="100%" style={{stopColor: '#ffffff', stopOpacity: 0}} />
        </linearGradient>
        
        {/* Shadow filter */}
        <filter id={`shadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.2"/>
        </filter>
      </defs>
      
      {/* Background circle with shadow */}
      <circle cx="16" cy="16" r="14" fill={`url(#mainGradient-${size})`} filter={`url(#shadow-${size})`}/>
      
      {/* Shine overlay */}
      <circle cx="16" cy="16" r="14" fill={`url(#shine-${size})`}/>
      
      {/* Musical note */}
      {/* Note head with subtle shadow */}
      <ellipse cx="11.5" cy="21.5" rx="3.2" ry="2.2" fill="#ffffff" opacity="0.95"/>
      
      {/* Note stem */}
      <rect x="14.2" y="9.5" width="2.2" height="12.5" fill="#ffffff" rx="1.1"/>
      
      {/* Note flag with curve */}
      <path d="M16.4 9.5 C18.5 9.5, 21 10.8, 21 13.2 C21 15.8, 18.2 14.5, 16.4 14.2 Z" fill="#ffffff" opacity="0.95"/>
      
      {/* AI sparkles */}
      <circle cx="22.5" cy="9.5" r="1.8" fill="#ffffff" opacity="0.9">
        {animated && <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="24.8" cy="13.2" r="1.2" fill="#ffffff" opacity="0.7">
        {animated && <animate attributeName="opacity" values="0.7;0.4;0.7" dur="2.5s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="26.5" cy="11.8" r="0.9" fill="#ffffff" opacity="0.5">
        {animated && <animate attributeName="opacity" values="0.5;0.2;0.5" dur="3s" repeatCount="indefinite"/>}
      </circle>
      
      {/* Additional small sparkles */}
      <circle cx="8" cy="12" r="0.6" fill="#ffffff" opacity="0.4">
        {animated && <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.8s" repeatCount="indefinite"/>}
      </circle>
      <circle cx="25" cy="22" r="0.7" fill="#ffffff" opacity="0.3">
        {animated && <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3.2s" repeatCount="indefinite"/>}
      </circle>
    </svg>
  );
} 