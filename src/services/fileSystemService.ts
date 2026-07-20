import { FolderSource, ImageItem } from '../types';

const SUPPORTED_EXTENSIONS = [
  // Formatos Estándar Web & Fotografía
  '.jpg', '.jpeg', '.jfif', '.pjpeg', '.pjp',
  '.png', '.apng',
  '.webp',
  '.gif',
  '.avif',
  '.bmp', '.dib',
  '.svg', '.svgz',
  '.ico', '.cur',
  '.tiff', '.tif',
  '.heic', '.heif',
  // Formatos de Cámara RAW
  '.raw', '.cr2', '.cr3', '.nef', '.arw', '.dng',
  '.orf', '.rw2', '.pef', '.raf', '.srw',
  // Formatos Gráficos & Diseño
  '.psd', '.tga', '.dds'
];

export function isImageFile(filename: string, mimeType?: string): boolean {
  if (mimeType && mimeType.startsWith('image/')) {
    return true;
  }
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function pickFolderSource(): Promise<{ source: FolderSource; images: ImageItem[] } | null> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('FileSystemAccess API no es soportada en este navegador. Utiliza el selector de archivos clásico.');
  }

  try {
    // Show native directory picker
    const dirHandle = await (window as any).showDirectoryPicker({
      mode: 'read'
    });

    const sourceId = 'source-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const sourceName = dirHandle.name;

    const images = await scanDirectoryHandle(dirHandle, sourceId, sourceName);

    const source: FolderSource = {
      id: sourceId,
      name: sourceName,
      handle: dirHandle,
      addedAt: Date.now(),
      count: images.length
    };

    return { source, images };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return null; // User cancelled
    }
    console.error('Error selecting folder:', err);
    throw err;
  }
}

export async function scanDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  sourceId: string,
  sourceName: string
): Promise<ImageItem[]> {
  const images: ImageItem[] = [];

  async function scan(handle: FileSystemDirectoryHandle, currentPath: string) {
    for await (const entry of (handle as any).values()) {
      if (entry.kind === 'file') {
        const name = entry.name;
        if (isImageFile(name)) {
          try {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            if (isImageFile(name, file.type)) {
              const url = URL.createObjectURL(file);
              const date = new Date(file.lastModified || Date.now());

              images.push({
                id: `${sourceId}-${currentPath ? currentPath + '/' : ''}${name}-${file.lastModified}`,
                name: name,
                url: url,
                size: file.size,
                date: date,
                dateStr: date.toISOString(),
                sourceId: sourceId,
                sourceName: sourceName,
                file: file
              });
            }
          } catch (e) {
            console.warn(`Error reading file ${name}:`, e);
          }
        }
      } else if (entry.kind === 'directory') {
        // Limit depth to avoid infinite recursion or heavy performance hit
        if (currentPath.split('/').length < 4) {
          try {
            await scan(entry as FileSystemDirectoryHandle, `${currentPath ? currentPath + '/' : ''}${entry.name}`);
          } catch (e) {
            console.warn(`Error scanning directory ${entry.name}:`, e);
          }
        }
      }
    }
  }

  await scan(dirHandle, '');
  return images;
}

export function processFileList(files: FileList | File[]): { source: FolderSource; images: ImageItem[] } {
  const fileArray = Array.from(files);
  const imageFiles = fileArray.filter(file => isImageFile(file.name, file.type));

  const firstPath = (imageFiles[0] as any)?.webkitRelativePath || 'Carpeta Importada';
  const folderName = firstPath.includes('/') ? firstPath.split('/')[0] : 'Imágenes Locales';

  const sourceId = 'source-custom-' + Date.now();

  const images: ImageItem[] = imageFiles.map((file, idx) => {
    const url = URL.createObjectURL(file);
    const date = new Date(file.lastModified || Date.now());
    return {
      id: `${sourceId}-${idx}-${file.name}`,
      name: file.name,
      url: url,
      size: file.size,
      date: date,
      dateStr: date.toISOString(),
      sourceId: sourceId,
      sourceName: folderName,
      file: file
    };
  });

  const source: FolderSource = {
    id: sourceId,
    name: folderName,
    addedAt: Date.now(),
    count: images.length
  };

  return { source, images };
}
