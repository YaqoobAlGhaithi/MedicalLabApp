/**
 * printTypes.ts - تعريفات وأنواع نظام الطباعة والتصدير والمشاركة لمختبرات المنار
 */

export type PrintPaperSize = 'A4' | 'A5';
export type PrintOrientation = 'portrait' | 'landscape';
export type ExportFormat = 'pdf' | 'png' | 'jpg';

export type ShareChannel =
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'bluetooth'
  | 'nearby'
  | 'native_intent';

export interface PrintSettingsData {
  printerName: string;
  copies: number;
  paperSize: PrintPaperSize;
  orientation: PrintOrientation;
  colorMode: 'color' | 'grayscale';
  includeHeader: boolean;
  includeFooter: boolean;
  scale: number; // 50 to 150%
}

export interface StoredReportFile {
  id: string;
  fileName: string;
  filePath: string;
  fileUri?: string;
  serverUrl?: string;
  fileBlob?: Blob;
  fileSize?: number;
  createdAt: string;
  patientName: string;
  labNumber: string;
  format: ExportFormat;
  year: string;
  month: string;
  day: string;
}

export interface ExportProgressState {
  status: 'idle' | 'rendering' | 'saving' | 'sharing' | 'success' | 'error';
  message?: string;
  progress?: number;
}
