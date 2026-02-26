/**
 * Write a setting to localStorage and dispatch a custom event
 * so that useSettingsSync can detect same-tab changes without
 * monkey-patching localStorage.setItem.
 */
export function setSettingItem(key: string, value: string) {
  localStorage.setItem(key, value);
  window.dispatchEvent(new CustomEvent('setting-change', { detail: { key } }));
}
