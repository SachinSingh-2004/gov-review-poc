import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, icon, color = '#38bdf8', onClick
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        backgroundColor: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 2,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, border-color 0.2s',
        '&:hover': onClick ? { transform: 'translateY(-2px)', borderColor: color } : {},
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 600 }}>
            {title}
          </Typography>
          {icon && <Box sx={{ color }}>{icon}</Box>}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc' }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: '#64748b', mt: 0.5, display: 'block' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
