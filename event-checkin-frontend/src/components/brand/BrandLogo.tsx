interface BrandLogoProps {
  size?: number;
  className?: string;
}

export default function BrandLogo({
  size = 44,
  className,
}: BrandLogoProps) {
  return (
    <img
      className={className}
      src="/brand-logo.svg"
      alt="QR Event"
      width={size}
      height={size}
      style={{
        display: 'block',
        width: size,
        height: size,
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  );
}
