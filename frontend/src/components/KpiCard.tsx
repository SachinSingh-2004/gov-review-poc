import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = '#0ea5e9',
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      sx={{
        '&:hover': onClick
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ my: 0.5, fontWeight: 700, color: '#0f172a' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                {subtitle}
              </Typography>
            )}
          </Box>
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${color}15`,
                color: color,
                width: 48,
                height: 48,
                borderRadius: '10px',
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
