import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Info, 
  Edit3,
  Edit2,
  Calendar,
  Folder,
  HardDrive,
  FileText,
  Printer
} from 'lucide-react';
import { ImageItem } from '../types';
import { formatFileSize, toValidDate } from '../utils/dateUtils';
import { ImageEditorModal } from './ImageEditorModal';
import './LightboxModal.css';

interface LightboxModalProps {
  image: ImageItem;
  imagesList: ImageItem[];
  onClose: () => void;
  onSelectImage: (image: ImageItem) => void;
  onSaveEditedImage: (image: ImageItem, newUrl: string, isCopy: boolean) => void;
  onRenameImage?: (image: ImageItem, newName: string) => void;
  onOpenPrint?: (image: ImageItem) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  image,
  imagesList,
  onClose,
  onSelectImage,
  onSaveEditedImage,
  onRenameImage,
  onOpenPrint
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Inline Rename state
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(image.name);

  // Thumbnail Strip Auto Scroll ref
  const selectedThumbRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (selectedThumbRef.current) {
      selectedThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [image.id]);

  useEffect(() => {
    setNameInput(image.name);
  }, [image.name]);

  const handleNameSubmit = () => {
    setIsEditingName(false);
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== image.name && onRenameImage) {
      onRenameImage(image, trimmed);
    } else {
      setNameInput(image.name);
    }
  };

  const currentIndex = imagesList.findIndex(img => img.id === image.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < imagesList.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      resetTransforms();
      onSelectImage(imagesList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      resetTransforms();
      onSelectImage(imagesList[currentIndex + 1]);
    }
  };

  const resetTransforms = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  // Keyboard navigation
  useEffect(() => {
    if (isEditing || isEditingName) return; // Disable lightbox shortcuts while editing or renaming

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'i' || e.key === 'I') {
        setShowDetails(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        handleRotate();
      } else if (e.key === 'e' || e.key === 'E') {
        setIsEditing(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, imagesList, isEditing, isEditingName]);

  const handleSaveEditor = (newUrl: string, isCopy: boolean) => {
    onSaveEditedImage(image, newUrl, isCopy);
    setIsEditing(false);
  };

  return (
    <>
      <div className="lightbox-backdrop animate-fade-in">
        {/* Top Floating Control Bar */}
        <div className="lightbox-header">
          <div className="header-info-title">
            {isEditingName ? (
              <input
                type="text"
                className="inline-rename-input"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={handleNameSubmit}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleNameSubmit();
                  if (e.key === 'Escape') {
                    setNameInput(image.name);
                    setIsEditingName(false);
                  }
                }}
                autoFocus
              />
            ) : (
              <span
                className="lightbox-filename-interactive"
                onClick={() => setIsEditingName(true)}
                title="Haz clic para renombrar esta foto"
              >
                <span>{image.name}</span>
                <Edit2 size={13} style={{ opacity: 0.6 }} />
              </span>
            )}
            <span className="lightbox-counter">
              {currentIndex + 1} de {imagesList.length}
            </span>
          </div>

          <div className="lightbox-tools">
            <button className="lightbox-edit-btn" onClick={() => setIsEditing(true)} title="Editar imagen (E)">
              <Edit3 size={16} />
              <span>Editar</span>
            </button>

            {onOpenPrint && (
              <button 
                className="lightbox-edit-btn" 
                style={{ background: '#312e81', borderColor: '#4338ca', color: '#c7d2fe' }}
                onClick={() => onOpenPrint(image)} 
                title="Imprimir esta foto"
              >
                <Printer size={16} />
                <span>Imprimir</span>
              </button>
            )}

            <div className="divider-v-dark" />

            <button className="btn-icon btn-dark" onClick={handleZoomOut} title="Alejar (-)">
              <ZoomOut size={18} />
            </button>
            <span className="zoom-percentage">{Math.round(zoom * 100)}%</span>
            <button className="btn-icon btn-dark" onClick={handleZoomIn} title="Acercar (+)">
              <ZoomIn size={18} />
            </button>
            <button className="btn-icon btn-dark" onClick={handleRotate} title="Rotar 90° (R)">
              <RotateCw size={18} />
            </button>
            
            <div className="divider-v-dark" />

            <button 
              className={`btn-icon btn-dark ${showDetails ? 'active' : ''}`}
              onClick={() => setShowDetails(!showDetails)}
              title="Información del archivo (I)"
            >
              <Info size={18} />
            </button>
            <button className="btn-icon btn-dark btn-close" onClick={onClose} title="Cerrar (Esc)">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lightbox-body">
          {/* Navigation Arrows */}
          <button
            className="nav-arrow left"
            onClick={handlePrev}
            disabled={!hasPrev}
            title="Imagen anterior (Flecha Izquierda)"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="image-stage">
            <img
              src={image.url}
              alt={image.name}
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transition: 'transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)'
              }}
              className="lightbox-image"
            />
          </div>

          <button
            className="nav-arrow right"
            onClick={handleNext}
            disabled={!hasNext}
            title="Imagen siguiente (Flecha Derecha)"
          >
            <ChevronRight size={32} />
          </button>

          {/* Details Sidebar Drawer */}
          {showDetails && (
            <aside className="lightbox-details-panel animate-scale-up">
              <div className="details-header">
                <h3>Detalles de la Foto</h3>
                <button className="btn-icon btn-sm" onClick={() => setShowDetails(false)}>
                  <X size={16} />
                </button>
              </div>

              <div className="details-list">
                <div className="detail-item">
                  <FileText size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">Nombre de Archivo</span>
                    <span className="detail-value text-break">{image.name}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <Calendar size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">Fecha de Modificación</span>
                    <span className="detail-value">{toValidDate(image.date).toLocaleString()}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <HardDrive size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">Tamaño del Archivo</span>
                    <span className="detail-value">{formatFileSize(image.size)}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <Folder size={18} className="detail-icon" />
                  <div className="detail-text">
                    <span className="detail-label">Carpeta Fuente</span>
                    <span className="detail-value">{image.sourceName}</span>
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>

        {/* Bottom Carousel Thumbnail Strip with Date Shading */}
        <div className="lightbox-thumbnail-strip">
          <div className="thumbnail-track">
            {imagesList.map((img) => {
              const isSelected = img.id === image.id;
              const imgDateStr = img.dateStr || (img.date ? toValidDate(img.date).toLocaleDateString() : '');
              const activeDateStr = image.dateStr || (image.date ? toValidDate(image.date).toLocaleDateString() : '');
              const isSameDate = imgDateStr && activeDateStr ? imgDateStr === activeDateStr : true;

              return (
                <button
                  key={img.id}
                  ref={isSelected ? selectedThumbRef : null}
                  className={`thumb-btn ${isSelected ? 'selected' : ''} ${isSameDate ? 'same-date' : 'different-date'}`}
                  onClick={() => {
                    resetTransforms();
                    onSelectImage(img);
                  }}
                  title={`${img.name} ${imgDateStr ? '• ' + imgDateStr : ''}`}
                >
                  <img src={img.url} alt={img.name} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Render Editor Modal overlay if editing */}
      {isEditing && (
        <ImageEditorModal
          image={image}
          onClose={() => setIsEditing(false)}
          onSave={handleSaveEditor}
        />
      )}
    </>
  );
};

