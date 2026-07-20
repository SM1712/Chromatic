import React, { useState, useEffect, useMemo } from 'react';
import { 
  FolderSource, 
  ImageItem, 
  UserSettings 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  loadStoredSources, 
  loadUserSettings, 
  saveStoredSources, 
  saveUserSettings 
} from './services/storageService';
import { 
  pickFolderSource, 
  processFileList, 
  scanDirectoryHandle 
} from './services/fileSystemService';
import { DEMO_SOURCE_ID, getDemoPhotos } from './services/demoPhotos';
import { groupImagesByDate, toValidDate, formatDateTitle } from './utils/dateUtils';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Gallery } from './components/Gallery';
import { LightboxModal } from './components/LightboxModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintStudioModal } from './components/PrintStudioModal';
import { SelectionBar } from './components/SelectionBar';
import { DateRangeModal } from './components/DateRangeModal';
import { WelcomeModal } from './components/WelcomeModal';
import { getPhotosForSystemOption } from './services/defaultFolderService';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [sources, setSources] = useState<FolderSource[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isPrintStudioOpen, setIsPrintStudioOpen] = useState<boolean>(false);
  const [printInitialImages, setPrintInitialImages] = useState<ImageItem[]>([]);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState<boolean>(false);
  
  // Selection & Date Filter State
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [isDateModalOpen, setIsDateModalOpen] = useState<boolean>(false);

  // Apply Theme and Accent to DOM Root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    document.documentElement.setAttribute('data-accent', settings.accent);
  }, [settings.theme, settings.accent]);

  // Load Saved Settings & Sources on Mount
  useEffect(() => {
    async function initApp() {
      try {
        console.log('🚀 [Diagnostic App.tsx] Iniciando initApp...');
        const savedSettings = await loadUserSettings();
        console.log('✅ [Diagnostic App.tsx] Settings cargadas:', savedSettings);
        setSettings(savedSettings);

        const savedSources = await loadStoredSources();
        console.log('✅ [Diagnostic App.tsx] Fuentes cargadas:', savedSources);
        setSources(savedSources);

        let allLoadedImages: ImageItem[] = [];

        for (const source of savedSources) {
          if (source.isDemo) {
            console.log('📸 [Diagnostic App.tsx] Cargando fotos demo...');
            allLoadedImages = [...allLoadedImages, ...getDemoPhotos()];
          } else if (['default-pictures', 'default-downloads', 'default-documents', 'default-desktop'].includes(source.id)) {
            console.log(`📂 [Diagnostic App.tsx] Cargando fotos de ruta inicial: ${source.name}`);
            allLoadedImages = [...allLoadedImages, ...getPhotosForSystemOption(source.id)];
          } else if (source.handle) {
            try {
              console.log(`📂 [Diagnostic App.tsx] Escaneando carpeta: ${source.name}`);
              const scanned = await scanDirectoryHandle(source.handle, source.id, source.name);
              allLoadedImages = [...allLoadedImages, ...scanned];
            } catch (e: any) {
              console.warn(`No se pudo volver a escanear ${source.name}:`, e);
            }
          }
        }

        console.log(`✅ [Diagnostic App.tsx] Total de imágenes listas: ${allLoadedImages.length}`);
        setImages(allLoadedImages);

        // First launch check for welcome greeting
        const hasCompletedWelcome = localStorage.getItem('chromatic_welcome_completed');
        if (savedSources.length === 0 && !hasCompletedWelcome) {
          setIsWelcomeModalOpen(true);
        }
      } catch (err: any) {
        console.error('❌ [Diagnostic App.tsx] Error en initApp:', err);
        alert(`⚠️ Error durante el inicio de la app: ${err?.message || err}`);
      }
    }

    initApp();
  }, []);

  // Welcome selection handler
  const handleConfirmWelcomeSelection = (selectedSources: FolderSource[], selectedImages: ImageItem[]) => {
    setSources(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const filteredNew = selectedSources.filter(s => !existingIds.has(s.id));
      const updated = [...prev, ...filteredNew];
      saveStoredSources(updated);
      return updated;
    });

    setImages(prev => {
      const existingImgIds = new Set(prev.map(i => i.id));
      const filteredNewImg = selectedImages.filter(i => !existingImgIds.has(i.id));
      return [...prev, ...filteredNewImg];
    });

    localStorage.setItem('chromatic_welcome_completed', 'true');
  };

  // Update Settings Handler
  const handleUpdateSettings = (newPartial: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newPartial };
      saveUserSettings(updated);
      return updated;
    });
  };

  // Add Native Folder Source
  const handleAddFolderSource = async () => {
    try {
      const result = await pickFolderSource();
      if (!result) return; // User cancelled

      const { source, images: newImages } = result;

      setSources(prev => {
        const updated = [...prev.filter(s => s.id !== source.id), source];
        saveStoredSources(updated);
        return updated;
      });

      setImages(prev => [...prev.filter(img => img.sourceId !== source.id), ...newImages]);
    } catch (err: any) {
      if (err.name === 'SecurityError' || err.message?.includes('system') || err.message?.includes('archivos del sistema')) {
        alert('El navegador bloquea carpetas raíz del sistema (como C:\\ o Windows) por seguridad. Por favor, selecciona una subcarpeta de fotos (ej: Imágenes, Escritorio o tus propias carpetas).');
      } else {
        alert(`Nota sobre la carpeta: ${err.message || 'No se pudo abrir la carpeta seleccionada.'}`);
      }
    }
  };

  // Load Demo Photos
  const handleLoadDemo = () => {
    const demoPhotos = getDemoPhotos();
    const demoSource: FolderSource = {
      id: DEMO_SOURCE_ID,
      name: 'Fotos de Muestra (Demo)',
      addedAt: Date.now(),
      count: demoPhotos.length,
      isDemo: true
    };

    setSources(prev => {
      if (prev.some(s => s.id === DEMO_SOURCE_ID)) return prev;
      const updated = [...prev, demoSource];
      saveStoredSources(updated);
      return updated;
    });

    setImages(prev => {
      const withoutDemo = prev.filter(img => img.sourceId !== DEMO_SOURCE_ID);
      return [...withoutDemo, ...demoPhotos];
    });
  };

  // Import Files via Fallback Input
  const handleImportFiles = (fileList: FileList) => {
    const { source, images: newImages } = processFileList(fileList);

    setSources(prev => {
      const updated = [...prev, source];
      saveStoredSources(updated);
      return updated;
    });

    setImages(prev => [...prev, ...newImages]);
  };

  // Remove Source
  const handleRemoveSource = (sourceId: string) => {
    setSources(prev => {
      const updated = prev.filter(s => s.id !== sourceId);
      saveStoredSources(updated);
      return updated;
    });

    setImages(prev => prev.filter(img => img.sourceId !== sourceId));
    if (activeSourceId === sourceId) {
      setActiveSourceId(null);
    }
  };

  // Save edited photo handler
  const handleSaveEditedImage = (originalImage: ImageItem, newUrl: string, isCopy: boolean) => {
    if (isCopy) {
      const now = new Date();
      const newImage: ImageItem = {
        ...originalImage,
        id: `edited_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: `Editada_${originalImage.name}`,
        url: newUrl,
        date: now,
        dateStr: now.toISOString().split('T')[0]
      };
      setImages(prev => [newImage, ...prev]);
      setSelectedImage(newImage);
    } else {
      const updatedImage: ImageItem = {
        ...originalImage,
        url: newUrl,
        date: new Date()
      };
      setImages(prev => prev.map(img => img.id === originalImage.id ? updatedImage : img));
      setSelectedImage(updatedImage);
    }
  };

  // Rename photo handler
  const handleRenameImage = (targetImage: ImageItem, newName: string) => {
    const updatedImage = { ...targetImage, name: newName };
    setImages(prev => prev.map(img => img.id === targetImage.id ? updatedImage : img));
    if (selectedImage?.id === targetImage.id) {
      setSelectedImage(updatedImage);
    }
  };

  // Filtered Images
  const filteredImages = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase();
    
    return images.filter(img => {
      // Filter by source
      if (activeSourceId && img.sourceId !== activeSourceId) {
        return false;
      }
      
      // Filter by search query
      if (rawQuery) {
        const queryWords = rawQuery.split(/\s+/).filter(Boolean);
        const imgDate = toValidDate(img.date);
        const targetDate = new Date(imgDate.getFullYear(), imgDate.getMonth(), imgDate.getDate());
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

        // Special check for "hoy"
        if (queryWords.includes('hoy')) {
          if (today.getTime() === targetDate.getTime()) {
            return true;
          }
        }

        // Special check for "ayer"
        if (queryWords.includes('ayer')) {
          if (yesterday.getTime() === targetDate.getTime()) {
            return true;
          }
        }

        const { title, subtitle } = formatDateTitle(imgDate);
        const matchName = (img.name || '').toLowerCase().includes(rawQuery);
        const matchSource = (img.sourceName || '').toLowerCase().includes(rawQuery);
        const matchDate = imgDate.toLocaleDateString().includes(rawQuery);
        const matchTitle = title.toLowerCase().includes(rawQuery);
        const matchSubtitle = subtitle ? subtitle.toLowerCase().includes(rawQuery) : false;

        return matchName || matchSource || matchDate || matchTitle || matchSubtitle;
      }
      return true;
    });
  }, [images, activeSourceId, searchQuery]);

  // Grouped Images by Date
  const dateGroups = useMemo(() => {
    return groupImagesByDate(filteredImages, settings.sortOrder);
  }, [filteredImages, settings.sortOrder]);

  // Open Print Studio Handlers
  const handleOpenPrintStudioAll = () => {
    if (selectedImageIds.size > 0) {
      const selected = images.filter(img => selectedImageIds.has(img.id));
      setPrintInitialImages(selected);
    } else {
      setPrintInitialImages(filteredImages);
    }
    setIsPrintStudioOpen(true);
  };

  const handleOpenPrintStudioSingle = (image: ImageItem) => {
    setPrintInitialImages([image]);
    setIsPrintStudioOpen(true);
  };

  // Selection Handlers
  const handleToggleSelectImage = (targetImage: ImageItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIds(prev => {
      const next = new Set(prev);
      if (next.has(targetImage.id)) {
        next.delete(targetImage.id);
      } else {
        next.add(targetImage.id);
      }
      return next;
    });
  };

  const handleToggleSelectGroup = (groupImages: ImageItem[]) => {
    setSelectedImageIds(prev => {
      const next = new Set(prev);
      const allSelected = groupImages.every(img => next.has(img.id));
      if (allSelected) {
        groupImages.forEach(img => next.delete(img.id));
      } else {
        groupImages.forEach(img => next.add(img.id));
      }
      return next;
    });
  };

  const handleSelectAllVisibles = () => {
    const next = new Set<string>();
    filteredImages.forEach(img => next.add(img.id));
    setSelectedImageIds(next);
  };

  const handleClearSelection = () => {
    setSelectedImageIds(new Set());
  };

  const handleApplyDateSelection = (matchingIds: string[]) => {
    setSelectedImageIds(new Set(matchingIds));
  };

  return (
    <div 
      className="app-container"
      data-selection-mode={selectedImageIds.size > 0 ? "true" : "false"}
    >
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onAddFolder={handleAddFolderSource}
        onLoadDemo={handleLoadDemo}
        totalImagesCount={images.length}
        selectedCount={selectedImageIds.size}
      />

      <div className="app-main-layout">
        {/* Sidebar */}
        <Sidebar
          sources={sources}
          activeSourceId={activeSourceId}
          onSelectSource={setActiveSourceId}
          onOpenAddFolder={handleAddFolderSource}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLoadDemo={handleLoadDemo}
          totalImagesCount={images.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Gallery Content Area */}
        <Gallery
          groups={dateGroups}
          density={settings.density}
          selectedImageIds={selectedImageIds}
          onSelectImage={setSelectedImage}
          onToggleSelectImage={handleToggleSelectImage}
          onToggleSelectGroup={handleToggleSelectGroup}
          onOpenAddFolder={handleAddFolderSource}
          onLoadDemo={handleLoadDemo}
          totalCount={images.length}
          filteredCount={filteredImages.length}
          searchQuery={searchQuery}
        />
      </div>

      {/* Floating Selection Bar */}
      <SelectionBar
        selectedCount={selectedImageIds.size}
        totalCount={filteredImages.length}
        onSelectAll={handleSelectAllVisibles}
        onClearSelection={handleClearSelection}
        onOpenDateFilter={() => setIsDateModalOpen(true)}
        onOpenPrintStudio={handleOpenPrintStudioAll}
      />

      {/* Lightbox Fullscreen View */}
      {selectedImage && (
        <LightboxModal
          image={selectedImage}
          imagesList={filteredImages}
          onClose={() => setSelectedImage(null)}
          onSelectImage={setSelectedImage}
          onSaveEditedImage={handleSaveEditedImage}
          onRenameImage={handleRenameImage}
          onOpenPrint={handleOpenPrintStudioSingle}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        sources={sources}
        onAddFolder={handleAddFolderSource}
        onRemoveFolder={handleRemoveSource}
        onImportFiles={handleImportFiles}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Date Range Modal */}
      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        images={images}
        onApplyDateSelection={handleApplyDateSelection}
      />

      {/* Print Studio Modal */}
      <PrintStudioModal
        isOpen={isPrintStudioOpen}
        initialImages={printInitialImages}
        onClose={() => setIsPrintStudioOpen(false)}
      />

      {/* Welcome & Route Selection Onboarding Modal */}
      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        onClose={() => setIsWelcomeModalOpen(false)}
        onConfirmSelection={handleConfirmWelcomeSelection}
      />
    </div>
  );
};
