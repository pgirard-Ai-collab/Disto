import { C } from '@/lib/disto';
import { CSSProperties, ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onDark?: boolean;
  style?: CSSProperties;
  pad?: number;
}

export default function Card({ children, onDark = false, style = {}, pad = 24 }: CardProps) {
  return (
    <div style={{
      background: onDark ? C.panel : '#FFFFFF',
      border: `1px solid ${onDark ? C.line : 'rgba(0,0,0,0.12)'}`,
      padding: pad,
      borderRadius: 0,
      ...style,
    }}>
      {children}
    </div>
  );
}
