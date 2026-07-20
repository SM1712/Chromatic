import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Printer, 
  X, 
  Plus, 
  Trash2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Grid, 
  Layers, 
  Download, 
  Upload, 
  Check, 
  Copy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Scissors,
  Frame
} from 'lucide-react';
import { 
  ImageItem, 
  PrintPaperSize, 
  PrintOrientation, 
  PrintFitMode, 
  PrintLayoutMode, 
  PrintPreset, 
  PrintItem, 
  PrintSettings 
} from '../types';
import './PrintStudioModal.css';

const CM_TO_PX = 37.7952755906; // 96 DPI CSS Pixel Ratio

const PAPER_SIZES: Record<PrintPaperSize, { name: string; w: number; h: number }> = {
  A4: { name: 'A4 (21 x 29.7 cm)', w: 21, h: 29.7 },
  Letter: { name: 'Carta (21.59 x 27.94 cm)', w: 21.59, h: 27.94 },
  Legal: { name: 'Oficio / Legal (21.59 x 35.56 cm)', w: 21.59, h: 35.56 },
  A3: { name: 'A3 (29.7 x 42 cm)', w: 29.7, h: 42.0 },
  A5: { name: 'A5 (14.8 x 21 cm)', w: 14.8, h: 21.0 },
  Photo4x6: { name: 'Foto 4x6" (10x15 cm)', w: 10.16, h: 15.24 },
  Photo5x7: { name: 'Foto 5x7" (13x18 cm)', w: 12.7, h: 17.78 },
  Photo8x10: { name: 'Foto 8x10" (20x25 cm)', w: 20.32, h: 25.4 },
  Passport: { name: 'Hoja Foto Carnet (10x15 cm)', w: 10, h: 15 },
  Custom: { name: 'Personalizado', w: 21, h: 29.7 }
};

interface PrintStudioModalProps {
  isOpen: boolean;
  initialImages: ImageItem[];
  onClose: () => void;
}

