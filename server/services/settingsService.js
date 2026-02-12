const supabaseSettings = require('./supabaseSettingsService');
const fileSettings = require('./fileSettingsService');

function useSupabase() {
  return supabaseSettings.useSupabase && supabaseSettings.useSupabase();
}

async function getSettings() {
  return useSupabase() ? supabaseSettings.getSettings() : Promise.resolve(fileSettings.getSettings());
}

async function updateSettings(updates) {
  return useSupabase() ? supabaseSettings.updateSettings(updates) : Promise.resolve(fileSettings.updateSettings(updates));
}

module.exports = {
  getSettings,
  updateSettings,
  DEFAULT_SETTINGS: fileSettings.DEFAULT_SETTINGS,
};
