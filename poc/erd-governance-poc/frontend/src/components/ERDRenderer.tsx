import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Box, Paper, Typography } from '@mui/material';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  er: {
    useMaxWidth: true,
    fontSize: 12,
  },
});

interface ERDRendererProps {
  chart: string;
  title: string;
}

export const ERDRenderer: React.FC<ERDRendererProps> = ({ chart, title }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const idRef = useRef<string>(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (containerRef.current && chart) {
      containerRef.current.innerHTML = '';
      mermaid.render(idRef.current, chart).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      }).catch((err) => {
        console.error('Mermaid render error:', err);
      });
    }
  }, [chart]);

  return (
    <Paper sx={{ p: 3, backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: 2, overflow: 'auto' }}>
      <Typography variant="h6" sx={{ color: '#38bdf8', mb: 2, fontWeight: 700 }}>
        {title}
      </Typography>
      <Box ref={containerRef} sx={{ display: 'flex', justifyContent: 'center', minHeight: 300 }} />
    </Paper>
  );
};