export const PrintStudioModal: React.FC<PrintStudioModalProps> = ({
  isOpen,
  initialImages,
  onClose
}) => {
  // Print Items State
  const [printItems, setPrintItems] = useState<PrintItem[]>([]);
  
  // Settings State
  const [settings, setSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    orientation: 'portrait',
    customWidthCm: 21,
    customHeightCm: 29.7,
    marginTopCm: 1.0,
    marginBottomCm: 1.0,
    marginLeftCm: 1.0,
    marginRightCm: 1.0,
    gapCm: 0.3,
    
    layoutMode: 'auto',
    preset: 'grid2x2',
    itemsPerPage: 4,
    customCols: 2,
    customRows: 2,
    
    fitMode: 'cover',
    
    showFrame: false,
    frameWidthPx: 4,
    frameColor: '#1e293b',
    frameRadiusPx: 0,
    
    showCropMarks: true,
    cropMarksStyle: 'corners',
    cropMarksColor: '#000000',
    
    showLabels: false,
    labelPosition: 'below',
    
    bgColor: '#ffffff'
  });

  // Zoom & UI State
  const [zoomLevel, setZoomLevel] = useState<number>(0.75);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Print Items from props
  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      const items: PrintItem[] = initialImages.map(img => ({
        id: `print_${img.id}_${Math.random().toString(36).substring(2, 6)}`,
        src: img.url,
        name: img.name,
        ratio: (img.width && img.height) ? (img.width / img.height) : 1,
        copies: 1,
        rotation: 0
      }));
      setPrintItems(items);
    }
  }, [initialImages]);

  // Update Dynamic CSS Print Page Size Rule
  useEffect(() => {
    let base = PAPER_SIZES[settings.paperSize];
    let wCm = settings.paperSize === 'Custom' ? settings.customWidthCm : base.w;
    let hCm = settings.paperSize === 'Custom' ? settings.customHeightCm : base.h;

    if (settings.orientation === 'landscape') {
      const temp = wCm;
      wCm = hCm;
      hCm = temp;
    }

    let styleTag = document.getElementById('chromaticPrintStyle');
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = 'chromaticPrintStyle';
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = `
      @page {
        size: ${wCm}cm ${hCm}cm;
        margin: 0;
      }
    `;
  }, [settings.paperSize, settings.orientation, settings.customWidthCm, settings.customHeightCm]);

  // Handle Local File Uploads
  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    
    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        const probe = new Image();
        probe.onload = () => {
          setPrintItems(prev => [
            ...prev,
            {
              id: `print_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              src,
              name: file.name,
              ratio: probe.naturalWidth / probe.naturalHeight,
              copies: 1,
              rotation: 0
            }
          ]);
        };
        probe.src = src;
      };
      reader.readAsDataURL(file);
    });
  };

  // Flatten items considering individual copies
  const expandedItems = useMemo(() => {
    const list: PrintItem[] = [];
    printItems.forEach(item => {
      for (let i = 0; i < Math.max(1, item.copies); i++) {
        list.push(item);
      }
    });
    return list;
  }, [printItems]);

  // Calculate Page Dimensions in cm & px
  const pageDimensions = useMemo(() => {
    let base = PAPER_SIZES[settings.paperSize];
    let wCm = settings.paperSize === 'Custom' ? settings.customWidthCm : base.w;
    let hCm = settings.paperSize === 'Custom' ? settings.customHeightCm : base.h;

    if (settings.orientation === 'landscape') {
      const temp = wCm;
      wCm = hCm;
      hCm = temp;
    }

    return {
      wCm,
      hCm,
      wPx: wCm * CM_TO_PX,
      hPx: hCm * CM_TO_PX,
      usableWPx: Math.max(10, (wCm - settings.marginLeftCm - settings.marginRightCm) * CM_TO_PX),
      usableHPx: Math.max(10, (hCm - settings.marginTopCm - settings.marginBottomCm) * CM_TO_PX),
      marginVTopPx: settings.marginTopCm * CM_TO_PX,
      marginHLeftPx: settings.marginLeftCm * CM_TO_PX,
      gapPx: settings.gapCm * CM_TO_PX
    };
  }, [settings]);

  // Compute Grid Layout (cols & rows)
  const layoutInfo = useMemo(() => {
    let cols = 2;
    let rows = 2;

    if (settings.layoutMode === 'preset') {
      switch (settings.preset) {
        case 'single': cols = 1; rows = 1; break;
        case 'grid2x2': cols = 2; rows = 2; break;
        case 'grid3x3': cols = 3; rows = 3; break;
        case 'passport': cols = 2; rows = 4; break;
        case 'contact': cols = 4; rows = 5; break;
        case 'polaroid': cols = 2; rows = 3; break;
      }
    } else if (settings.layoutMode === 'grid') {
      cols = Math.max(1, settings.customCols);
      rows = Math.max(1, settings.customRows);
    } else {
      // Auto Mode: Uniform grid calculation
      const n = Math.max(1, settings.itemsPerPage);
      let best = null;
      const W = pageDimensions.usableWPx;
      const H = pageDimensions.usableHPx;
      const gap = pageDimensions.gapPx;

      for (let c = 1; c <= n; c++) {
        const r = Math.ceil(n / c);
        const cellW = (W - gap * (c - 1)) / c;
        const cellH = (H - gap * (r - 1)) / r;
        if (cellW <= 0 || cellH <= 0) continue;
        const area = cellW * cellH * n;
        if (!best || area > best.area) {
          best = { cols: c, rows: r, area };
        }
      }
      if (best) {
        cols = best.cols;
        rows = best.rows;
      }
    }

    const n = cols * rows;
    const cellW = (pageDimensions.usableWPx - pageDimensions.gapPx * (cols - 1)) / cols;
    const cellH = (pageDimensions.usableHPx - pageDimensions.gapPx * (rows - 1)) / rows;

    const boxes = [];
    for (let i = 0; i < n; i++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const x = c * (cellW + pageDimensions.gapPx);
      const y = r * (cellH + pageDimensions.gapPx);
      boxes.push({ x, y, w: cellW, h: cellH });
    }

    return { cols, rows, capacityPerPage: n, boxes, cellW, cellH };
  }, [settings, pageDimensions]);

  // Total pages required
  const totalPages = useMemo(() => {
    if (expandedItems.length === 0) return 1;
    return Math.max(1, Math.ceil(expandedItems.length / layoutInfo.capacityPerPage));
  }, [expandedItems, layoutInfo.capacityPerPage]);

  // Clamp current page if totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Apply Presets Handler
  const handleSelectPreset = (preset: PrintPreset) => {
    let itemsPP = 4;
    switch (preset) {
      case 'single': itemsPP = 1; break;
      case 'grid2x2': itemsPP = 4; break;
      case 'grid3x3': itemsPP = 9; break;
      case 'passport': itemsPP = 8; break;
      case 'contact': itemsPP = 20; break;
      case 'polaroid': itemsPP = 6; break;
    }
    setSettings(prev => ({
      ...prev,
      layoutMode: 'preset',
      preset,
      itemsPerPage: itemsPP
    }));
  };

  // Item Manipulation Handlers
  const handleRotateItem = (id: string) => {
    setPrintItems(prev => prev.map(item => 
      item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item
    ));
  };

  const handleUpdateCopies = (id: string, delta: number) => {
    setPrintItems(prev => prev.map(item => 
      item.id === id ? { ...item, copies: Math.max(1, item.copies + delta) } : item
    ));
  };

  const handleRemoveItem = (id: string) => {
    setPrintItems(prev => prev.filter(item => item.id !== id));
  };

  // High-Res Image Export (PNG Download)
  const handleExportPNG = async () => {
    const canvas = document.createElement('canvas');
    const scale = 2; // 2x resolution render
    canvas.width = pageDimensions.wPx * scale;
    canvas.height = pageDimensions.hPx * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = settings.bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render current page items onto Canvas
    const startIndex = (currentPage - 1) * layoutInfo.capacityPerPage;
    const pageItems = expandedItems.slice(startIndex, startIndex + layoutInfo.capacityPerPage);

    for (let i = 0; i < pageItems.length; i++) {
      const item = pageItems[i];
      const box = layoutInfo.boxes[i];
      if (!box) continue;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = item.src;
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

      const posX = (pageDimensions.marginHLeftPx + box.x) * scale;
      const posY = (pageDimensions.marginVTopPx + box.y) * scale;
      const boxW = box.w * scale;
      const boxH = box.h * scale;

      ctx.save();
      ctx.beginPath();
      ctx.rect(posX, posY, boxW, boxH);
      ctx.clip();

      if (settings.fitMode === 'cover') {
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const boxRatio = boxW / boxH;
        let renderW = boxW;
        let renderH = boxH;
        let offX = posX;
        let offY = posY;

        if (imgRatio > boxRatio) {
          renderW = boxH * imgRatio;
          offX = posX - (renderW - boxW) / 2;
        } else {
          renderH = boxW / imgRatio;
          offY = posY - (renderH - boxH) / 2;
        }
        ctx.drawImage(img, offX, offY, renderW, renderH);
      } else {
        // Contain mode
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const boxRatio = boxW / boxH;
        let renderW = boxW;
        let renderH = boxH;
        let offX = posX;
        let offY = posY;

        if (imgRatio > boxRatio) {
          renderH = boxW / imgRatio;
          offY = posY + (boxH - renderH) / 2;
        } else {
          renderW = boxH * imgRatio;
          offX = posX + (boxW - renderW) / 2;
        }
        ctx.drawImage(img, offX, offY, renderW, renderH);
      }

      ctx.restore();

      // Draw optional frame
      if (settings.showFrame) {
        ctx.strokeStyle = settings.frameColor;
        ctx.lineWidth = settings.frameWidthPx * scale;
        ctx.strokeRect(posX, posY, boxW, boxH);
      }
    }

    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `Pagina_Impresion_${currentPage}.png`;
    a.click();
  };

  if (!isOpen) return null;

  return (
    <div className="print-studio-backdrop" onClick={(e) => e.stopPropagation()}>
      {/* Header Bar */}
      <header className="print-studio-header">
        <div className="print-studio-title-group">
          <h2>
            <Printer size={20} className="text-indigo-400" />
            Chromatic Print Studio
          </h2>
          <span className="print-badge">
            {expandedItems.length} foto(s) · {totalPages} página(s)
          </span>
        </div>

        <div className="print-studio-header-actions">
          <button 
            className="print-btn-secondary"
            onClick={handleExportPNG}
            title="Exportar la página actual como imagen PNG de alta resolución"
          >
            <Download size={15} />
            Exportar PNG (2X)
          </button>

          <button 
            className="print-btn-primary"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            Imprimir / PDF
          </button>

          <button 
            className="print-icon-btn"
            onClick={onClose}
            title="Cerrar estudio"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="print-studio-body">
        {/* Left Sidebar Controls */}
        <aside className="print-studio-sidebar">
          <div className="print-sidebar-scroll">
            
            {/* Section 1: Papel y Formato */}
            <div className="print-card-section">
              <div className="print-section-header">
                <Layers size={15} />
                Configuración del Papel
              </div>

              <div className="print-field">
                <label>Tamaño de Papel</label>
                <select 
                  className="print-select"
                  value={settings.paperSize}
                  onChange={(e) => setSettings({ ...settings, paperSize: e.target.value as PrintPaperSize })}
                >
                  {Object.entries(PAPER_SIZES).map(([key, info]) => (
                    <option key={key} value={key}>{info.name}</option>
                  ))}
                </select>
              </div>

              <div className="print-field">
                <label>Orientación</label>
                <select 
                  className="print-select"
                  value={settings.orientation}
                  onChange={(e) => setSettings({ ...settings, orientation: e.target.value as PrintOrientation })}
                >
                  <option value="portrait">Vertical (Portrait)</option>
                  <option value="landscape">Horizontal (Landscape)</option>
                </select>
              </div>

              {settings.paperSize === 'Custom' && (
                <div className="print-field">
                  <label>Dimensiones Personalizadas (cm)</label>
                  <div className="print-row-2">
                    <div>
                      <span className="hint">Ancho</span>
                      <input 
                        type="number" 
                        className="print-input" 
                        min="5" 
                        max="100" 
                        step="0.1"
                        value={settings.customWidthCm}
                        onChange={(e) => setSettings({ ...settings, customWidthCm: parseFloat(e.target.value) || 21 })}
                      />
                    </div>
                    <div>
                      <span className="hint">Alto</span>
                      <input 
                        type="number" 
                        className="print-input" 
                        min="5" 
                        max="100" 
                        step="0.1"
                        value={settings.customHeightCm}
                        onChange={(e) => setSettings({ ...settings, customHeightCm: parseFloat(e.target.value) || 29.7 })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="print-field">
                <label>Márgenes de Hoja (cm)</label>
                <div className="print-row-2">
                  <div>
                    <span className="hint">Superior / Inferior</span>
                    <input 
                      type="number" 
                      className="print-input" 
                      min="0" 
                      step="0.1" 
                      value={settings.marginTopCm}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        marginTopCm: parseFloat(e.target.value) || 0,
                        marginBottomCm: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                  <div>
                    <span className="hint">Izquierdo / Derecho</span>
                    <input 
                      type="number" 
                      className="print-input" 
                      min="0" 
                      step="0.1" 
                      value={settings.marginLeftCm}
                      onChange={(e) => setSettings({ 
                        ...settings, 
                        marginLeftCm: parseFloat(e.target.value) || 0,
                        marginRightCm: parseFloat(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="print-field">
                <label>Espacio entre Imágenes (cm)</label>
                <input 
                  type="number" 
                  className="print-input" 
                  min="0" 
                  step="0.05" 
                  value={settings.gapCm}
                  onChange={(e) => setSettings({ ...settings, gapCm: Math.max(0, parseFloat(e.target.value) || 0) })}
                />
              </div>
            </div>

            {/* Section 2: Disposición y Layout */}
            <div className="print-card-section">
              <div className="print-section-header">
                <Grid size={15} />
                Diseño y Distribución
              </div>

              <div className="print-field">
                <label>Presets de Cuadrícula</label>
                <div className="preset-grid">
                  <div 
                    className={`preset-card ${settings.preset === 'single' ? 'active' : ''}`}
                    onClick={() => handleSelectPreset('single')}
                  >
                    <div className="preset-card-title">1 Foto</div>
                    <div className="preset-card-desc">Página Entera</div>
                  </div>

                  <div 
                    className={`preset-card ${settings.preset === 'grid2x2' ? 'active' : ''}`}
                    onClick={() => handleSelectPreset('grid2x2')}
                  >
                    <div className="preset-card-title">2 x 2</div>
                    <div className="preset-card-desc">4 Fotos / Hoja</div>
                  </div>

                  <div 
                    className={`preset-card ${settings.preset === 'grid3x3' ? 'active' : ''}`}
                    onClick={() => handleSelectPreset('grid3x3')}
                  >
                    <div className="preset-card-title">3 x 3</div>
                    <div className="preset-card-desc">9 Fotos / Hoja</div>
                  </div>

                  <div 
                    className={`preset-card ${settings.preset === 'passport' ? 'active' : ''}`}
                    onClick={() => handleSelectPreset('passport')}
                  >
                    <div className="preset-card-title">Fotos Carnet</div>
                    <div className="preset-card-desc">8 Fotos (2x4)</div>
                  </div>
                </div>
              </div>

              <div className="print-field">
                <label>Modo de Grilla</label>
                <select 
                  className="print-select"
                  value={settings.layoutMode}
                  onChange={(e) => setSettings({ ...settings, layoutMode: e.target.value as PrintLayoutMode })}
                >
                  <option value="auto">Automático (Optimizar espacio para N fotos)</option>
                  <option value="grid">Matriz Personalizada (Cols x Rows)</option>
                  <option value="preset">Preset Seleccionado</option>
                </select>
              </div>

              {settings.layoutMode === 'auto' && (
                <div className="print-field">
                  <label>Fotos por Hoja</label>
                  <input 
                    type="number" 
                    className="print-input" 
                    min="1" 
                    max="60" 
                    value={settings.itemsPerPage}
                    onChange={(e) => setSettings({ ...settings, itemsPerPage: Math.max(1, parseInt(e.target.value) || 1) })}
                  />
                </div>
              )}

              {settings.layoutMode === 'grid' && (
                <div className="print-field">
                  <label>Columnas x Filas</label>
                  <div className="print-row-2">
                    <div>
                      <span className="hint">Cols</span>
                      <input 
                        type="number" 
                        className="print-input" 
                        min="1" 
                        max="10" 
                        value={settings.customCols}
                        onChange={(e) => setSettings({ ...settings, customCols: Math.max(1, parseInt(e.target.value) || 1) })}
                      />
                    </div>
                    <div>
                      <span className="hint">Rows</span>
                      <input 
                        type="number" 
                        className="print-input" 
                        min="1" 
                        max="10" 
                        value={settings.customRows}
                        onChange={(e) => setSettings({ ...settings, customRows: Math.max(1, parseInt(e.target.value) || 1) })}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="print-field">
                <label>Ajuste de Imagen (Fit Mode)</label>
                <select 
                  className="print-select"
                  value={settings.fitMode}
                  onChange={(e) => setSettings({ ...settings, fitMode: e.target.value as PrintFitMode })}
                >
                  <option value="cover">Recortar para Llenar Celda (Cover)</option>
                  <option value="contain">Ajustar Foto Entera (Contain)</option>
                </select>
              </div>
            </div>

            {/* Section 3: Acabado y Guías de Corte */}
            <div className="print-card-section">
              <div className="print-section-header">
                <Scissors size={15} />
                Guías de Corte y Marcos
              </div>

              <div className="print-switch-row" onClick={() => setSettings({ ...settings, showCropMarks: !settings.showCropMarks })}>
                <label>Marcas de Corte (Esquinas)</label>
                <div className={`switch-track ${settings.showCropMarks ? 'active' : ''}`}>
                  <div className="switch-thumb" />
                </div>
              </div>

              <div className="print-switch-row" onClick={() => setSettings({ ...settings, showFrame: !settings.showFrame })}>
                <label>Agregar Marco a las Fotos</label>
                <div className={`switch-track ${settings.showFrame ? 'active' : ''}`}>
                  <div className="switch-thumb" />
                </div>
              </div>

              {settings.showFrame && (
                <div style={{ marginTop: '10px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                  <div className="print-field">
                    <label>Grosor del Marco (px)</label>
                    <input 
                      type="number" 
                      className="print-input" 
                      min="1" 
                      max="30" 
                      value={settings.frameWidthPx}
                      onChange={(e) => setSettings({ ...settings, frameWidthPx: parseInt(e.target.value) || 1 })}
                    />
                  </div>

                  <div className="print-field" style={{ marginBottom: 0 }}>
                    <label>Color del Marco</label>
                    <input 
                      type="color" 
                      style={{ width: '100%', height: '36px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', background: 'var(--bg-surface)' }}
                      value={settings.frameColor}
                      onChange={(e) => setSettings({ ...settings, frameColor: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="print-switch-row" onClick={() => setSettings({ ...settings, showLabels: !settings.showLabels })} style={{ marginTop: '4px' }}>
                <label>Mostrar Nombre de Imagen</label>
                <div className={`switch-track ${settings.showLabels ? 'active' : ''}`}>
                  <div className="switch-thumb" />
                </div>
              </div>
            </div>

            {/* Section 4: Imágenes y Copias */}
            <div className="print-card-section">
              <div className="print-section-header">
                <Copy size={15} />
                Gestión de Fotos ({printItems.length})
              </div>

              <input 
                type="file" 
                ref={fileInputRef}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleAddFiles(e.target.files)}
              />

              <div className="print-row-2" style={{ marginBottom: '12px' }}>
                <button 
                  className="print-btn-secondary" 
                  style={{ width: '100%', fontSize: '12px' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={13} />
                  Subir Fotos
                </button>
                <button 
                  className="print-btn-danger" 
                  style={{ width: '100%', fontSize: '12px' }}
                  onClick={() => setPrintItems([])}
                >
                  <Trash2 size={13} />
                  Vaciar Todo
                </button>
              </div>

              <div className="image-list-container">
                {printItems.map((item) => (
                  <div key={item.id} className="image-list-item">
                    <img src={item.src} alt={item.name} className="image-list-thumb" />
                    <div className="image-list-info">
                      <div className="image-list-name">{item.name}</div>
                      <div className="image-list-meta">{item.copies} copia(s)</div>
                    </div>
                    <div className="image-list-actions">
                      <button 
                        className="mini-icon-btn" 
                        onClick={() => handleRotateItem(item.id)}
                        title="Rotar 90°"
                      >
                        <RotateCw size={12} />
                      </button>
                      <button 
                        className="mini-icon-btn" 
                        onClick={() => handleUpdateCopies(item.id, -1)}
                        title="Restar copia"
                      >
                        -
                      </button>
                      <button 
                        className="mini-icon-btn" 
                        onClick={() => handleUpdateCopies(item.id, 1)}
                        title="Sumar copia"
                      >
                        +
                      </button>
                      <button 
                        className="mini-icon-btn" 
                        style={{ color: '#f87171' }}
                        onClick={() => handleRemoveItem(item.id)}
                        title="Quitar"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Main Stage View Area */}
        <main 
          className="print-stage-area"
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length) {
              handleAddFiles(e.dataTransfer.files);
            }
          }}
        >
          {isDragOver && (
            <div className="print-drop-overlay">
              <Upload size={48} />
              <h3>Suelta las imágenes aquí para añadirlas a la hoja</h3>
            </div>
          )}

          {/* Stage Controls & Pagination Toolbar */}
          <div className="stage-toolbar">
            <button 
              className="mini-icon-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft size={16} />
            </button>

            <span className="stage-page-counter">
              Página {currentPage} de {totalPages}
            </span>

            <button 
              className="mini-icon-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              <ChevronRight size={16} />
            </button>

            <div className="stage-zoom-controls">
              <button 
                className="mini-icon-btn" 
                onClick={() => setZoomLevel(prev => Math.max(0.3, prev - 0.1))}
                title="Alejar"
              >
                <ZoomOut size={14} />
              </button>
              <span style={{ fontSize: '11px', color: '#94a3b8', minWidth: '36px', textAlign: 'center' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                className="mini-icon-btn" 
                onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
                title="Acercar"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                className="mini-icon-btn" 
                onClick={() => setZoomLevel(0.75)}
                title="Restablecer Zoom"
              >
                <Maximize2 size={13} />
              </button>
            </div>
          </div>

          {/* Render All Printed Sheets Container */}
          <div 
            className="print-sheet-wrapper"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {Array.from({ length: totalPages }).map((_, pageIndex) => {
              // Show only current page in interactive UI view, but render all in window.print()
              const isCurrent = (pageIndex + 1) === currentPage;
              const startIndex = pageIndex * layoutInfo.capacityPerPage;
              const pageItems = expandedItems.slice(startIndex, startIndex + layoutInfo.capacityPerPage);

              return (
                <div 
                  key={pageIndex}
                  className="print-sheet"
                  style={{
                    width: `${pageDimensions.wPx}px`,
                    height: `${pageDimensions.hPx}px`,
                    padding: `${pageDimensions.marginVTopPx}px ${pageDimensions.marginHLeftPx}px`,
                    backgroundColor: settings.bgColor,
                    display: isCurrent ? 'block' : 'none' // In screen mode show current page, in CSS print all pages are shown
                  }}
                >
                  <div className="print-sheet-grid">
                    {Array.from({ length: layoutInfo.capacityPerPage }).map((_, i) => {
                      const box = layoutInfo.boxes[i];
                      const item = pageItems[i];

                      return (
                        <div 
                          key={i} 
                          className="print-cell"
                          style={{
                            left: `${box.x}px`,
                            top: `${box.y}px`,
                            width: `${box.w}px`,
                            height: `${box.h}px`
                          }}
                        >
                          {/* Corner Crop Marks */}
                          {settings.showCropMarks && (
                            <>
                              <div className="crop-mark crop-mark-tl" />
                              <div className="crop-mark crop-mark-tr" />
                              <div className="crop-mark crop-mark-bl" />
                              <div className="crop-mark crop-mark-br" />
                            </>
                          )}

                          {item ? (
                            <div 
                              className="print-cell-frame"
                              style={{
                                border: settings.showFrame ? `${settings.frameWidthPx}px solid ${settings.frameColor}` : 'none',
                                borderRadius: `${settings.frameRadiusPx}px`
                              }}
                            >
                              <img 
                                src={item.src} 
                                alt={item.name} 
                                className={`print-cell-img fit-${settings.fitMode}`}
                                style={{
                                  transform: `rotate(${item.rotation}deg)`
                                }}
                              />
                              {settings.showLabels && (
                                <div className="print-cell-label">{item.name}</div>
                              )}
                            </div>
                          ) : (
                            <div className="print-cell-placeholder">
                              <span style={{ fontSize: '14px', fontWeight: 600 }}>{i + 1}</span>
                              <span style={{ fontSize: '10px' }}>Espacio Vacío</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};
