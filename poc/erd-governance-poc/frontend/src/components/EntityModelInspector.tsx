import React from 'react';
import { Paper, Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';

interface EntityModelInspectorProps {
  entityName: string;
  tableName: string;
  primaryKey: string;
  foreignKeys: string[];
  relationships: string[];
  roleAccess: string;
  relatedPage: string;
}

export const EntityModelInspector: React.FC<EntityModelInspectorProps> = ({
  entityName, tableName, primaryKey, foreignKeys, relationships, roleAccess, relatedPage
}) => {
  return (
    <Paper sx={{ p: 2.5, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#38bdf8' }}>
            Data Model Inspector: {entityName}
          </Typography>
          <Chip label={`Table: ${tableName}`} size="small" sx={{ bgcolor: '#0f172a', color: '#cbd5e1', fontFamily: 'monospace' }} />
        </Box>
        <Chip label={`Related Page: ${relatedPage}`} size="small" color="primary" variant="outlined" />
      </Box>

      <Table size="small" sx={{ '& td, & th': { borderColor: '#334155', color: '#cbd5e1', fontSize: '0.8rem' } }}>
        <TableHead>
          <TableRow sx={{ bgcolor: '#0f172a' }}>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Primary Key</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Foreign Keys</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Cardinalities & Relationships</TableCell>
            <TableCell sx={{ color: '#94a3b8', fontWeight: 700 }}>Role Access Scope</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: '#38bdf8', fontWeight: 700, fontFamily: 'monospace' }}>{primaryKey}</TableCell>
            <TableCell>
              {foreignKeys.length > 0 ? (
                foreignKeys.map((fk) => (
                  <Chip key={fk} label={fk} size="small" sx={{ mr: 0.5, mb: 0.5, bgcolor: '#0f172a', color: '#94a3b8', fontSize: '0.7rem' }} />
                ))
              ) : (
                'None'
              )}
            </TableCell>
            <TableCell>
              {relationships.map((rel, idx) => (
                <div key={idx}>• {rel}</div>
              ))}
            </TableCell>
            <TableCell sx={{ color: '#fbbf24', fontWeight: 600 }}>{roleAccess}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};
