export const Mascot = ({ size = 120, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Body - rounded blob shape */}
    <ellipse cx="60" cy="70" rx="35" ry="40" fill="#22C55E" />
    
    {/* Head - smaller rounded shape on top */}
    <circle cx="60" cy="35" r="25" fill="#22C55E" />
    
    {/* Eyes - simple dots */}
    <circle cx="52" cy="32" r="5" fill="white" />
    <circle cx="68" cy="32" r="5" fill="white" />
    
    {/* Pupils - smaller dots */}
    <circle cx="53" cy="33" r="2.5" fill="#1B5E20" />
    <circle cx="69" cy="33" r="2.5" fill="#1B5E20" />
    
    {/* Smile - simple curve */}
    <path
      d="M 50 42 Q 60 52 70 42"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Spark/learning symbol on head */}
    <circle cx="75" cy="20" r="6" fill="#FBC02D" />
    <path
      d="M 75 10 L 75 14 M 75 26 L 75 30 M 65 20 L 69 20 M 81 20 L 85 20"
      stroke="#FBC02D"
      strokeWidth="2"
      strokeLinecap="round"
    />
    
    {/* Arms - simple rounded shapes */}
    <ellipse cx="30" cy="65" rx="12" ry="8" fill="#22C55E" transform="rotate(-20 30 65)" />
    <ellipse cx="90" cy="65" rx="12" ry="8" fill="#22C55E" transform="rotate(20 90 65)" />
    
    {/* Feet - simple rounded shapes */}
    <ellipse cx="45" cy="105" rx="10" ry="6" fill="#1B5E20" />
    <ellipse cx="75" cy="105" rx="10" ry="6" fill="#1B5E20" />
  </svg>
);

export const MascotHappy = ({ size = 120, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Body - bouncing effect */}
    <ellipse cx="60" cy="68" rx="35" ry="40" fill="#22C55E" />
    
    {/* Head */}
    <circle cx="60" cy="33" r="25" fill="#22C55E" />
    
    {/* Eyes - happy closed eyes */}
    <path d="M 47 32 Q 52 28 57 32" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M 63 32 Q 68 28 73 32" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
    
    {/* Big smile */}
    <path
      d="M 48 40 Q 60 55 72 40"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Spark - bigger and brighter */}
    <circle cx="78" cy="18" r="7" fill="#FBC02D" />
    <path
      d="M 78 7 L 78 13 M 78 23 L 78 29 M 67 18 L 73 18 M 83 18 L 89 18"
      stroke="#FBC02D"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    
    {/* Arms - raised in celebration */}
    <ellipse cx="25" cy="55" rx="12" ry="8" fill="#22C55E" transform="rotate(-45 25 55)" />
    <ellipse cx="95" cy="55" rx="12" ry="8" fill="#22C55E" transform="rotate(45 95 55)" />
    
    {/* Feet */}
    <ellipse cx="45" cy="105" rx="10" ry="6" fill="#1B5E20" />
    <ellipse cx="75" cy="105" rx="10" ry="6" fill="#1B5E20" />
    
    {/* Celebration confetti dots */}
    <circle cx="20" cy="30" r="3" fill="#FBC02D" />
    <circle cx="100" cy="40" r="4" fill="#2196F3" />
    <circle cx="15" cy="60" r="2.5" fill="#F44336" />
    <circle cx="105" cy="70" r="3" fill="#22C55E" />
  </svg>
);

export const MascotThinking = ({ size = 120, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Body */}
    <ellipse cx="60" cy="70" rx="35" ry="40" fill="#22C55E" />
    
    {/* Head */}
    <circle cx="60" cy="35" r="25" fill="#22C55E" />
    
    {/* Eyes - one normal, one looking up */}
    <circle cx="52" cy="32" r="5" fill="white" />
    <circle cx="68" cy="30" r="5" fill="white" />
    <circle cx="53" cy="33" r="2.5" fill="#1B5E20" />
    <circle cx="69" cy="31" r="2.5" fill="#1B5E20" />
    
    {/* Thoughtful expression */}
    <path
      d="M 50 42 Q 55 45 60 42"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Thought bubble */}
    <circle cx="85" cy="15" r="8" fill="#E3F2FD" stroke="#2196F3" strokeWidth="2" />
    <circle cx="92" cy="25" r="5" fill="#E3F2FD" stroke="#2196F3" strokeWidth="1.5" />
    <circle cx="96" cy="32" r="3" fill="#E3F2FD" stroke="#2196F3" strokeWidth="1" />
    
    {/* Question mark in bubble */}
    <text x="85" y="19" textAnchor="middle" fill="#2196F3" fontSize="12" fontWeight="bold">?</text>
    
    {/* Arms - one scratching head */}
    <ellipse cx="30" cy="65" rx="12" ry="8" fill="#22C55E" transform="rotate(-30 30 65)" />
    <ellipse cx="88" cy="50" rx="10" ry="6" fill="#22C55E" transform="rotate(15 88 50)" />
    
    {/* Feet */}
    <ellipse cx="45" cy="105" rx="10" ry="6" fill="#1B5E20" />
    <ellipse cx="75" cy="105" rx="10" ry="6" fill="#1B5E20" />
  </svg>
);
