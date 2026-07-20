import React, { useRef, useState } from 'react';
import { 
  X, 
  FolderPlus, 
  Trash2, 
  Check, 
  Palette, 
  Folder, 
  Sun, 
  Moon, 
  Sparkles, 
  Layout, 
  HardDrive,
  RefreshCw,
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';
import { AccentColor, FolderSource, ThemeMode, UserSettings } from '../types';
import { processFileList } from '../services/fileSystemService';
import './SettingsModal.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: FolderSource[];
  onAddFolder: () => void;
  onRemoveFolder: (sourceId: string) => void;
  onImportFiles: (files: FileList) => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  sources,
  onAddFolder,
  onRemoveFolder,
  onImportFiles,
  settings,
  onUpdateSettings
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'latest' | 'available'>('idle');
  const [updateInfo, setUpdateInfo] = useState<string>('');

  if (!isOpen) return null;

  const handleCheckUpdate = async () => {
    setUpdateStatus('checking');
    try {
      const res = await fetch('https://raw.githubusercontent.com/SM1712/Chromatic/main/latest.json');
      if (res.ok) {
        const data = await res.json();
        if (data.version && data.version !== '1.0.0') {
          setUpdateStatus('available');
          setUpdateInfo(`¡Nueva versión v${data.version} disponible! ${data.notes || ''}`);
        } else {
          setUpdateStatus('latest');
          setUpdateInfo('¡Estás utilizando la versión más reciente v1.0.0!');
        }
      } else {
        setUpdateStatus('latest');
        setUpdateInfo('¡Estás utilizando la versión más reciente v1.0.0!');
      }
    } catch {
      setUpdateStatus('latest');
      setUpdateInfo('¡Estás utilizando la versión más reciente v1.0.0!');
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
    }
  };

  const themesList: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'light', label: 'Modo Claro', icon: <Sun size={18} />, desc: 'Google-style limpio y fresco (Predeterminado)' },
    { id: 'dark', label: 'Modo Oscuro', icon: <Moon size={18} />, desc: 'Neón y superficies oscuras' },
    { id: 'oled', label: 'Modo OLED', icon: <HardDrive size={18} />, desc: 'Negro puro para máximo contraste' },
    { id: 'cyberpunk', label: 'Cyberpunk', icon: <Sparkles size={18} />, desc: 'Azul slate con acentos neón' }
  ];

  const accentsList: { id: AccentColor; label: string; colorHex: string }[] = [
    { id: 'blue', label: 'Azul Google', colorHex: '#1a73e8' },
    { id: 'violet', label: 'Violeta', colorHex: '#7c4dff' },
    { id: 'emerald', label: 'Esmeralda', colorHex: '#00a86b' },
    { id: 'amber', label: 'Ámbar', colorHex: '#e65100' },
    { id: 'rose', label: 'Rosa Neón', colorHex: '#e91e63' }
  ];

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-card animate-scale-up" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <Palette size={22} className="modal-title-icon" />
            <div>
              <h2>Opciones y Fuentes</h2>
              <p className="modal-subtitle">Administra tus carpetas de imágenes y personaliza la apariencia PWA.</p>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} title="Cerrar modal">
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-body">
          {/* Section 1: Folder Sources */}
          <section className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <Folder size={18} />
                <h3>Carpetas Fuentes ({sources.length})</h3>
              </div>
              <div className="source-actions">
                <button className="btn btn-primary btn-sm" onClick={onAddFolder}>
                  <FolderPlus size={16} />
                  + Agregar Carpeta
                </button>
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileInputRef.current?.click()}
                  title="Importar archivos directamente"
                >
                  Examinar Archivos
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                />
              </div>
            </div>

            <div className="sources-manage-list">
              {sources.length === 0 ? (
                <div className="empty-sources-box">
                  <p>No tienes carpetas agregadas. Agrega fuentes locales para comenzar a visualizar imágenes.</p>
                </div>
              ) : (
                sources.map((source) => (
                  <div key={source.id} className="source-manage-item">
                    <div className="source-item-left">
                      <div className="source-icon-badge">
                        <Folder size={20} />
                      </div>
                      <div className="source-item-info">
                        <span className="source-item-name">{source.name}</span>
                        <span className="source-item-meta">
                          {source.count} fotos • Agregado el {new Date(source.addedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => onRemoveFolder(source.id)}
                      title="Eliminar esta fuente"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Section 2: Theme Selector */}
          <section className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <Sun size={18} />
                <h3>Tema Visual</h3>
              </div>
            </div>

            <div className="themes-grid">
              {themesList.map((t) => (
                <div
                  key={t.id}
                  className={`theme-option-card ${settings.theme === t.id ? 'active' : ''}`}
                  onClick={() => onUpdateSettings({ theme: t.id })}
                >
                  <div className="theme-card-icon">{t.icon}</div>
                  <div className="theme-card-text">
                    <span className="theme-card-label">{t.label}</span>
                    <span className="theme-card-desc">{t.desc}</span>
                  </div>
                  {settings.theme === t.id && (
                    <div className="theme-check-badge">
                      <Check size={14} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Section 3: Accent Colors */}
          <section className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <Palette size={18} />
                <h3>Color de Acento</h3>
              </div>
            </div>

            <div className="accents-picker">
              {accentsList.map((a) => (
                <button
                  key={a.id}
                  className={`accent-swatch ${settings.accent === a.id ? 'active' : ''}`}
                  style={{ backgroundColor: a.colorHex }}
                  onClick={() => onUpdateSettings({ accent: a.id })}
                  title={a.label}
                >
                  {settings.accent === a.id && <Check size={16} color="#ffffff" />}
                </button>
              ))}
            </div>
          </section>

          {/* Section 4: Software Updates */}
          <section className="settings-section">
            <div className="section-header">
              <div className="section-title">
                <RefreshCw size={18} />
                <h3>Actualización de Software (v1.0.0)</h3>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={handleCheckUpdate}
                disabled={updateStatus === 'checking'}
              >
                <RefreshCw size={14} className={updateStatus === 'checking' ? 'animate-spin' : ''} />
                {updateStatus === 'checking' ? 'Buscando...' : 'Buscar Actualizaciones'}
              </button>
            </div>

            <div className="update-status-box">
              {updateStatus === 'idle' && (
                <p className="update-text">Chromatic v1.0.0 — Las actualizaciones del instalador se verifican en tiempo real con el repositorio de GitHub.</p>
              )}
              {updateStatus === 'latest' && (
                <div className="update-alert success">
                  <CheckCircle2 size={16} />
                  <span>{updateInfo}</span>
                </div>
              )}
              {updateStatus === 'available' && (
                <div className="update-alert info">
                  <DownloadCloud size={16} />
                  <span>{updateInfo}</span>
                  <a 
                    href="https://github.com/SM1712/Chromatic/releases/latest" 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ marginLeft: '10px', textDecoration: 'none' }}
                  >
                    Descargar Instalador (.exe)
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
