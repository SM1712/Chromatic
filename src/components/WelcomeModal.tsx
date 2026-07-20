import React, { useState } from 'react';
import { 
  Images, 
  Download, 
  FileText, 
  Monitor, 
  Sparkles, 
  Check, 
  ArrowRight,
  X
} from 'lucide-react';
import { 
  DEFAULT_SYSTEM_FOLDER_OPTIONS, 
  SystemFolderOption, 
  getPhotosForSystemOption 
} from '../services/defaultFolderService';
import { ChromaticLogo } from './ChromaticLogo';
import { FolderSource, ImageItem } from '../types';
import './WelcomeModal.css';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSelection: (selectedSources: FolderSource[], selectedImages: ImageItem[]) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onConfirmSelection
}) => {
  // Initial state: default selected options
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    DEFAULT_SYSTEM_FOLDER_OPTIONS.forEach(opt => {
      if (opt.isDefaultSelected) initial.add(opt.id);
    });
    return initial;
  });

  if (!isOpen) return null;

  const toggleOption = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const all = new Set(DEFAULT_SYSTEM_FOLDER_OPTIONS.map(o => o.id));
    setSelectedIds(all);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleConfirm = () => {
    const sourcesToCreate: FolderSource[] = [];
    let imagesToCreate: ImageItem[] = [];

    DEFAULT_SYSTEM_FOLDER_OPTIONS.forEach(opt => {
      if (selectedIds.has(opt.id)) {
        const optionPhotos = getPhotosForSystemOption(opt.id);
        const source: FolderSource = {
          id: opt.id,
          name: opt.name,
          addedAt: Date.now(),
          count: optionPhotos.length
        };

        sourcesToCreate.push(source);
        imagesToCreate = [...imagesToCreate, ...optionPhotos];
      }
    });

    onConfirmSelection(sourcesToCreate, imagesToCreate);
    onClose();
  };

  const renderOptionIcon = (type: SystemFolderOption['iconType']) => {
    switch (type) {
      case 'pictures':
        return <Images size={20} />;
      case 'downloads':
        return <Download size={20} />;
      case 'documents':
        return <FileText size={20} />;
      case 'desktop':
        return <Monitor size={20} />;
      default:
        return <Images size={20} />;
    }
  };

  return (
    <div className="welcome-modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="welcome-modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="welcome-modal-header">
          <div className="welcome-logo-badge">
            <ChromaticLogo size={38} />
          </div>
          <h2>¡Te damos la bienvenida a Chromatic!</h2>
          <p>
            Configura tu espacio inicial. Selecciona cuáles de las siguientes carpetas por defecto deseas incluir en tu biblioteca (puedes elegir todas, algunas o ninguna):
          </p>
        </div>

        {/* Body */}
        <div className="welcome-modal-body">
          <div className="welcome-actions-bar">
            <span className="welcome-subtitle">
              Rutas por defecto ({selectedIds.size} de {DEFAULT_SYSTEM_FOLDER_OPTIONS.length} seleccionadas)
            </span>
            <div className="welcome-quick-btns">
              <button className="welcome-quick-btn" onClick={handleSelectAll}>
                Seleccionar Todas
              </button>
              <span style={{ opacity: 0.3 }}>|</span>
              <button className="welcome-quick-btn" onClick={handleDeselectAll}>
                Ninguna
              </button>
            </div>
          </div>

          <div className="welcome-options-list">
            {DEFAULT_SYSTEM_FOLDER_OPTIONS.map((opt) => {
              const isSelected = selectedIds.has(opt.id);
              return (
                <div 
                  key={opt.id}
                  className={`welcome-option-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => toggleOption(opt.id)}
                >
                  <div className="option-left">
                    <div className="option-icon-box">
                      {renderOptionIcon(opt.iconType)}
                    </div>
                    <div className="option-info">
                      <span className="option-name">{opt.name}</span>
                      <span className="option-desc">{opt.description}</span>
                    </div>
                  </div>

                  <div className="option-checkbox">
                    {isSelected && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="welcome-modal-footer">
          <span className="welcome-footer-info">
            Podrás agregar o quitar carpetas locales en cualquier momento desde Opciones.
          </span>
          <div className="welcome-footer-btns">
            <button className="btn btn-secondary" onClick={onClose}>
              Omitir
            </button>
            <button className="btn btn-primary" onClick={handleConfirm}>
              <span>Comenzar a Explorar</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
