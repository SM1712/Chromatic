import React from 'react';
import { 
  Images, 
  Folder, 
  FolderPlus, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  HardDrive
} from 'lucide-react';
import { FolderSource } from '../types';
import './Sidebar.css';

interface SidebarProps {
  sources: FolderSource[];
  activeSourceId: string | null;
  onSelectSource: (sourceId: string | null) => void;
  onOpenAddFolder: () => void;
  onOpenSettings: () => void;
  totalImagesCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sources,
  activeSourceId,
  onSelectSource,
  onOpenAddFolder,
  onOpenSettings,
  totalImagesCount,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <aside className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <span className="sidebar-section-title">EXPLORAR</span>}
        <button 
          className="btn-icon collapse-btn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {/* All Photos */}
        <button
          className={`sidebar-nav-item ${activeSourceId === null ? 'active' : ''}`}
          onClick={() => onSelectSource(null)}
          title="Todas las Fotos"
        >
          <Images size={20} className="nav-icon" />
          {!isCollapsed && (
            <>
              <span className="nav-label">Todas las Fotos</span>
              <span className="nav-badge">{totalImagesCount}</span>
            </>
          )}
        </button>

        {!isCollapsed && <div className="sidebar-divider" />}

        {/* Folder Sources Header */}
        {!isCollapsed && (
          <div className="sidebar-section-header">
            <span className="sidebar-section-title">CARPETAS ({sources.length})</span>
            <button 
              className="btn-icon btn-sm"
              onClick={onOpenAddFolder}
              title="Agregar nueva carpeta de fotos"
            >
              <FolderPlus size={16} />
            </button>
          </div>
        )}

        {/* List of Sources */}
        <div className="sources-list">
          {sources.length === 0 ? (
            !isCollapsed && (
              <div className="empty-sources-hint">
                <HardDrive size={24} className="empty-hint-icon" />
                <p>No tienes carpetas agregadas aún.</p>
                <button className="link-btn" onClick={onOpenAddFolder}>
                  + Agregar Carpeta
                </button>
              </div>
            )
          ) : (
            sources.map(source => (
              <button
                key={source.id}
                className={`sidebar-nav-item ${activeSourceId === source.id ? 'active' : ''}`}
                onClick={() => onSelectSource(source.id)}
                title={`${source.name} (${source.count} fotos)`}
              >
                <Folder size={18} className="nav-icon folder-icon" />
                {!isCollapsed && (
                  <>
                    <span className="nav-label text-truncate">{source.name}</span>
                    <span className="nav-badge">{source.count}</span>
                  </>
                )}
              </button>
            ))
          )}
        </div>
      </nav>
    </aside>
  );
};
