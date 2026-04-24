'use client';

import { C } from '@/lib/disto';
import { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'ghostDim';
type BtnSize = 'sm' | 'md';

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  onDark?: boolean;
  icon?: ReactNode;
  style?: CSSProperties;
}

const variantStyles = (variant: BtnVariant, onDark: boolean): CSSProperties => ({
  primary:   { background: C.red,   color: '#fff',     borderColor: 'transparent' },
  secondary: onDark
    ? { background: C.bone,  color: C.black,  borderColor: 'transparent' }
    : { background: C.black, color: C.bone,   borderColor: 'transparent' },
  ghost: onDark
    ? { background: 'transparent', borderColor: C.lineStrong, color: C.bone }
    : { background: 'transparent', borderColor: C.black,      color: C.black },
  ghostDim: onDark
    ? { background: 'transparent', borderColor: C.line2, color: C.boneDim }
    : { background: 'transparent', borderColor: 'rgba(0,0,0,0.24)', color: C.muted },
}[variant]);

export default function Btn({
  variant = 'primary',
  size = 'md',
  onDark = false,
  icon,
  children,
  style = {},
  ...rest
}: BtnProps) {
  return (
    <button
      {...rest}
      style={{
        fontFamily: 'Archivo, sans-serif',
        fontWeight: 700,
        letterSpacing: '0.04em',
        border: '1.5px solid transparent',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: size === 'sm' ? '8px 14px' : '12px 22px',
        fontSize: size === 'sm' ? 12 : 13,
        borderRadius: 0,
        transition: 'all 140ms cubic-bezier(0.2,0.8,0.2,1)',
        ...variantStyles(variant, onDark),
        ...style,
      }}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </button>
  );
}
