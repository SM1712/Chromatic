export interface FolderSource {
  id: string;
  name: string;
  handle?: FileSystemDirectoryHandle;
  path?: string;
  addedAt: number;
  count: number;
  isDemo?: boolean;
}

export interface ImageItem {
  id: string;
  name: string;
  url: string;
  size: number;
  date: Date;
  dateStr: string;
  sourceId: string;
  sourceName: string;
  width?: number;
  height?: number;
  file?: File;
}

export interface DateGroup {
  dateKey: string;
  title: string; // e.g. "Hoy", "Ayer", "19 de Julio, 2026"
  subtitle?: string; // e.g. "Lunes", "Hace 3 días"
  images: ImageItem[];
}

export type GridDensity = 'compact' | 'medium' | 'large';
export type SortOrder = 'newest' | 'oldest' | 'name';
export type ThemeMode = 'light' | 'dark' | 'oled' | 'cyberpunk';
export type AccentColor = 'blue' | 'violet' | 'emerald' | 'amber' | 'rose';

export interface UserSettings {
  theme: ThemeMode;
  accent: AccentColor;
  density: GridDensity;
  sortOrder: SortOrder;
}

// Print Studio Types
export type PrintPaperSize = 'A4' | 'Letter' | 'Legal' | 'A3' | 'A5' | 'Photo4x6' | 'Photo5x7' | 'Photo8x10' | 'Passport' | 'Custom';
export type PrintOrientation = 'portrait' | 'landscape';
export type PrintFitMode = 'cover' | 'contain';
export type PrintLayoutMode = 'auto' | 'grid' | 'preset';
export type PrintPreset = 'single' | 'grid2x2' | 'grid3x3' | 'passport' | 'contact' | 'polaroid';
export type PrintCropMarksStyle = 'none' | 'corners' | 'lines';

export interface PrintItem {
  id: string;
  src: string;
  name: string;
  ratio: number; // width / height
  copies: number;
  rotation: number; // 0, 90, 180, 270
  caption?: string;
}

export interface PrintSettings {
  paperSize: PrintPaperSize;
  orientation: PrintOrientation;
  customWidthCm: number;
  customHeightCm: number;
  marginTopCm: number;
  marginBottomCm: number;
  marginLeftCm: number;
  marginRightCm: number;
  gapCm: number;
  
  layoutMode: PrintLayoutMode;
  preset: PrintPreset;
  itemsPerPage: number;
  customCols: number;
  customRows: number;
  
  fitMode: PrintFitMode;
  
  showFrame: boolean;
  frameWidthPx: number;
  frameColor: string;
  frameRadiusPx: number;
  
  showCropMarks: boolean;
  cropMarksStyle: PrintCropMarksStyle;
  cropMarksColor: string;
  
  showLabels: boolean;
  labelPosition: 'below' | 'inside';
  
  bgColor: string;
}

