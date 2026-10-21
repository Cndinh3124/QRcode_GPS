import { BRAND } from '../../constants/brand';

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
      src={BRAND.logoPath}
      alt={`${BRAND.name} logo`}
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
