interface NexidLogoProps {
  variant?: 'horizontal' | 'vertical' | 'mark';
  tone?: 'auto' | 'gold' | 'monochrome-light' | 'monochrome-dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function NexidLogo({
  variant = 'horizontal',
  tone = 'auto',
  size = 'md',
  className = '',
}: NexidLogoProps) {
  const iconDim = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-11 w-11' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  const primaryStroke =
    tone === 'monochrome-light'
      ? '#F4F1EB'
      : tone === 'monochrome-dark'
        ? '#101114'
        : tone === 'gold'
          ? '#D5B47A'
          : 'currentColor';

  const accentStroke =
    tone === 'monochrome-light'
      ? '#F4F1EB'
      : tone === 'monochrome-dark'
        ? '#101114'
        : '#D5B47A';

  const mark = (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`${iconDim} shrink-0`}
    >
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="9"
        stroke={tone === 'gold' ? '#D5B47A' : 'var(--border-subtle)'}
        strokeWidth="1.25"
        fill={tone === 'monochrome-dark' ? 'transparent' : 'var(--bg-surface-alt)'}
      />
      <path
        d="M12 28.5V11.5L20 21.8V11.5"
        stroke={primaryStroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 18.2L28 28.5V11.5"
        stroke={accentStroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (variant === 'mark') {
    return <span className={`inline-flex items-center ${className}`}>{mark}</span>;
  }

  if (variant === 'vertical') {
    return (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
        {mark}
        <span className={`font-display font-bold tracking-tight whitespace-nowrap ${textSize}`}>
          NEXID <span className="text-[var(--accent-gold)]">ONE</span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      {mark}
      <span className={`font-display font-bold tracking-tight whitespace-nowrap ${textSize}`}>
        NEXID <span className="text-[var(--accent-gold)]">ONE</span>
      </span>
    </span>
  );
}
