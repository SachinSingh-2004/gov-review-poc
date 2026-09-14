import React from 'react';
import { Chip } from '@mui/material';

interface StatusChipProps {
  status: string;
  type?: 'health' | 'status' | 'severity';
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, type = 'status', size = 'small' }) => {
  let color: 'success' | 'warning' | 'error' | 'info' | 'default' = 'default';

  const val = (status || '').toUpperCase();

  if (type === 'health') {
    if (val === 'GREEN') color = 'success';
    else if (val === 'AMBER') color = 'warning';
    else if (val === 'RED') color = 'error';
  } else if (type === 'severity') {
    if (val === 'CRITICAL') color = 'error';
    else if (val === 'MAJOR') color = 'warning';
    else if (val === 'MINOR') color = 'info';
  } else {
    if (['COMPLETED', 'APPROVED', 'CLOSED', 'RESOLVED'].includes(val)) color = 'success';
    else if (['IN_PROGRESS', 'PENDING_REVIEW', 'PENDING', 'AMBER', 'IN_REVIEW'].includes(val)) color = 'warning';
    else if (['OVERDUE', 'REJECTED', 'CRITICAL', 'RED'].includes(val)) color = 'error';
    else if (['PLANNED', 'OPEN', 'DRAFT'].includes(val)) color = 'info';
  }

  return (
    <Chip
      label={status || 'N/A'}
      color={color}
      size={size}
      sx={{ fontWeight: 700, borderRadius: 1 }}
    />
  );
};
