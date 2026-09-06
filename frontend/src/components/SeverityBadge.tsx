import React from 'react';
import { Chip } from '@mui/material';

interface SeverityBadgeProps {
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | string;
  size?: 'small' | 'medium';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'small' }) => {
  const getStyle = (sev: string) => {
    switch (sev.toUpperCase()) {
      case 'CRITICAL':
        return { label: 'Critical', bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case 'MAJOR':
        return { label: 'Major', bg: '#ffedd5', text: '#9a3412', border: '#fdba74' };
      case 'MINOR':
      default:
        return { label: 'Minor', bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' };
    }
  };

  const style = getStyle(severity);

  return (
    <Chip
      size={size}
      label={style.label}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
      }}
    />
  );
};
