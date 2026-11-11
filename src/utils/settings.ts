import { SiteSettings, DEFAULT_SITE_SETTINGS } from '../types';
import { TKAPackage } from '../data/defaultPackages';

const SETTINGS_STORAGE_KEY = 'tka_guru_site_settings_v1';

export function getSiteSettings(): SiteSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
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
