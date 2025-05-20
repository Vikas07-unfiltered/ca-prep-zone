import React from "react";

interface DoodleProps {
  name: "finance" | "accounting" | "law" | "books" | "certificate" | "briefcase" | "idea";
  className?: string;
  on?: boolean;
}

export const Doodle: React.FC<DoodleProps> = ({ name, className = "", on }) => {
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
  if (name === "books") {
    // Minimal hand-drawn books
    return (
      <svg viewBox="0 0 64 64" fill="none" className={className} aria-label="Books Doodle">
        <rect x="8" y="40" width="48" height="8" rx="2" fill="#fffbe7" stroke="#222" strokeWidth="2" />
        <rect x="12" y="32" width="40" height="8" rx="2" fill="#e3f6fd" stroke="#222" strokeWidth="2" />
        <rect x="16" y="24" width="32" height="8" rx="2" fill="#fff" stroke="#222" strokeWidth="2" />
        <path d="M24 24 V48" stroke="#222" strokeWidth="1.5" />
        <path d="M40 24 V48" stroke="#222" strokeWidth="1.5" />
      </svg>
    );
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