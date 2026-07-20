import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Undo2,
  Eye,
  Download,
  Copy,
  Sliders,
  Sparkles,
  Pencil,
  Eraser,
  Type,
  Frame as FrameIcon,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Check,
  Sticker,
  Square,
  Circle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { ImageItem } from '../types';
import './ImageEditorModal.css';

interface ImageEditorModalProps {
  image: ImageItem;
  onClose: () => void;
  onSave: (newImageDataUrl: string, isCopy: boolean) => void;
}

type TabType = 'filters' | 'adjustments' | 'brush' | 'text' | 'frames' | 'shapes' | 'transform';

interface FilterOption {
  id: string;
  name: string;
  filterCss: string;
}

const FILTERS: FilterOption[] = [
  { id: 'none', name: 'Original', filterCss: 'none' },
  { id: 'bw', name: 'B & N', filterCss: 'grayscale(100%)' },
  { id: 'sepia', name: 'Sepia', filterCss: 'sepia(80%)' },
  { id: 'cyberpunk', name: 'Cyberpunk', filterCss: 'contrast(130%) hue-rotate(180deg) saturate(150%)' },
  { id: 'warm', name: 'Cálido', filterCss: 'sepia(30%) saturate(140%) brightness(105%)' },
  { id: 'cool', name: 'Frío', filterCss: 'hue-rotate(180deg) brightness(105%) saturate(110%)' },
  { id: 'dramatic', name: 'Dramático', filterCss: 'contrast(150%) saturate(120%) brightness(90%)' },
  { id: 'soft', name: 'Suave', filterCss: 'brightness(110%) contrast(90%) saturate(120%)' },
  { id: 'noir', name: 'Noir', filterCss: 'grayscale(100%) contrast(180%) brightness(85%)' },
  { id: 'invert', name: 'Invertido', filterCss: 'invert(100%)' },
];

const FRAME_STYLES = [
  { id: 'none', name: 'Sin Marco' },
  { id: 'polaroid', name: 'Polaroid' },
  { id: 'dark', name: 'Oscuro Elegante' },
  { id: 'gold', name: 'Dorado Lujo' },
  { id: 'neon', name: 'Neón Cyber' },
  { id: 'glass', name: 'Borde Vidrio' },
  { id: 'rounded', name: 'Redondeado' },
];

const STICKERS = ['📸', '❤️', '✨', '🌟', '🔥', '🎨', '🚀', '⭐', '🌈', '🌸', '💬', '🎉', '💡', '🏆', '🎯', '⚡'];

export interface OverlayElement {
  id: string;
  kind: 'text' | 'sticker' | 'shape';
  text?: string;
  stickerChar?: string;
  shapeType?: 'rectangle' | 'circle';
  x: number; // Left position
  y: number; // Top position
  width: number;
  height: number;
  color: string;
  bgColor?: string;
  fontSize?: number;
  fontFamily?: string;
  isBold?: boolean;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  image,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('filters');

