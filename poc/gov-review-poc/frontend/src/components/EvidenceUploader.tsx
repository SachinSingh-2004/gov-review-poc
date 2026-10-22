import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as ExcelIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';

import { api } from '../services/api';
import { Attachment } from '../types';

interface EvidenceUploaderProps {
  entityType: 'ACTION' | 'FINDING';
  entityId: string;
  readOnly?: boolean;
}

export const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  entityType,
  entityId,
  readOnly = false,
}) => {
  const queryClient = useQueryClient();
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryKey = ['attachments', entityType, entityId];

  const { data: attachments = [], isLoading } = useQuery<Attachment[]>({
    queryKey,
    queryFn: async () => {
      if (!entityId) return [];
      const res = await api.get(`/attachments/entity/${entityType}/${entityId}`);
      return res.data;
    },
    enabled: !!entityId,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('entity_type', entityType);
      formData.append('entity_id', entityId);
      formData.append('file', file);

      const res = await api.post('/attachments/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    },
    onSuccess: () => {
      setErrorMsg(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (err: any) => {
      const detail = err.response?.data?.detail || 'Failed to upload evidence file.';
      setErrorMsg(detail);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (attachmentId: string) => {
      return (await api.delete(`/attachments/${attachmentId}`)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (readOnly || !e.dataTransfer.files.length) return;
    const file = e.dataTransfer.files[0];
    uploadMutation.mutate(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly || !e.target.files?.length) return;
    const file = e.target.files[0];
    uploadMutation.mutate(file);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (mimeType: string, filename: string) => {
    if (mimeType.includes('pdf') || filename.endsWith('.pdf')) {
      return <PdfIcon sx={{ color: '#e11d48' }} />;
    }
    if (mimeType.includes('image') || filename.match(/\.(png|jpg|jpeg)$/i)) {
      return <ImageIcon sx={{ color: '#0284c7' }} />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('excel') || filename.match(/\.(xlsx|xls|csv)$/i)) {
      return <ExcelIcon sx={{ color: '#16a34a' }} />;
    }
    if (mimeType.includes('word') || filename.match(/\.(docx|doc|txt)$/i)) {
      return <DocIcon sx={{ color: '#2563eb' }} />;
    }
    return <FileIcon sx={{ color: '#64748b' }} />;
  };

  const handleDownload = (attachmentId: string, filename: string) => {
    api
      .get(`/attachments/${attachmentId}/download`, { responseType: 'blob' })
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((err) => console.error('Download failed', err));
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Evidence & Verification Attachments ({attachments.length})
      </Typography>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      )}

      {/* Drag & Drop Upload Zone */}
      {!readOnly && (
        <Paper
          variant="outlined"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleFileDrop}
          sx={{
            p: 3,
            textAlign: 'center',
            bgcolor: dragOver ? 'action.hover' : 'grey.50',
            borderColor: dragOver ? 'primary.main' : 'divider',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderRadius: 2,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          component="label"
        >
          <input type="file" hidden onChange={handleFileSelect} disabled={uploadMutation.isPending} />
          <UploadIcon sx={{ fontSize: 36, color: 'primary.main', mb: 1 }} />
          <Typography variant="body2" fontWeight={600}>
            Click to upload evidence file or drag & drop here
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
            Supported formats: PDF, PNG, JPG, XLSX, DOCX, CSV (Max size: 10MB)
          </Typography>
        </Paper>
      )}

      {uploadMutation.isPending && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="primary" fontWeight={600}>
            Uploading evidence file...
          </Typography>
          <LinearProgress sx={{ mt: 0.5, borderRadius: 2 }} />
        </Box>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <List sx={{ mt: 2, p: 0 }}>
          {attachments.map((att) => (
            <ListItem
              key={att.id}
              sx={{
                border: '1px solid #e2e8f0',
                borderRadius: 1.5,
                mb: 1,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'grey.50' },
              }}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    color="primary"
                    title="Download File"
                    onClick={() => handleDownload(att.id, att.file_name)}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  {!readOnly && (
                    <IconButton
                      size="small"
                      color="error"
                      title="Delete Evidence"
                      onClick={() => deleteMutation.mutate(att.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
            >
              <ListItemIcon>{getFileIcon(att.mime_type, att.file_name)}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    {att.file_name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary">
                    {formatFileSize(att.file_size)} • Uploaded by {att.uploaded_by_name || 'User'} on{' '}
                    {new Date(att.uploaded_at).toLocaleDateString()}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};
