const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../data');
const SETTINGS_PATH = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  required_fields: [
    'bouquet_name',
    'size',
    'card_text',
    'delivery_date',
    'time_window',
    'district',
    'full_address',
    'maps_link',
    'receiver_name',
    'phone',
    'preferred_contact',
    'items_total',
  ],
  use_ai_parsing: true, // AI on by default when OPENAI_API_KEY is set
  district_options: [
    'Nimman',
    'Santitham',
    'Suthep',
    'Wualai',
    'Jed Yod',
    'Chang Khlan',
    'Doi Saket',
    'Hang Dong',
    'Mae Rim',
  ],
  time_window_options: [
    'Standard (during the day)',
    '08:00 - 10:00',
    '10:00 - 12:00',
    '12:00 - 14:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00',
    '19:00 - 21:00',
  ],
  size_options: ['S', 'M', 'L', 'XL'],
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getSettings() {
  ensureDataDir();
  if (!fs.existsSync(SETTINGS_PATH)) {
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    return { ...DEFAULT_SETTINGS };
  }
  const raw = fs.readFileSync(SETTINGS_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  const merged = { ...DEFAULT_SETTINGS, ...parsed };
  // Migrate: if OPENAI_API_KEY is set and use_ai_parsing was false, enable AI by default
  if (process.env.OPENAI_API_KEY && merged.use_ai_parsing === false && parsed.use_ai_parsing === false) {
    merged.use_ai_parsing = true;
    const toSave = { ...parsed, use_ai_parsing: true };
    ensureDataDir();
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(toSave, null, 2));
  }
  return merged;
}

function updateSettings(updates) {
  const current = getSettings();
  const merged = { ...current, ...updates };
  ensureDataDir();
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2));
  return merged;
}

module.exports = {
  getSettings,
  updateSettings,
  DEFAULT_SETTINGS,
};
