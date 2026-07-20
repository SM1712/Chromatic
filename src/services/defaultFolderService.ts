import { FolderSource, ImageItem } from '../types';
import { getDemoPhotos, DEMO_SOURCE_ID } from './demoPhotos';

export interface SystemFolderOption {
  id: string;
  name: string;
  description: string;
  iconType: 'pictures' | 'downloads' | 'documents' | 'desktop' | 'demo';
  systemPathKey?: string;
  isDefaultSelected: boolean;
}

export const DEFAULT_SYSTEM_FOLDER_OPTIONS: SystemFolderOption[] = [
  {
    id: 'default-pictures',
    name: 'Imágenes',
    description: 'Carpeta principal de fotos del sistema',
    iconType: 'pictures',
    systemPathKey: 'pictures',
    isDefaultSelected: true
  },
  {
    id: 'default-downloads',
    name: 'Descargas',
    description: 'Fotos y capturas de descargas web',
    iconType: 'downloads',
    systemPathKey: 'downloads',
    isDefaultSelected: true
  },
  {
    id: 'default-documents',
    name: 'Documentos',
    description: 'Escaneos y gráficos en Documentos',
    iconType: 'documents',
    systemPathKey: 'documents',
    isDefaultSelected: true
  },
  {
    id: 'default-desktop',
    name: 'Escritorio',
    description: 'Capturas y archivos del escritorio',
    iconType: 'desktop',
    systemPathKey: 'desktop',
    isDefaultSelected: false
  },
  {
    id: DEMO_SOURCE_ID,
    name: 'Fotos de Muestra (Demo)',
    description: 'Colección de fotografías en alta calidad',
    iconType: 'demo',
    isDefaultSelected: true
  }
];

export function getPhotosForSystemOption(optionId: string): ImageItem[] {
  const now = new Date();
  const today = new Date(now);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (optionId === DEMO_SOURCE_ID) {
    return getDemoPhotos();
  }

  if (optionId === 'default-pictures') {
    return [
      {
        id: 'pic-1',
        name: 'Retrato_Luz_Natural_Atardecer.jpg',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        size: 2840100,
        date: today,
        dateStr: today.toISOString().split('T')[0],
        sourceId: 'default-pictures',
        sourceName: 'Imágenes',
        width: 1920,
        height: 1280
      },
      {
        id: 'pic-2',
        name: 'Camino_Hacia_la_Cima.jpg',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        size: 3410900,
        date: yesterday,
        dateStr: yesterday.toISOString().split('T')[0],
        sourceId: 'default-pictures',
        sourceName: 'Imágenes',
        width: 1920,
        height: 1080
      },
      {
        id: 'pic-3',
        name: 'Flores_Primavera_Jardín.jpg',
        url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=80',
        size: 1950200,
        date: threeDaysAgo,
        dateStr: threeDaysAgo.toISOString().split('T')[0],
        sourceId: 'default-pictures',
        sourceName: 'Imágenes',
        width: 1920,
        height: 1280
      }
    ];
  }

  if (optionId === 'default-downloads') {
    return [
      {
        id: 'dl-1',
        name: 'Fondo_Pantalla_Geométrico_HD.jpg',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        size: 1940000,
        date: today,
        dateStr: today.toISOString().split('T')[0],
        sourceId: 'default-downloads',
        sourceName: 'Descargas',
        width: 1920,
        height: 1080
      },
      {
        id: 'dl-2',
        name: 'Ilustración_Arte_3D_Color.jpg',
        url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
        size: 2150300,
        date: yesterday,
        dateStr: yesterday.toISOString().split('T')[0],
        sourceId: 'default-downloads',
        sourceName: 'Descargas',
        width: 1920,
        height: 1280
      },
      {
        id: 'dl-3',
        name: 'Captura_Diseño_UI_Dashboard.png',
        url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        size: 1420900,
        date: oneWeekAgo,
        dateStr: oneWeekAgo.toISOString().split('T')[0],
        sourceId: 'default-downloads',
        sourceName: 'Descargas',
        width: 1920,
        height: 1080
      }
    ];
  }

  if (optionId === 'default-documents') {
    return [
      {
        id: 'doc-1',
        name: 'Esquema_Diagrama_Arquitectura.jpg',
        url: 'https://images.unsplash.com/photo-1542744094-3a31216914fc?auto=format&fit=crop&w=1200&q=80',
        size: 1250300,
        date: yesterday,
        dateStr: yesterday.toISOString().split('T')[0],
        sourceId: 'default-documents',
        sourceName: 'Documentos',
        width: 1920,
        height: 1080
      },
      {
        id: 'doc-2',
        name: 'Escanéo_Documento_Diseño.jpg',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
        size: 980100,
        date: oneWeekAgo,
        dateStr: oneWeekAgo.toISOString().split('T')[0],
        sourceId: 'default-documents',
        sourceName: 'Documentos',
        width: 1920,
        height: 1280
      }
    ];
  }

  if (optionId === 'default-desktop') {
    return [
      {
        id: 'desk-1',
        name: 'Captura_Escritorio_Proyecto.png',
        url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
        size: 2540100,
        date: today,
        dateStr: today.toISOString().split('T')[0],
        sourceId: 'default-desktop',
        sourceName: 'Escritorio',
        width: 1920,
        height: 1080
      }
    ];
  }

  return [];
}
