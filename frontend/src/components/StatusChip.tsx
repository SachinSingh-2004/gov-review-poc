import React from 'react';
import { Chip, ChipProps } from '@mui/material';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, size = 'small' }) => {
  const getChipStyle = (s: string): { color: ChipProps['color']; label: string; bgcolor?: string; textColor?: string } => {
    const formatted = s.toUpperCase().replace('_', ' ');
    switch (formatted) {
      case 'OPEN':
        return { color: 'warning', label: 'Open', bgcolor: '#fff7ed', textColor: '#c2410c' };
      case 'IN PROGRESS':
        return { color: 'info', label: 'In Progress', bgcolor: '#f0f9ff', textColor: '#0369a1' };
      case 'FIELDWORK':
        return { color: 'info', label: 'Fieldwork', bgcolor: '#f0f9ff', textColor: '#0284c7' };
      case 'COMPLETED':
      case 'CLOSED':
      case 'HEALTHY':
      case 'ACTIVE':
        return { color: 'success', label: formatted, bgcolor: '#f0fdf4', textColor: '#15803d' };
      case 'OVERDUE':
      case 'AT RISK':
      case 'CRITICAL':
        return { color: 'error', label: formatted, bgcolor: '#fef2f2', textColor: '#b91c1c' };
      case 'ATTENTION':
      case 'PENDING REVIEW':
      case 'MAJOR':
        return { color: 'warning', label: formatted, bgcolor: '#fffbebe6', textColor: '#b45309' };
      case 'PLANNED':
      case 'DRAFT':
      case 'MINOR':
      default:
        return { color: 'default', label: formatted, bgcolor: '#f1f5f9', textColor: '#475569' };
    }
  };

  const style = getChipStyle(status);

  return (
    <Chip
      size={size}
      label={style.label}
      style={{
        backgroundColor: style.bgcolor,
        color: style.textColor,
        fontWeight: 600,
        fontSize: size === 'small' ? '0.75rem' : '0.85rem',
      }}
    />
  );
};
