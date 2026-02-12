const { createClient } = require('@supabase/supabase-js');

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
  use_ai_parsing: false,
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

function useSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  return !!(url && key);
}

function getClient() {
  const { createClient } = require('@supabase/supabase-js');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  return createClient(url, key);
}

async function getSettings() {
  if (!useSupabase()) return { ...DEFAULT_SETTINGS };

  const supabase = getClient();
  const { data, error } = await supabase.from('app_settings').select('*').eq('id', 1).single();
  if (error || !data) return { ...DEFAULT_SETTINGS };

  return {
    ...DEFAULT_SETTINGS,
    required_fields: data.required_fields || DEFAULT_SETTINGS.required_fields,
    use_ai_parsing: data.use_ai_parsing ?? DEFAULT_SETTINGS.use_ai_parsing,
    district_options: data.district_options || DEFAULT_SETTINGS.district_options,
    time_window_options: data.time_window_options || DEFAULT_SETTINGS.time_window_options,
    size_options: data.size_options || DEFAULT_SETTINGS.size_options,
  };
}

async function updateSettings(updates) {
  if (!useSupabase()) return { ...DEFAULT_SETTINGS, ...updates };

  const supabase = getClient();
  const { data, error } = await supabase
    .from('app_settings')
    .update({
      required_fields: updates.required_fields,
      use_ai_parsing: updates.use_ai_parsing,
      district_options: updates.district_options,
      time_window_options: updates.time_window_options,
      size_options: updates.size_options,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
    .select()
    .single();

  if (error) throw error;

  return {
    ...DEFAULT_SETTINGS,
    ...data,
  };
}

module.exports = {
  useSupabase,
  getSettings,
  updateSettings,
  DEFAULT_SETTINGS,
};
