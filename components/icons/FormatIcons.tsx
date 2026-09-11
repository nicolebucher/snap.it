type IconProps = { className?: string };

export function WorksheetIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M15 3v4h4" stroke="currentColor" strokeWidth="2.1" strokeLinejoin="round" />
      <path d="M8 12.5h8M8 16h6M8 9h4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

export function TestIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M9 2.5h6v2H9z" fill="currentColor" />
      <path
        d="m8 12.5 2.2 2.2L16 9"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 18h8" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
    </svg>
  );
}

export function GameIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 8h10a5 5 0 0 1 5 5v2.5a2.5 2.5 0 0 1-4.5 1.5L16 15H8l-1.5 2A2.5 2.5 0 0 1 2 15.5V13a5 5 0 0 1 5-5Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
      <path d="M8 10.3v3.4M6.3 12h3.4" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <circle cx="16" cy="10.5" r="1.1" fill="currentColor" />
      <circle cx="18.3" cy="12.8" r="1.1" fill="currentColor" />
    </svg>
  );
}
