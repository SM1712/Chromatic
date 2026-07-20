import { ImageItem } from '../types';

export const DEMO_SOURCE_ID = 'demo-source-1';

// Helper to create resilient SVG Data URLs for fallback
function createSvgDataUrl(title: string, bg1: string, bg2: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#g)" />
    <circle cx="600" cy="350" r="180" fill="rgba(255,255,255,0.12)" />
    <polygon points="600,200 650,320 780,320 675,400 715,520 600,440 485,520 525,400 420,320 550,320" fill="rgba(255,255,255,0.25)" />
    <text x="600" y="620" font-family="sans-serif" font-size="36" font-weight="bold" fill="#ffffff" text-anchor="middle" opacity="0.9">${title}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function getDemoPhotos(): ImageItem[] {
  const now = new Date();
  
  const today = new Date(now);
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return [
    {
      id: 'demo-1',
      name: 'Montañas_Alpinas_Amanecer.jpg',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
      size: 2450112,
      date: today,
      dateStr: today.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1920,
      height: 1080
    },
    {
      id: 'demo-2',
      name: 'Arquitectura_Minimalista_Blanca.jpg',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      size: 1840900,
      date: today,
      dateStr: today.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1920,
      height: 1280
    },
    {
      id: 'demo-3',
      name: 'Lago_Niebla_Silenciosa.jpg',
      url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      size: 3120440,
      date: yesterday,
      dateStr: yesterday.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1920,
      height: 1200
    },
    {
      id: 'demo-4',
      name: 'Bosque_Otoñal_Dorado.jpg',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      size: 4210900,
      date: yesterday,
      dateStr: yesterday.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1920,
      height: 1280
    },
    {
      id: 'demo-5',
      name: 'Café_Mañanero_Luz_Natural.jpg',
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
      size: 1540300,
      date: threeDaysAgo,
      dateStr: threeDaysAgo.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1600,
      height: 1067
    },
    {
      id: 'demo-6',
      name: 'Playa_Atardecer_Mar.jpg',
      url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      size: 2890100,
      date: threeDaysAgo,
      dateStr: threeDaysAgo.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1920,
      height: 1280
    },
    {
      id: 'demo-7',
      name: 'Ciudad_Luces_Nocturnas.jpg',
      url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
      size: 3450000,
      date: oneWeekAgo,
      dateStr: oneWeekAgo.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1920,
      height: 1080
    },
    {
      id: 'demo-8',
      name: 'Desierto_Dunas_Geométricas.jpg',
      url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
      size: 2190800,
      date: twoWeeksAgo,
      dateStr: twoWeeksAgo.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1920,
      height: 1280
    },
    {
      id: 'demo-9',
      name: 'Cascada_Verde_Tropical.jpg',
      url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80',
      size: 3980100,
      date: lastMonth,
      dateStr: lastMonth.toISOString().split('T')[0],
      sourceId: DEMO_SOURCE_ID,
      sourceName: 'Fotos de Muestra',
      width: 1920,
      height: 1280
    }
  ];
}