  // Canvas & Image references
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loadedImage, setLoadedImage] = useState<HTMLImageElement | null>(null);

  // Filters & Adjustments
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [vignette, setVignette] = useState(0);

  // Brush state
  const [brushMode, setBrushMode] = useState<'pen' | 'neon' | 'highlighter' | 'eraser'>('pen');
  const [brushColor, setBrushColor] = useState('#1a73e8');
  const [brushSize, setBrushSize] = useState(8);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [isDrawing, setIsDrawing] = useState(false);

  // Text Form State
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBgColor, setTextBgColor] = useState('transparent');
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [isBold, setIsBold] = useState(false);

  // Unified Overlay Elements
  const [elements, setElements] = useState<OverlayElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Synchronous Ref for Rock-Solid Dragging and Resizing (No React State Lag!)
  const interactionRef = useRef<{
    mode: 'none' | 'drag' | 'resize';
    elementId: string | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialW: number;
    initialH: number;
    initialFontSize: number;
  }>({
    mode: 'none',
    elementId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialW: 0,
    initialH: 0,
    initialFontSize: 0
  });

  // Frame
  const [frameStyle, setFrameStyle] = useState<string>('none');
  const [frameColor, setFrameColor] = useState('#ffffff');

  // Transform
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Compare original state
  const [isComparing, setIsComparing] = useState(false);

  // Selected Element Reference
  const selectedElement = elements.find(el => el.id === selectedId);

  // Load Image on Mount & setup offscreen drawing canvas
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.url;
    img.onload = () => {
      setLoadedImage(img);

      const offCanvas = document.createElement('canvas');
      offCanvas.width = img.width;
      offCanvas.height = img.height;
      drawingCanvasRef.current = offCanvas;
    };
  }, [image.url]);

  // Keep form inputs synced when selecting an element
  useEffect(() => {
    if (selectedElement && selectedElement.kind === 'text') {
      setTextInput(selectedElement.text || '');
      setTextColor(selectedElement.color);
      setTextBgColor(selectedElement.bgColor || 'transparent');
      setFontSize(selectedElement.fontSize || 36);
      setFontFamily(selectedElement.fontFamily || 'sans-serif');
      setIsBold(!!selectedElement.isBold);
    }
  }, [selectedId]);

  // Redraw Main Canvas whenever controls or overlays change
  useEffect(() => {
    if (!loadedImage || !mainCanvasRef.current) return;
    renderCanvas();
  }, [
    loadedImage,
    selectedFilter,
    brightness,
    contrast,
    saturate,
    hue,
    blur,
    vignette,
    frameStyle,
    frameColor,
    rotation,
    flipH,
    flipV,
    elements,
    selectedId,
    isComparing
  ]);

  const renderCanvas = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas || !loadedImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isRotated90 = (rotation / 90) % 2 !== 0;
    const imgW = loadedImage.width;
    const imgH = loadedImage.height;

    // Frame padding calculation
    const framePadding = frameStyle !== 'none' && !isComparing ? Math.min(imgW, imgH) * 0.05 : 0;
    const bottomPadding = frameStyle === 'polaroid' && !isComparing ? framePadding * 3.5 : framePadding;

    const contentW = isRotated90 ? imgH : imgW;
    const contentH = isRotated90 ? imgW : imgH;

    const canvasW = contentW + framePadding * 2;
    const canvasH = contentH + framePadding + bottomPadding;

    canvas.width = canvasW;
    canvas.height = canvasH;

    ctx.clearRect(0, 0, canvasW, canvasH);

    // 1. DRAW FRAME BACKGROUND
    if (frameStyle !== 'none' && !isComparing) {
      drawFrameBackground(ctx, canvasW, canvasH, framePadding, bottomPadding);
    }

    // 2. DRAW MAIN IMAGE (With Rotations & Filters)
    ctx.save();
    const centerX = framePadding + contentW / 2;
    const centerY = framePadding + contentH / 2;
    ctx.translate(centerX, centerY);

    if (!isComparing) {
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    }

    if (!isComparing) {
      let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hue}deg) blur(${blur}px)`;
      const activeFilterObj = FILTERS.find(f => f.id === selectedFilter);
      if (activeFilterObj && activeFilterObj.filterCss !== 'none') {
        filterString += ` ${activeFilterObj.filterCss}`;
      }
      ctx.filter = filterString;
    } else {
      ctx.filter = 'none';
    }

    ctx.drawImage(loadedImage, -imgW / 2, -imgH / 2, imgW, imgH);

    // 3. DRAW PERSISTENT FREEHAND DRAWINGS
    if (drawingCanvasRef.current && !isComparing) {
      ctx.drawImage(drawingCanvasRef.current, -imgW / 2, -imgH / 2, imgW, imgH);
    }

    ctx.restore();
    ctx.filter = 'none';

    // 4. DRAW VIGNETTE OVERLAY
    if (vignette > 0 && !isComparing) {
      const grad = ctx.createRadialGradient(
        canvasW / 2,
        canvasH / 2,
        Math.min(canvasW, canvasH) * 0.3,
        canvasW / 2,
        canvasH / 2,
        Math.max(canvasW, canvasH) * 0.75
      );
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.85})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // 5. DRAW FRAME OVERLAY BORDERS
    if (frameStyle !== 'none' && !isComparing) {
      drawFrameOverlay(ctx, canvasW, canvasH, framePadding, bottomPadding);
    }

    // 6. DRAW INTERACTIVE OVERLAY ELEMENTS (TEXT, STICKERS, SHAPES)
    if (!isComparing) {
      elements.forEach(el => {
        ctx.save();

        if (el.kind === 'shape') {
          ctx.fillStyle = el.color;
          ctx.strokeStyle = el.color;
          ctx.lineWidth = 3;
          if (el.shapeType === 'rectangle') {
            ctx.fillRect(el.x, el.y, el.width, el.height);
          } else if (el.shapeType === 'circle') {
            ctx.beginPath();
            ctx.arc(el.x + el.width / 2, el.y + el.height / 2, el.width / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (el.kind === 'sticker' && el.stickerChar) {
          // Centered Sticker Emoji rendering inside bounding box
          const emojiSize = Math.min(el.width, el.height) * 0.8;
          ctx.font = `${emojiSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(el.stickerChar, el.x + el.width / 2, el.y + el.height / 2);
        } else if (el.kind === 'text' && el.text) {
          const fontSz = el.fontSize || 36;
          ctx.font = `${el.isBold ? 'bold ' : ''}${fontSz}px ${el.fontFamily || 'sans-serif'}`;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';

          // Measure text width/height
          const metrics = ctx.measureText(el.text);
          const measuredW = metrics.width;
          const measuredH = fontSz * 1.15;

          el.width = Math.max(el.width, measuredW + 24);
          el.height = Math.max(el.height, measuredH + 8);

          if (el.bgColor && el.bgColor !== 'transparent') {
            ctx.fillStyle = el.bgColor;
            ctx.fillRect(el.x, el.y, el.width, el.height);
          }

          ctx.fillStyle = el.color;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillText(el.text, el.x + 12, el.y + 4);
        }

        // 7. DRAW PERFECT SELECTION BOX & ACCURATE CORNER HANDLES
        if (el.id === selectedId) {
          // Bounding Box
          ctx.strokeStyle = '#1a73e8';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 4]);
          ctx.strokeRect(el.x, el.y, el.width, el.height);
          ctx.setLineDash([]);

          // Bottom-Right Corner Resize Handle [⤡]
          const resX = el.x + el.width;
          const resY = el.y + el.height;
          ctx.fillStyle = '#1a73e8';
          ctx.beginPath();
          ctx.arc(resX, resY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Top-Right Corner Delete Handle [✕] (Prominent Red Badge)
          const delX = el.x + el.width;
          const delY = el.y;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(delX, delY, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 15px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✕', delX, delY);
        }

        ctx.restore();
      });
    }
  };

  // Frame Background
  const drawFrameBackground = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    pad: number,
    bPad: number
  ) => {
    ctx.save();
    if (frameStyle === 'polaroid') {
      ctx.fillStyle = frameColor || '#ffffff';
      ctx.fillRect(0, 0, w, h);
    } else if (frameStyle === 'dark') {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
    } else if (frameStyle === 'gold') {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.5, '#fef08a');
      grad.addColorStop(1, '#b45309');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else if (frameStyle === 'neon') {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, w, h);
    } else if (frameStyle === 'glass') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, w, h);
    } else if (frameStyle === 'rounded') {
      ctx.fillStyle = frameColor || '#ffffff';
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  };

  // Frame Overlay Border
  const drawFrameOverlay = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    pad: number,
    bPad: number
  ) => {
    ctx.save();
    if (frameStyle === 'polaroid') {
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 2;
      ctx.strokeRect(pad, pad, w - pad * 2, h - pad - bPad);
    } else if (frameStyle === 'neon') {
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = Math.max(8, pad * 0.4);
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 18;
      ctx.strokeRect(pad / 2, pad / 2, w - pad, h - (pad + bPad) / 2);
    } else if (frameStyle === 'gold') {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.strokeRect(pad, pad, w - pad * 2, h - pad - bPad);
    } else if (frameStyle === 'glass') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 4;
      ctx.strokeRect(pad / 2, pad / 2, w - pad, h - (pad + bPad) / 2);
    } else if (frameStyle === 'rounded') {
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      ctx.strokeRect(pad, pad, w - pad * 2, h - pad - bPad);
    }
    ctx.restore();
  };

  // Convert Mouse Coordinates to Canvas Coordinates
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas || !loadedImage) return { x: 0, y: 0, drawX: 0, drawY: 0 };

    const rect = mainCanvas.getBoundingClientRect();
    const scaleX = mainCanvas.width / rect.width;
    const scaleY = mainCanvas.height / rect.height;

    const rawCanvasX = (e.clientX - rect.left) * scaleX;
    const rawCanvasY = (e.clientY - rect.top) * scaleY;

    // Drawing coordinates (accounting for transforms)
    const isRotated90 = (rotation / 90) % 2 !== 0;
    const imgW = loadedImage.width;
    const imgH = loadedImage.height;

    const framePadding = frameStyle !== 'none' ? Math.min(imgW, imgH) * 0.05 : 0;
    const contentW = isRotated90 ? imgH : imgW;
    const contentH = isRotated90 ? imgW : imgH;

    const centerX = framePadding + contentW / 2;
    const centerY = framePadding + contentH / 2;

    let relX = rawCanvasX - centerX;
    let relY = rawCanvasY - centerY;

    const rad = (-rotation * Math.PI) / 180;
    const unrotX = relX * Math.cos(rad) - relY * Math.sin(rad);
    const unrotY = relX * Math.sin(rad) + relY * Math.cos(rad);

    const drawX = (flipH ? -unrotX : unrotX) + imgW / 2;
    const drawY = (flipV ? -unrotY : unrotY) + imgH / 2;

    return { x: rawCanvasX, y: rawCanvasY, drawX, drawY };
  };

  // --- MOUSE / INTERACTION HANDLERS ---
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, drawX, drawY } = getCanvasCoords(e);

    // BRUSH MODE: Freehand painting
    if (activeTab === 'brush') {
      if (!drawingCanvasRef.current) return;
      setIsDrawing(true);
      const dCtx = drawingCanvasRef.current.getContext('2d');
      if (dCtx) {
        dCtx.beginPath();
        dCtx.moveTo(drawX, drawY);
      }
      return;
    }

    // OVERLAY INTERACTION MODE: Hit test currently selected element's handles FIRST!
    if (selectedId) {
      const sel = elements.find(el => el.id === selectedId);
      if (sel) {
        // 1. Check Delete Badge (Top-Right: sel.x + sel.width, sel.y)
        const delX = sel.x + sel.width;
        const delY = sel.y;
        if (Math.hypot(x - delX, y - delY) <= 24) {
          handleDeleteElement(sel.id);
          return;
        }

        // 2. Check Resize Handle (Bottom-Right: sel.x + sel.width, sel.y + sel.height)
        const resX = sel.x + sel.width;
        const resY = sel.y + sel.height;
        if (Math.hypot(x - resX, y - resY) <= 24) {
          interactionRef.current = {
            mode: 'resize',
            elementId: sel.id,
            startX: x,
            startY: y,
            initialX: sel.x,
            initialY: sel.y,
            initialW: sel.width,
            initialH: sel.height,
            initialFontSize: sel.fontSize || 36
          };
          return;
        }
      }
    }

    // 3. Check Hit on Any Overlay Element Bounding Box
    const clickedElement = [...elements].reverse().find(el => {
      return (
        x >= el.x &&
        x <= el.x + el.width &&
        y >= el.y &&
        y <= el.y + el.height
      );
    });

    if (clickedElement) {
      setSelectedId(clickedElement.id);
      interactionRef.current = {
        mode: 'drag',
        elementId: clickedElement.id,
        startX: x,
        startY: y,
        initialX: clickedElement.x,
        initialY: clickedElement.y,
        initialW: clickedElement.width,
        initialH: clickedElement.height,
        initialFontSize: clickedElement.fontSize || 36
      };
      return;
    }

    // 4. Clicked Empty Canvas Space:
    if (activeTab === 'text' && textInput.trim()) {
      const newText: OverlayElement = {
        id: `txt_${Date.now()}`,
        kind: 'text',
        text: textInput.trim(),
        x: x - 20,
        y: y - 20,
        width: 120,
        height: fontSize + 12,
        color: textColor,
        bgColor: textBgColor,
        fontSize,
        fontFamily,
        isBold
      };
      setElements(prev => [...prev, newText]);
      setSelectedId(newText.id);
      setTextInput('');
      return;
    }

    // Otherwise deselect
    setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, drawX, drawY } = getCanvasCoords(e);

    // BRUSH DRAWING
    if (isDrawing && activeTab === 'brush' && drawingCanvasRef.current) {
      const dCtx = drawingCanvasRef.current.getContext('2d');
      if (!dCtx) return;

      dCtx.save();
      if (brushMode === 'eraser') {
        dCtx.globalCompositeOperation = 'destination-out';
        dCtx.arc(drawX, drawY, brushSize * 1.5, 0, Math.PI * 2);
        dCtx.fill();
      } else {
        dCtx.globalCompositeOperation = 'source-over';
        dCtx.lineCap = 'round';
        dCtx.lineJoin = 'round';
        dCtx.lineWidth = brushSize;
        dCtx.strokeStyle = brushColor;
        dCtx.globalAlpha = brushOpacity / 100;

        if (brushMode === 'neon') {
          dCtx.shadowColor = brushColor;
          dCtx.shadowBlur = 12;
        } else if (brushMode === 'highlighter') {
          dCtx.globalAlpha = 0.35;
          dCtx.lineWidth = brushSize * 2.2;
        }

        dCtx.lineTo(drawX, drawY);
        dCtx.stroke();
      }
      dCtx.restore();
      renderCanvas();
      return;
    }

    // INTERACTION MODE: DRAG
    if (interactionRef.current.mode === 'drag' && interactionRef.current.elementId) {
      const deltaX = x - interactionRef.current.startX;
      const deltaY = y - interactionRef.current.startY;
      const elId = interactionRef.current.elementId;
      const initX = interactionRef.current.initialX;
      const initY = interactionRef.current.initialY;

      setElements(prev =>
        prev.map(el => {
          if (el.id !== elId) return el;
          return {
            ...el,
            x: initX + deltaX,
            y: initY + deltaY
          };
        })
      );
      return;
    }

    // INTERACTION MODE: RESIZE
    if (interactionRef.current.mode === 'resize' && interactionRef.current.elementId) {
      const deltaX = x - interactionRef.current.startX;
      const deltaY = y - interactionRef.current.startY;
      const delta = Math.max(deltaX, deltaY);
      const elId = interactionRef.current.elementId;

      const initW = interactionRef.current.initialW;
      const initH = interactionRef.current.initialH;
      const initFont = interactionRef.current.initialFontSize;

      setElements(prev =>
        prev.map(el => {
          if (el.id !== elId) return el;

          const newW = Math.max(30, initW + delta);
          const newH = Math.max(30, initH + delta);
          const newFontSz = Math.max(14, Math.round(initFont * (newW / initW)));

          return {
            ...el,
            width: newW,
            height: newH,
            fontSize: newFontSz
          };
        })
      );
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    interactionRef.current.mode = 'none';
  };

  // Add Sticker
  const handleAddSticker = (emoji: string) => {
    const canvas = mainCanvasRef.current;
    const cx = canvas ? canvas.width / 2 - 40 : 150;
    const cy = canvas ? canvas.height / 2 - 40 : 150;

    const newSticker: OverlayElement = {
      id: `stk_${Date.now()}`,
      kind: 'sticker',
      stickerChar: emoji,
      x: cx,
      y: cy,
      width: 80,
      height: 80,
      color: '#ffffff'
    };

    setElements(prev => [...prev, newSticker]);
    setSelectedId(newSticker.id);
    setActiveTab('shapes');
  };

  // Add Shape
  const handleAddShape = (shapeType: 'rectangle' | 'circle') => {
    const canvas = mainCanvasRef.current;
    const cx = canvas ? canvas.width / 2 - 60 : 100;
    const cy = canvas ? canvas.height / 2 - 60 : 100;

    const newShape: OverlayElement = {
      id: `shp_${Date.now()}`,
      kind: 'shape',
      shapeType,
      x: cx,
      y: cy,
      width: 120,
      height: 120,
      color: brushColor
    };

    setElements(prev => [...prev, newShape]);
    setSelectedId(newShape.id);
  };

  // Copy / Paste Clipboard reference with paste counter
  const copiedElementRef = useRef<{ element: OverlayElement; count: number } | null>(null);

  const handleCopyElement = () => {
    if (!selectedId) return;
    const elToCopy = elements.find(el => el.id === selectedId);
    if (elToCopy) {
      copiedElementRef.current = {
        element: { ...elToCopy },
        count: 0
      };
    }
  };

  const handlePasteElement = () => {
    if (!copiedElementRef.current) return;
    copiedElementRef.current.count += 1;
    const { element: src, count } = copiedElementRef.current;
    
    // Spread subsequent pastes diagonally by 25px steps
    const offset = count * 25;
    const pasted: OverlayElement = {
      ...src,
      id: `${src.kind}_pasted_${Date.now()}_${count}`,
      x: src.x + offset,
      y: src.y + offset
    };

    setElements(prev => [...prev, pasted]);
    setSelectedId(pasted.id);
  };

  // Keyboard Shortcuts for Ctrl+C, Ctrl+V, Delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT'
      );

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        if (!isTyping && selectedId) {
          e.preventDefault();
          handleCopyElement();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        if (!isTyping && copiedElementRef.current) {
          e.preventDefault();
          handlePasteElement();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isTyping && selectedId) {
          e.preventDefault();
          handleDeleteElement(selectedId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements]);

  // Delete Element
  const handleDeleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  // Update Selected Element Properties
  const updateSelectedElement = (partial: Partial<OverlayElement>) => {
    if (!selectedId) return;
    setElements(prev =>
      prev.map(el => (el.id === selectedId ? { ...el, ...partial } : el))
    );
  };

  // Clear all freehand drawings
  const handleClearDrawings = () => {
    if (drawingCanvasRef.current) {
      const dCtx = drawingCanvasRef.current.getContext('2d');
      if (dCtx) {
        dCtx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
        renderCanvas();
      }
    }
  };

  const handleUndo = () => {
    if (elements.length > 0) {
      setElements(prev => prev.slice(0, -1));
      setSelectedId(null);
    } else {
      handleClearDrawings();
    }
  };

  const resetAllAdjustments = () => {
    setSelectedFilter('none');
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setHue(0);
    setBlur(0);
    setVignette(0);
    setFrameStyle('none');
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setElements([]);
    setSelectedId(null);
    handleClearDrawings();
  };

  // Export handlers
  const handleSaveCopy = () => {
    setSelectedId(null);
    setTimeout(() => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl, true);
    }, 50);
  };

  const handleOverwrite = () => {
    setSelectedId(null);
    setTimeout(() => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl, false);
    }, 50);
  };

  const handleDownload = () => {
    setSelectedId(null);
    setTimeout(() => {
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `chromatic_edited_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }, 50);
  };

  return (
    <div className="editor-backdrop animate-fade-in">
      {/* Top Header Toolbar */}
      <header className="editor-header">
        <div className="editor-title-group">
          <span className="editor-badge">Editor Chromatic</span>
          <h2 className="editor-filename">{image.name}</h2>
        </div>

        <div className="editor-header-controls">
          <button
            className="editor-btn-secondary"
            onMouseDown={() => setIsComparing(true)}
            onMouseUp={() => setIsComparing(false)}
            onMouseLeave={() => setIsComparing(false)}
            title="Mantener presionado para ver la foto original"
          >
            <Eye size={16} />
            <span>Ver Original</span>
          </button>

          <button
            className="editor-btn-icon"
            onClick={resetAllAdjustments}
            title="Restablecer todo"
          >
            <RefreshCw size={18} />
          </button>

          <button
            className="editor-btn-icon"
            onClick={handleUndo}
            title="Deshacer elemento"
          >
            <Undo2 size={18} />
          </button>

          <div className="editor-divider" />

          <button className="editor-btn-secondary" onClick={handleDownload} title="Descargar PNG">
            <Download size={16} />
            <span>Descargar</span>
          </button>

          <button className="editor-btn-secondary" onClick={handleSaveCopy} title="Guardar como nueva foto">
            <Copy size={16} />
            <span>Guardar Copia</span>
          </button>

          <button className="editor-btn-primary" onClick={handleOverwrite} title="Sobrescribir foto en la galería">
            <Check size={16} />
            <span>Guardar</span>
          </button>

          <button className="editor-btn-close" onClick={onClose} title="Cerrar editor">
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Studio Area */}
      <div className="editor-body">
        {/* Canvas Display Stage */}
        <div className="editor-canvas-stage">
          <canvas
            ref={mainCanvasRef}
            className={`editor-canvas ${activeTab === 'brush' ? 'drawing-mode' : ''} ${activeTab === 'text' || activeTab === 'shapes' ? 'clickable-mode' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Right Tool Inspector Panel */}
        <aside className="editor-inspector animate-slide-left">
          {/* Tool Selector Tabs */}
          <nav className="inspector-tabs">
            <button
              className={`tab-btn ${activeTab === 'filters' ? 'active' : ''}`}
              onClick={() => setActiveTab('filters')}
            >
              <Sparkles size={18} />
              <span>Filtros</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'adjustments' ? 'active' : ''}`}
              onClick={() => setActiveTab('adjustments')}
            >
              <Sliders size={18} />
              <span>Ajustes</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'brush' ? 'active' : ''}`}
              onClick={() => setActiveTab('brush')}
            >
              <Pencil size={18} />
              <span>Dibujar</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              <Type size={18} />
              <span>Texto</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'shapes' ? 'active' : ''}`}
              onClick={() => setActiveTab('shapes')}
            >
              <Sticker size={18} />
              <span>Stickers</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'frames' ? 'active' : ''}`}
              onClick={() => setActiveTab('frames')}
            >
              <FrameIcon size={18} />
              <span>Marcos</span>
            </button>

            <button
              className={`tab-btn ${activeTab === 'transform' ? 'active' : ''}`}
              onClick={() => setActiveTab('transform')}
            >
              <RotateCw size={18} />
              <span>Rotar</span>
            </button>
          </nav>

          {/* Tool Content Views */}
          <div className="inspector-content">
            {/* LIVE INSPECTOR EDIT PANEL FOR SELECTED ELEMENT */}
            {selectedElement && (
              <div className="selected-element-box animate-scale-up">
                <div className="box-header-row">
                  <span className="box-badge">
                    {selectedElement.kind === 'text' ? '📝 Texto Seleccionado' : selectedElement.kind === 'sticker' ? '🎨 Sticker Seleccionado' : '🔳 Forma Seleccionada'}
                  </span>
                  <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                    <button className="option-btn" onClick={handleCopyElement} title="Copiar elemento (Ctrl + C)">
                      <Copy size={13} /> Copiar
                    </button>
                    <button className="option-btn" onClick={handlePasteElement} title="Pegar elemento (Ctrl + V)">
                      <Copy size={13} /> Pegar
                    </button>
                    <button className="text-action-btn" onClick={() => handleDeleteElement(selectedElement.id)} title="Eliminar elemento (Delete)">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Edit Text String */}
                {selectedElement.kind === 'text' && (
                  <div className="form-group" style={{ marginTop: '0.5rem' }}>
                    <label className="section-label">Editar Contenido del Texto</label>
                    <input
                      type="text"
                      value={selectedElement.text || ''}
                      onChange={e => {
                        updateSelectedElement({ text: e.target.value });
                        setTextInput(e.target.value);
                      }}
                      className="text-input-field"
                    />
                  </div>
                )}

                {/* Resize / Scale Slider */}
                <div className="slider-group">
                  <div className="slider-header">
                    <label>Tamaño / Escala</label>
                    <span>{selectedElement.kind === 'text' ? `${selectedElement.fontSize || 36}px` : `${Math.round(selectedElement.width)}px`}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="220"
                    value={selectedElement.kind === 'text' ? selectedElement.fontSize || 36 : selectedElement.width}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (selectedElement.kind === 'text') {
                        updateSelectedElement({ fontSize: val });
                      } else {
                        updateSelectedElement({ width: val, height: val });
                      }
                    }}
                  />
                </div>

                {/* Change Color */}
                <div className="color-section">
                  <label className="section-label">Color del Elemento</label>
                  <div className="color-swatches">
                    {['#ffffff', '#000000', '#1a73e8', '#ef4444', '#f59e0b', '#10b981', '#ec4899'].map(c => (
                      <button
                        key={c}
                        className={`color-swatch ${selectedElement.color === c ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => updateSelectedElement({ color: c })}
                      />
                    ))}
                    <input
                      type="color"
                      value={selectedElement.color}
                      onChange={e => updateSelectedElement({ color: e.target.value })}
                      className="custom-color-picker"
                    />
                  </div>
                </div>

                {/* Change Font if Text */}
                {selectedElement.kind === 'text' && (
                  <div className="form-group">
                    <label className="section-label">Tipografía</label>
                    <select
                      value={selectedElement.fontFamily || 'sans-serif'}
                      onChange={e => updateSelectedElement({ fontFamily: e.target.value })}
                      className="font-select"
                    >
                      <option value="sans-serif">Moderna (Sans-Serif)</option>
                      <option value="serif">Elegante (Serif)</option>
                      <option value="monospace">Código (Monospace)</option>
                      <option value="cursive">Escrita (Cursive)</option>
                      <option value="Impact">Impacto (Bold)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* TAB: FILTERS */}
            {activeTab === 'filters' && (
              <div className="tab-pane animate-fade-in">
                <h3 className="pane-title">Filtros Predeterminados</h3>
                <div className="filters-grid">
                  {FILTERS.map(f => (
                    <button
                      key={f.id}
                      className={`filter-card ${selectedFilter === f.id ? 'active' : ''}`}
                      onClick={() => setSelectedFilter(f.id)}
                    >
                      <div className="filter-preview-box">
                        <img
                          src={image.url}
                          alt={f.name}
                          style={{ filter: f.filterCss }}
                        />
                      </div>
                      <span className="filter-label">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ADJUSTMENTS */}
            {activeTab === 'adjustments' && (
              <div className="tab-pane animate-fade-in">
                <h3 className="pane-title">Color y Luces</h3>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Brillo</label>
                    <span>{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={brightness}
                    onChange={e => setBrightness(Number(e.target.value))}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Contraste</label>
                    <span>{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={contrast}
                    onChange={e => setContrast(Number(e.target.value))}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Saturación</label>
                    <span>{saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    value={saturate}
                    onChange={e => setSaturate(Number(e.target.value))}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Tono (Hue)</label>
                    <span>{hue}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={hue}
                    onChange={e => setHue(Number(e.target.value))}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Desenfoque</label>
                    <span>{blur}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={blur}
                    onChange={e => setBlur(Number(e.target.value))}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Viñeta / Sombras</label>
                    <span>{vignette}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vignette}
                    onChange={e => setVignette(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* TAB: BRUSH */}
            {activeTab === 'brush' && (
              <div className="tab-pane animate-fade-in">
                <div className="pane-header-row">
                  <h3 className="pane-title">Pincel y Dibujo</h3>
                  <button className="text-action-btn" onClick={handleClearDrawings}>
                    <Trash2 size={14} /> Borrar Dibujo
                  </button>
                </div>

                <div className="sub-tools-row">
                  <button
                    className={`sub-tool-btn ${brushMode === 'pen' ? 'active' : ''}`}
                    onClick={() => setBrushMode('pen')}
                  >
                    <Pencil size={16} />
                    <span>Lápiz</span>
                  </button>
                  <button
                    className={`sub-tool-btn ${brushMode === 'neon' ? 'active' : ''}`}
                    onClick={() => setBrushMode('neon')}
                  >
                    <Sparkles size={16} />
                    <span>Neón</span>
                  </button>
                  <button
                    className={`sub-tool-btn ${brushMode === 'highlighter' ? 'active' : ''}`}
                    onClick={() => setBrushMode('highlighter')}
                  >
                    <Type size={16} />
                    <span>Marcador</span>
                  </button>
                  <button
                    className={`sub-tool-btn ${brushMode === 'eraser' ? 'active' : ''}`}
                    onClick={() => setBrushMode('eraser')}
                  >
                    <Eraser size={16} />
                    <span>Borrador</span>
                  </button>
                </div>

                <div className="color-section">
                  <label className="section-label">Color del Trazo</label>
                  <div className="color-swatches">
                    {['#1a73e8', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#ffffff', '#000000'].map(c => (
                      <button
                        key={c}
                        className={`color-swatch ${brushColor === c ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setBrushColor(c)}
                      />
                    ))}
                    <input
                      type="color"
                      value={brushColor}
                      onChange={e => setBrushColor(e.target.value)}
                      className="custom-color-picker"
                      title="Seleccionar color personalizado"
                    />
                  </div>
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Grosor del Trazo</label>
                    <span>{brushSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="60"
                    value={brushSize}
                    onChange={e => setBrushSize(Number(e.target.value))}
                  />
                </div>

                <div className="slider-group">
                  <div className="slider-header">
                    <label>Opacidad</label>
                    <span>{brushOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={brushOpacity}
                    onChange={e => setBrushOpacity(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            {/* TAB: TEXT */}
            {activeTab === 'text' && (
              <div className="tab-pane animate-fade-in">
                <h3 className="pane-title">Añadir Texto</h3>
                <p className="pane-subtitle">Escribe tu texto y haz clic sobre la foto para colocarlo. Arrastra desde el centro para mover o desde la esquina inferior derecha para redimensionar.</p>

                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Escribe algo bonito..."
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    className="text-input-field"
                  />
                </div>

                <div className="color-section">
                  <label className="section-label">Color del Texto</label>
                  <div className="color-swatches">
                    {['#ffffff', '#000000', '#1a73e8', '#f59e0b', '#ef4444', '#10b981', '#ec4899'].map(c => (
                      <button
                        key={c}
                        className={`color-swatch ${textColor === c ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setTextColor(c)}
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="section-label">Fondo del Texto</label>
                  <div className="option-buttons">
                    <button
                      className={`option-btn ${textBgColor === 'transparent' ? 'active' : ''}`}
                      onClick={() => setTextBgColor('transparent')}
                    >
                      Ninguno
                    </button>
                    <button
                      className={`option-btn ${textBgColor === '#000000' ? 'active' : ''}`}
                      onClick={() => setTextBgColor('#000000')}
                    >
                      Negro
                    </button>
                    <button
                      className={`option-btn ${textBgColor === '#ffffff' ? 'active' : ''}`}
                      onClick={() => setTextBgColor('#ffffff')}
                    >
                      Blanco
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="section-label">Tipografía</label>
                  <select
                    value={fontFamily}
                    onChange={e => setFontFamily(e.target.value)}
                    className="font-select"
                  >
                    <option value="sans-serif">Moderna (Sans-Serif)</option>
                    <option value="serif">Elegante (Serif)</option>
                    <option value="monospace">Código (Monospace)</option>
                    <option value="cursive">Escrita (Cursive)</option>
                    <option value="Impact">Impacto (Bold)</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB: STICKERS & SHAPES */}
            {activeTab === 'shapes' && (
              <div className="tab-pane animate-fade-in">
                <h3 className="pane-title">Stickers y Formas</h3>

                <label className="section-label">Stickers Populares</label>
                <div className="stickers-grid">
                  {STICKERS.map(emoji => (
                    <button
                      key={emoji}
                      className="sticker-btn"
                      onClick={() => handleAddSticker(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <label className="section-label" style={{ marginTop: '1.5rem' }}>Agregar Formas</label>
                <div className="option-buttons">
                  <button className="option-btn" onClick={() => handleAddShape('rectangle')}>
                    <Square size={16} /> Rectángulo
                  </button>
                  <button className="option-btn" onClick={() => handleAddShape('circle')}>
                    <Circle size={16} /> Círculo
                  </button>
                </div>
              </div>
            )}

            {/* TAB: FRAMES */}
            {activeTab === 'frames' && (
              <div className="tab-pane animate-fade-in">
                <h3 className="pane-title">Marcos Decorativos</h3>
                <div className="frames-grid">
                  {FRAME_STYLES.map(f => (
                    <button
                      key={f.id}
                      className={`frame-card ${frameStyle === f.id ? 'active' : ''}`}
                      onClick={() => setFrameStyle(f.id)}
                    >
                      <span className="frame-name">{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: TRANSFORM */}
            {activeTab === 'transform' && (
              <div className="tab-pane animate-fade-in">
                <h3 className="pane-title">Rotación y Orientación</h3>

                <div className="transform-actions">
                  <button className="action-card-btn" onClick={() => setRotation(r => (r + 90) % 360)}>
                    <RotateCw size={22} />
                    <span>Rotar 90°</span>
                  </button>

                  <button className="action-card-btn" onClick={() => setFlipH(f => !f)}>
                    <FlipHorizontal size={22} />
                    <span>Voltear Horizontal</span>
                  </button>

                  <button className="action-card-btn" onClick={() => setFlipV(f => !f)}>
                    <FlipVertical size={22} />
                    <span>Voltear Vertical</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
