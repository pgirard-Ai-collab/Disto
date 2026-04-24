import { CSSProperties, ElementType, ReactNode } from 'react';

interface EyebrowProps {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
  as?: ElementType;
}

export default function Eyebrow({ children, color = '#9A958C', style = {}, as: Tag = 'div' }: EyebrowProps) {
  return (
    <Tag style={{
      fontFamily: 'Archivo, sans-serif',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color,
      lineHeight: 1.35,
      ...style,
    }}>
      {children}
    </Tag>
  );
}
