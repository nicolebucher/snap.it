type IconProps = { className?: string };

export function SnapIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2c.9 2.4 1.8 3.7 3.4 5.3C17 8.9 18.3 9.8 20.7 10.7c-2.4.9-3.7 1.8-5.3 3.4C13.8 15.7 12.9 17 12 19.4c-.9-2.4-1.8-3.7-3.4-5.3C7 12.5 5.7 11.6 3.3 10.7c2.4-.9 3.7-1.8 5.3-3.4C10.2 5.7 11.1 4.4 12 2z"
        fill="currentColor"
      />
      <circle cx="19.5" cy="4.5" r="1.4" fill="currentColor" />
    </svg>
  );
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
