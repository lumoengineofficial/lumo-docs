export function LumoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lumoGrad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#cf6dfc" />
          <stop offset="1" stopColor="#c1bfff" />
        </linearGradient>
      </defs>
      <path
        d="M20 2.5 34.7 11v18L20 37.5 5.3 29V11L20 2.5Z"
        fill="url(#lumoGrad)"
        fillOpacity="0.16"
        stroke="url(#lumoGrad)"
        strokeWidth="1.6"
      />
      <path
        d="M13 13.5v9.2c0 3.4 2.8 6.2 6.3 6.2h.4c3.5 0 6.3-2.8 6.3-6.2V13.5"
        stroke="url(#lumoGrad)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <circle cx="27.5" cy="14" r="2.4" fill="#fdfbd4" />
    </svg>
  );
}
