import { get, set } from 'idb-keyval';
import { FolderSource, UserSettings } from '../types';

const SETTINGS_KEY = 'chromatic_user_settings';
const SOURCES_KEY = 'chromatic_folder_sources';

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  accent: 'blue',
  density: 'medium',
  sortOrder: 'newest'
};

export async function loadUserSettings(): Promise<UserSettings> {
  try {
    const saved = await get<UserSettings>(SETTINGS_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...saved } : DEFAULT_SETTINGS;
  } catch (err) {
    console.warn('Error loading settings from IDB:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  try {
    await set(SETTINGS_KEY, settings);
  } catch (err) {
    console.warn('Error saving settings to IDB:', err);
  }
}

export async function loadStoredSources(): Promise<FolderSource[]> {
  try {
    const saved = await get<FolderSource[]>(SOURCES_KEY);
    return saved || [];
  } catch (err) {
    console.warn('Error loading sources from IDB:', err);
    return [];
  }
}

export async function saveStoredSources(sources: FolderSource[]): Promise<void> {
  try {
    // Strip file system handles before storing if needed or keep structure
    const serializable = sources.map(s => ({
      id: s.id,
      name: s.name,
      addedAt: s.addedAt,
      count: s.count,
      isDemo: s.isDemo,
      path: s.path,
      handle: s.handle // idb-keyval supports storing FileSystemHandle natively in modern browsers
    }));
    await set(SOURCES_KEY, serializable);
  } catch (err) {
    console.warn('Error saving sources to IDB:', err);
  }
}
