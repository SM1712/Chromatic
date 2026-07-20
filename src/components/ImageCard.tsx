import React, { useState } from 'react';
import { Eye, Folder, Check } from 'lucide-react';
import { ImageItem } from '../types';
import { formatFileSize } from '../utils/dateUtils';
import './ImageCard.css';

interface ImageCardProps {
  image: ImageItem;
  isSelected?: boolean;
  onSelectToggle?: (image: ImageItem, e: React.MouseEvent) => void;
  onClick: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  isSelected = false, 
  onSelectToggle, 
  onClick 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const fallbackUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
      <rect width="600" height="400" fill="#1e293b"/>
      <circle cx="300" cy="180" r="70" fill="#334155"/>
      <text x="300" y="300" font-family="sans-serif" font-size="22" font-weight="600" fill="#94a3b8" text-anchor="middle">${image.name}</text>
    </svg>`
  )}`;

  const handleCardClick = (e: React.MouseEvent) => {
    // If Shift/Ctrl/Meta clicked or selection active, toggle select
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      e.stopPropagation();
      onSelectToggle?.(image, e);
    } else {
      onClick();
    }
  };

  const handleCheckClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectToggle?.(image, e);
  };

  return (
    <div 
      className={`image-card ${isSelected ? 'selected' : ''}`} 
      onClick={handleCardClick}
    >
      {/* Top Left Selection Checkbox Badge */}
      <button 
        className={`card-select-checkbox ${isSelected ? 'checked' : ''}`}
        onClick={handleCheckClick}
        title={isSelected ? "Deseleccionar foto" : "Seleccionar foto"}
        aria-label="Seleccionar foto"
      >
        <Check size={14} className="checkbox-icon" />
      </button>

      <div className={`card-image-wrapper ${isLoaded ? 'loaded' : ''}`}>
        {!isLoaded && !hasError && <div className="card-skeleton" />}
        <img
          src={hasError ? fallbackUrl : image.url}
          alt={image.name}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className="card-img"
        />
        <div className="card-overlay">
          <div className="overlay-top">
            <span className="source-tag">
              <Folder size={12} /> {image.sourceName}
            </span>
          </div>
          <div className="overlay-bottom">
            <div className="overlay-info">
              <span className="img-name" title={image.name}>{image.name}</span>
              <span className="img-size">{formatFileSize(image.size)}</span>
            </div>
            <button 
              className="preview-icon-btn" 
              title="Ampliar imagen"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
