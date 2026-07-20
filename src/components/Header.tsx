import React from 'react';
import { 
  Search, 
  Grid2x2, 
  Grid3x3, 
  LayoutGrid, 
  Settings, 
  FolderPlus, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { UserSettings } from '../types';
import { ChromaticLogo } from './ChromaticLogo';
import './Header.css';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onOpenSettings: () => void;
  onAddFolder: () => void;
  totalImagesCount: number;
  selectedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  settings,
  onUpdateSettings,
  onOpenSettings,
  onAddFolder,
  totalImagesCount,
  selectedCount = 0
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'light' ? 'dark' : 'light';
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <header className="app-header">
      {/* Brand & App Title */}
      <div className="header-brand">
        <ChromaticLogo size={36} />
        <div className="brand-title">
          <h1>Chromatic</h1>
          {selectedCount > 0 && (
            <span className="brand-badge selection-mode-badge animate-fade-in">
              Modo Selección ({selectedCount})
            </span>
          )}
        </div>
      </div>

      {/* Google-Style Search Bar */}
      <div className="header-search-container">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nombre, fecha (ej: hoy, ayer) o carpeta..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button 
              className="search-clear-btn" 
              onClick={() => onSearchChange('')}
              title="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Action Controls & Customization */}
      <div className="header-actions">
        {/* Quick Add Folder */}
        <button 
          className="btn btn-primary btn-add-folder"
          onClick={onAddFolder}
          title="Agregar nueva carpeta de imágenes"
        >
          <FolderPlus size={18} />
          <span className="btn-label">Agregar Carpeta</span>
        </button>

        <div className="divider-v" />

        {/* Grid Density Controls */}
        <div className="density-toggle-group" title="Cambiar tamaño de cuadrícula">
          <button
            className={`btn-icon ${settings.density === 'compact' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ density: 'compact' })}
            title="Cuadrícula compacta (pequeña)"
          >
            <Grid3x3 size={18} />
          </button>
          <button
            className={`btn-icon ${settings.density === 'medium' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ density: 'medium' })}
            title="Cuadrícula mediana (recomendada)"
          >
            <Grid2x2 size={18} />
          </button>
          <button
            className={`btn-icon ${settings.density === 'large' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ density: 'large' })}
            title="Cuadrícula grande"
          >
            <LayoutGrid size={18} />
          </button>
        </div>

        {/* Quick Theme Toggle */}
        <button
          className="btn-icon theme-toggle-btn"
          onClick={toggleTheme}
          title={`Cambiar a modo ${settings.theme === 'light' ? 'oscuro' : 'claro'}`}
        >
          {settings.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Settings / Options Button */}
        <button
          className="btn-icon settings-btn"
          onClick={onOpenSettings}
          title="Opciones y fuentes de carpetas"
        >
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
};
