import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';

export interface Column<T> {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right' | 'left' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { id?: string }>({
  columns,
  rows,
  loading = false,
  emptyMessage = 'No records found',
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress size={36} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          Loading governance data...
        </Typography>
      </Paper>
    );
  }

  if (!rows || rows.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#fafafa' }}>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: '#f8fafc' }}>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align}
                style={{ minWidth: column.minWidth, fontWeight: 700, color: '#334155', fontSize: '0.8rem', textTransform: 'uppercase' }}
              >
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow
              hover
              key={row.id || idx}
              onClick={() => onRowClick && onRowClick(row)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map((column) => {
                const value = (row as any)[column.id];
                return (
                  <TableCell key={column.id} align={column.align} sx={{ py: 1.5, fontSize: '0.875rem' }}>
                    {column.format ? column.format(value, row) : value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
