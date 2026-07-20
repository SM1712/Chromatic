import React from 'react';
import { DateGroup, GridDensity, ImageItem } from '../types';
import { ImageCard } from './ImageCard';
import { FolderPlus, Images, Sparkles, Calendar, CheckSquare, Square } from 'lucide-react';
import './Gallery.css';

interface GalleryProps {
  groups: DateGroup[];
  density: GridDensity;
  selectedImageIds: Set<string>;
  onSelectImage: (image: ImageItem) => void;
  onToggleSelectImage: (image: ImageItem, e: React.MouseEvent) => void;
  onToggleSelectGroup: (images: ImageItem[]) => void;
  onOpenAddFolder: () => void;
  onLoadDemo: () => void;
  totalCount: number;
  filteredCount: number;
  searchQuery: string;
}

export const Gallery: React.FC<GalleryProps> = ({
  groups,
  density,
  selectedImageIds,
  onSelectImage,
  onToggleSelectImage,
  onToggleSelectGroup,
  onOpenAddFolder,
  onLoadDemo,
  totalCount,
  filteredCount,
  searchQuery
}) => {
  if (totalCount === 0) {
    return (
      <div className="gallery-empty-state animate-scale-up">
        <div className="empty-icon-circle">
          <Images size={48} className="empty-icon" />
        </div>
        <h2>Visualiza tus imágenes de escritorio</h2>
        <p>Agrega carpetas locales de tu computadora para organizar y explorar todas tus fotos por fechas.</p>
        <div className="empty-actions">
          <button className="btn btn-primary btn-lg" onClick={onOpenAddFolder}>
            <FolderPlus size={20} />
            Agregar Carpetas Fuentes
          </button>
          <button className="btn btn-secondary btn-lg" onClick={onLoadDemo}>
            <Sparkles size={18} className="sparkle" />
            Ver Galería de Demostración
          </button>
        </div>
      </div>
    );
  }

  if (filteredCount === 0 && searchQuery) {
    return (
      <div className="gallery-empty-state animate-fade-in">
        <p className="no-results-text">No se encontraron fotos que coincidan con <strong>"{searchQuery}"</strong></p>
      </div>
    );
  }

  return (
    <div className={`gallery-container density-${density}`}>
      {groups.map((group) => {
        const isGroupFullySelected = group.images.length > 0 && group.images.every(img => selectedImageIds.has(img.id));
        const hasSomeSelected = group.images.some(img => selectedImageIds.has(img.id));

        return (
          <section key={group.dateKey} className="date-section animate-fade-in">
            <header className="date-section-header">
              <div className="date-title-group">
                <button 
                  className={`section-select-btn ${isGroupFullySelected ? 'selected' : ''}`}
                  onClick={() => onToggleSelectGroup(group.images)}
                  title={isGroupFullySelected ? "Deseleccionar todo este día" : "Seleccionar todas las fotos de este día"}
                >
                  {isGroupFullySelected ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <Calendar size={18} className="calendar-icon" />
                <h2 className="date-title">{group.title}</h2>
                {group.subtitle && <span className="date-subtitle">{group.subtitle}</span>}
              </div>
              <div className="header-right-group">
                <span className="date-count-badge">
                  {group.images.length} {group.images.length === 1 ? 'foto' : 'fotos'}
                </span>
              </div>
            </header>

            <div className="images-grid">
              {group.images.map((img) => (
                <ImageCard
                  key={img.id}
                  image={img}
                  isSelected={selectedImageIds.has(img.id)}
                  onSelectToggle={onToggleSelectImage}
                  onClick={() => onSelectImage(img)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
