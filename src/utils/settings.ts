import { SiteSettings, DEFAULT_SITE_SETTINGS } from '../types';
import { TKAPackage } from '../data/defaultPackages';

const SETTINGS_STORAGE_KEY = 'tka_guru_site_settings_v1';

export function getSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate previous schoolName and heroTitle if they contain old default texts
      if (!parsed.schoolName || parsed.schoolName.toLowerCase().includes('gugus') || parsed.schoolName.toLowerCase().includes('cicurug')) {
        parsed.schoolName = DEFAULT_SITE_SETTINGS.schoolName;
      }
      if (!parsed.heroTitle || parsed.heroTitle.toLowerCase().includes('kemampuan akademik')) {
        parsed.heroTitle = DEFAULT_SITE_SETTINGS.heroTitle;
      }
      if (parsed.announcement && parsed.announcement.includes('TKA Matematika dan Bahasa Indonesia')) {
        parsed.announcement = DEFAULT_SITE_SETTINGS.announcement;
      }
      return { ...DEFAULT_SITE_SETTINGS, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load site settings:', e);
  }
  return DEFAULT_SITE_SETTINGS;
}

export function saveSiteSettings(settings: SiteSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save site settings:', e);
  }
}
