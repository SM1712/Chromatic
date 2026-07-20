import { DateGroup, ImageItem, SortOrder } from '../types';

export function toValidDate(d: any): Date {
  if (d instanceof Date && !isNaN(d.getTime())) {
    return d;
  }
  if (d) {
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return new Date();
}

export function formatDateTitle(rawDate: any): { title: string; subtitle?: string } {
  const date = toValidDate(rawDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  const dayOfWeekNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  if (diffDays === 0) {
    return { title: 'Hoy', subtitle: `${dayOfWeekNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}` };
  } else if (diffDays === 1) {
    return { title: 'Ayer', subtitle: `${dayOfWeekNames[date.getDay()]}, ${date.getDate()} de ${monthNames[date.getMonth()]}` };
  } else if (diffDays > 1 && diffDays < 7) {
    return { title: `${dayOfWeekNames[date.getDay()]}`, subtitle: `${date.getDate()} de ${monthNames[date.getMonth()]}, ${date.getFullYear()}` };
  } else {
    const isCurrentYear = date.getFullYear() === now.getFullYear();
    const formatted = `${date.getDate()} de ${monthNames[date.getMonth()]}${isCurrentYear ? '' : ` de ${date.getFullYear()}`}`;
    return { title: formatted, subtitle: isCurrentYear ? `${dayOfWeekNames[date.getDay()]}` : `${date.getFullYear()}` };
  }
}

export function groupImagesByDate(images: ImageItem[], sortOrder: SortOrder = 'newest'): DateGroup[] {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  // First sort images safely
  const sorted = [...images].sort((a, b) => {
    if (sortOrder === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    }
    const timeA = toValidDate(a.date).getTime();
    const timeB = toValidDate(b.date).getTime();
    if (sortOrder === 'oldest') {
      return timeA - timeB;
    }
    return timeB - timeA; // newest first
  });

  const groupsMap = new Map<string, { title: string; subtitle?: string; dateObj: Date; images: ImageItem[] }>();

  for (const img of sorted) {
    const imgDate = toValidDate(img.date);
    const dateKey = `${imgDate.getFullYear()}-${String(imgDate.getMonth() + 1).padStart(2, '0')}-${String(imgDate.getDate()).padStart(2, '0')}`;
    
    if (!groupsMap.has(dateKey)) {
      const { title, subtitle } = formatDateTitle(imgDate);
      groupsMap.set(dateKey, {
        title,
        subtitle,
        dateObj: new Date(imgDate.getFullYear(), imgDate.getMonth(), imgDate.getDate()),
        images: []
      });
    }

    groupsMap.get(dateKey)!.images.push(img);
  }

  const result: DateGroup[] = [];
  groupsMap.forEach((group, dateKey) => {
    result.push({
      dateKey,
      title: group.title,
      subtitle: group.subtitle,
      images: group.images
    });
  });

  if (sortOrder === 'oldest') {
    result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  } else if (sortOrder === 'newest') {
    result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }

  return result;
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
