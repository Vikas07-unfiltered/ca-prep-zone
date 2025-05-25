import React from "react";

interface DoodleProps {
  name: "finance" | "accounting" | "law" | "books" | "certificate" | "briefcase" | "idea" | "balance-sheet" | "book-light";
  className?: string;
  on?: boolean;
  state?: 'closed' | 'open' | 'page'; // For books
}

export const Doodle: React.FC<DoodleProps> = ({ name, className = "", on, state }) => {
  if (name === "finance") {
    // Minimal hand-drawn piggy bank
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Finance Doodle">
        <ellipse cx="32" cy="40" rx="24" ry="16" stroke="#222" strokeWidth="2.5" fill="#fffbe7" />
        <ellipse cx="32" cy="40" rx="20" ry="12" stroke="#222" strokeWidth="2" fill="none" />
        <ellipse cx="32" cy="36" rx="4" ry="2" stroke="#222" strokeWidth="1.5" fill="#fff" />
        <circle cx="48" cy="36" r="2.5" fill="#222" />
        <rect x="28" y="24" width="8" height="6" rx="2" stroke="#222" strokeWidth="2" fill="#ffe066" />
        <path d="M16 48 Q12 56 20 56" stroke="#222" strokeWidth="2" fill="none" />
        <path d="M48 48 Q52 56 44 56" stroke="#222" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (name === "accounting") {
    // Minimal hand-drawn calculator
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Accounting Doodle">
        <rect x="12" y="8" width="40" height="48" rx="6" stroke="#222" strokeWidth="2.5" fill="#e3f6fd" />
        <rect x="20" y="16" width="24" height="8" rx="2" stroke="#222" strokeWidth="1.5" fill="#fff" />
        <rect x="20" y="28" width="8" height="8" rx="2" stroke="#222" strokeWidth="1.5" fill="#fff" />
        <rect x="28" y="28" width="8" height="8" rx="2" stroke="#222" strokeWidth="1.5" fill="#fff" />
        <rect x="36" y="28" width="8" height="8" rx="2" stroke="#222" strokeWidth="1.5" fill="#fff" />
        <rect x="20" y="36" width="8" height="8" rx="2" stroke="#222" strokeWidth="1.5" fill="#fff" />
        <rect x="28" y="36" width="8" height="8" rx="2" stroke="#222" strokeWidth="1.5" fill="#fff" />
        <rect x="36" y="36" width="8" height="8" rx="2" stroke="#222" strokeWidth="1.5" fill="#fff" />
      </svg>
    );
  }
  if (name === "law") {
    // Minimal hand-drawn scales of justice
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Law Doodle">
        <rect x="30" y="12" width="4" height="32" rx="2" fill="#fff" stroke="#222" strokeWidth="2" />
        <circle cx="32" cy="12" r="3" fill="#fff" stroke="#222" strokeWidth="2" />
        <path d="M32 16 L20 40 M32 16 L44 40" stroke="#222" strokeWidth="2" />
        <ellipse cx="20" cy="44" rx="6" ry="2.5" fill="#fff" stroke="#222" strokeWidth="2" />
        <ellipse cx="44" cy="44" rx="6" ry="2.5" fill="#fff" stroke="#222" strokeWidth="2" />
        <path d="M32 44 V56" stroke="#222" strokeWidth="2" />
        <ellipse cx="32" cy="58" rx="8" ry="2" fill="#fff" stroke="#222" strokeWidth="2" />
      </svg>
    );
  }
  // Book with lightbulb doodle (new style)
  if (name === "book-light") {
    // 'on' prop controls lightbulb color/animation
    return (
      <svg viewBox="0 0 120 120" fill="none" className={className} aria-label="Book with Lightbulb">
        {/* Book (hand-drawn, open) */}
        <path d="M20 95 Q35 80 60 90 Q85 80 100 95" stroke="#222" strokeWidth="2.5" fill="#fff"/>
        <path d="M20 95 Q60 110 100 95" stroke="#222" strokeWidth="2.5" fill="#fff"/>
        <path d="M35 85 Q60 100 85 85" stroke="#222" strokeWidth="2" fill="none"/>
        <path d="M60 90 Q60 105 60 110" stroke="#aaa" strokeWidth="1.5"/>
        {/* Pages */}
        <path d="M35 85 Q45 80 60 85 Q75 80 85 85" stroke="#222" strokeWidth="1.5" fill="#fff"/>
        <path d="M35 85 Q40 75 60 80 Q80 75 85 85" stroke="#222" strokeWidth="1.2" fill="#fff"/>
        {/* Lightbulb */}
        <g>
          <ellipse cx="60" cy="52" rx="14" ry="14" fill={on ? "#ffe066" : "#eee"} stroke={on ? "#ffd700" : "#aaa"} strokeWidth="2.5" />
          <path d="M54 66 Q60 72 66 66" stroke="#aaa" strokeWidth="2" fill="none"/>
          <rect x="56" y="66" width="8" height="8" rx="2" fill="#fff" stroke="#aaa" strokeWidth="1.2"/>
          {/* Bulb filament */}
          <path d="M60 60 Q62 58 60 56 Q58 58 60 60" stroke={on ? "#ffd700" : "#aaa"} strokeWidth="1.8" fill="none"/>
          {/* Rays */}
          <g>
            <line x1="60" y1="36" x2="60" y2="22" stroke={on ? "#ffd700" : "#ccc"} strokeWidth={on ? 3 : 1.5} opacity={on ? 1 : 0.4} >
              {on && <animate attributeName="opacity" values="1;0.5;1" dur="0.7s" repeatCount="indefinite" />}
            </line>
            <line x1="60" y1="36" x2="70" y2="25" stroke={on ? "#ffd700" : "#ccc"} strokeWidth={on ? 2.5 : 1.2} opacity={on ? 1 : 0.4} >
              {on && <animate attributeName="opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite" />}
            </line>
            <line x1="60" y1="36" x2="50" y2="25" stroke={on ? "#ffd700" : "#ccc"} strokeWidth={on ? 2.5 : 1.2} opacity={on ? 1 : 0.4} >
              {on && <animate attributeName="opacity" values="1;0.3;1" dur="0.7s" repeatCount="indefinite" />}
            </line>
            <line x1="60" y1="36" x2="75" y2="32" stroke={on ? "#ffd700" : "#ccc"} strokeWidth={on ? 2 : 1} opacity={on ? 1 : 0.4} >
              {on && <animate attributeName="opacity" values="1;0.2;1" dur="0.7s" repeatCount="indefinite" />}
            </line>
            <line x1="60" y1="36" x2="45" y2="32" stroke={on ? "#ffd700" : "#ccc"} strokeWidth={on ? 2 : 1} opacity={on ? 1 : 0.4} >
              {on && <animate attributeName="opacity" values="1;0.2;1" dur="0.7s" repeatCount="indefinite" />}
            </line>
          </g>
        </g>
      </svg>
    );
  }

  if (name === "books") {
    // Closed book (outlined style)
    if (!on && (!state || state === 'closed')) {
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Book Closed">
          <path d="M12 52 Q12 20 32 20 Q52 20 52 52" fill="#fff" stroke="#222" strokeWidth="2.5" />
          <path d="M12 52 Q32 44 52 52" fill="#fff" stroke="#222" strokeWidth="2.5" />
          <path d="M32 20 V44" stroke="#222" strokeWidth="2" />
          <path d="M32 44 Q32 48 28 50" stroke="#222" strokeWidth="2" />
          <path d="M32 44 Q32 48 36 50" stroke="#222" strokeWidth="2" />
        </svg>
      );
    }
    // Open book (outlined style)
    if (state === 'open') {
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Book Open">
          <path d="M12 52 Q12 32 32 32 Q52 32 52 52" fill="#fff" stroke="#222" strokeWidth="2.5" />
          <path d="M12 52 Q32 44 52 52" fill="#fff" stroke="#222" strokeWidth="2.5" />
          <path d="M32 32 V52" stroke="#222" strokeWidth="2" />
          <path d="M22 44 Q32 38 42 44" stroke="#222" strokeWidth="1.5" />
        </svg>
      );
    }
    // Page turning (hand-drawn style + animation)
    if (state === 'page') {
      return (
        <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Book Page Turn">
          {/* Hand-drawn wavy book base */}
          <path d="M13 53 Q13 34 32 33 Q51 32 51 53" fill="#fff" stroke="#222" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 53 Q32 47 51 53" fill="#fff" stroke="#222" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 33 V53" stroke="#222" strokeWidth="2" strokeDasharray="3 2" />
          <path d="M22 46 Q32 39 42 46" stroke="#222" strokeWidth="1.7" />
          {/* Exaggerated, hand-drawn turning page */}
          <g>
            <path d="M32 33 Q55 35 55 53 Q54 54 32 53" fill="#fff" stroke="#0af" strokeWidth="3" strokeDasharray="6 3" filter="url(#shadow)"/>
            <animateTransform attributeName="transform" type="rotate" from="0 32 53" to="-120 32 53" dur="1s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="skewY" from="0" to="-18" begin="0s" dur="1s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="scale" from="1 1" to="1.15 1.05" begin="0s" dur="1s" repeatCount="indefinite" />
          </g>
          <defs>
            <filter id="shadow" x="0" y="0" width="200%" height="200%">
              <feDropShadow dx="-3" dy="3" stdDeviation="2" flood-color="#333"/>
            </filter>
          </defs>
        </svg>
      );
    }
  }
  if (name === "certificate") {
    // Minimal hand-drawn certificate
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Certificate Doodle">
        <rect x="12" y="16" width="40" height="32" rx="4" fill="#fffbe7" stroke="#222" strokeWidth="2" />
        <circle cx="32" cy="32" r="8" fill="#e3f6fd" stroke="#222" strokeWidth="2" />
        <path d="M32 40 L32 56" stroke="#222" strokeWidth="2" />
        <circle cx="32" cy="56" r="3" fill="#ffe066" stroke="#222" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === "briefcase") {
    // Minimal hand-drawn briefcase
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Briefcase Doodle">
        <rect x="12" y="24" width="40" height="24" rx="4" fill="#e3f6fd" stroke="#222" strokeWidth="2" />
        <rect x="24" y="16" width="16" height="8" rx="2" fill="#fffbe7" stroke="#222" strokeWidth="2" />
        <rect x="28" y="36" width="8" height="8" rx="2" fill="#fff" stroke="#222" strokeWidth="1.5" />
        <path d="M12 36 H52" stroke="#222" strokeWidth="1.5" />
      </svg>
    );
  }
  if (name === "balance-sheet") {
    // Minimal hand-drawn balance sheet
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Balance Sheet Doodle">
        <rect x="12" y="12" width="40" height="40" rx="2" fill="#fff" stroke="#222" strokeWidth="2" />
        <rect x="16" y="16" width="32" height="8" rx="1" fill="#e3f6fd" stroke="#222" strokeWidth="1.5" />
        <rect x="16" y="28" width="32" height="4" rx="1" fill="#f0f9ff" stroke="#222" strokeWidth="1.2" />
        <rect x="16" y="36" width="24" height="4" rx="1" fill="#f0f9ff" stroke="#222" strokeWidth="1.2" />
        <rect x="16" y="44" width="28" height="4" rx="1" fill="#f0f9ff" stroke="#222" strokeWidth="1.2" />
        <path d="M24 20 L40 20" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M24 32 L48 32" stroke="#222" strokeWidth="1.2" strokeDasharray="2 2" />
        <path d="M24 40 L40 40" stroke="#222" strokeWidth="1.2" strokeDasharray="2 2" />
        <path d="M24 48 L44 48" stroke="#222" strokeWidth="1.2" strokeDasharray="2 2" />
        <path d="M16 24 H48" stroke="#222" strokeWidth="1.2" />
      </svg>
    );
  }
  if (name === "idea") {
    // Minimal hand-drawn lightbulb, on/off state
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Idea Doodle">
        <ellipse cx="32" cy="32" rx="16" ry="20" fill={on ? "#fffbe7" : "#fff"} stroke="#222" strokeWidth="2" />
        <rect x="28" y="48" width="8" height="8" rx="2" fill={on ? "#ffe066" : "#eee"} stroke="#222" strokeWidth="2" />
        <path d="M32 56 V60" stroke="#222" strokeWidth="2" />
        <path d="M24 60 H40" stroke="#222" strokeWidth="2" />
        <path d="M20 20 Q32 8 44 20" stroke="#222" strokeWidth="1.5" fill="none" />
        {on && (
          <g>
            <ellipse cx="32" cy="32" rx="18" ry="22" fill="#ffe066" fillOpacity="0.18" />
            <ellipse cx="32" cy="32" rx="22" ry="26" fill="#ffe066" fillOpacity="0.08" />
          </g>
        )}
      </svg>
    );
  }
  return null;
};