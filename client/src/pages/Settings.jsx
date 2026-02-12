import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../api/settings';
import { testOpenAIConnection } from '../api/parse';

const ALL_FIELD_KEYS = [
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
  'delivery_fee',
];

const FIELD_LABELS = {
  bouquet_name: 'Bouquet Name',
  size: 'Size',
  card_text: 'Card Text',
  delivery_date: 'Delivery Date',
  time_window: 'Time Window',
  district: 'District',
  full_address: 'Full Address',
  maps_link: 'Maps Link',
  receiver_name: 'Recipient Name',
  phone: 'Phone',
  preferred_contact: 'Preferred Contact',
  items_total: 'Total Amount Received',
  delivery_fee: 'Delivery Fee',
};

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingOpenAI, setTestingOpenAI] = useState(false);
  const [openaiTestResult, setOpenaiTestResult] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings).catch(() => setLoading(false)).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const addOption = (key) => {
    const prompts = { district_options: 'New district', time_window_options: 'New time window', size_options: 'New size (e.g. S, M, L)' };
    const prompt = prompts[key] || 'New option';
    const val = window.prompt(prompt);
    if (val?.trim()) {
      setSettings((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), val.trim()],
      }));
    }
  };

  const removeOption = (key, index) => {
    setSettings((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      alert('Settings saved');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRequired = (fieldKey) => {
    const current = settings.required_fields || [];
    const has = current.includes(fieldKey);
    setSettings((prev) => ({
      ...prev,
      required_fields: has
        ? current.filter((f) => f !== fieldKey)
        : [...current, fieldKey],
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (!settings) return <p>Failed to load settings</p>;

  return (
    <div>
      <h1>Settings</h1>
      <div className="settings-layout">
        <section className="settings-section">
          <h3>Required Fields</h3>
          <p className="hint">Check which fields are required for order entry.</p>
          <div className="checkbox-grid">
            {ALL_FIELD_KEYS.map((key) => (
              <label key={key} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={(settings.required_fields || []).includes(key)}
                  onChange={() => toggleRequired(key)}
                />
                {FIELD_LABELS[key] || key}
              </label>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h3>AI Parsing</h3>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.use_ai_parsing || false}
              onChange={(e) => update('use_ai_parsing', e.target.checked)}
            />
            Use AI parsing (requires OPENAI_API_KEY in .env)
          </label>
          <p className="hint">When enabled, pasted order text is parsed with OpenAI for better extraction.</p>
          <button
            type="button"
            onClick={async () => {
              setTestingOpenAI(true);
              setOpenaiTestResult(null);
              try {
                const r = await testOpenAIConnection();
                setOpenaiTestResult(r);
              } catch (e) {
                setOpenaiTestResult({ ok: false, error: e.message });
              } finally {
                setTestingOpenAI(false);
              }
            }}
            disabled={testingOpenAI}
            className="test-openai-btn"
          >
            {testingOpenAI ? 'Testing...' : 'Test OpenAI connection'}
          </button>
          {openaiTestResult && (
            <p className={openaiTestResult.ok ? 'openai-ok' : 'openai-err'}>
              {openaiTestResult.ok ? '✓ OpenAI connection OK' : `✗ ${openaiTestResult.error}`}
            </p>
          )}
        </section>

        <section className="settings-section">
          <h3>District Options</h3>
          <p className="hint">Add/remove options for the district dropdown.</p>
          <ul className="option-list">
            {(settings.district_options || []).map((opt, i) => (
              <li key={i}>
                {opt}
                <button type="button" onClick={() => removeOption('district_options', i)} className="remove-btn">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => addOption('district_options')}>Add District</button>
        </section>

        <section className="settings-section">
          <h3>Time Window Options</h3>
          <p className="hint">Add/remove options for the time window dropdown.</p>
          <ul className="option-list">
            {(settings.time_window_options || []).map((opt, i) => (
              <li key={i}>
                {opt}
                <button type="button" onClick={() => removeOption('time_window_options', i)} className="remove-btn">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => addOption('time_window_options')}>Add Time Window</button>
        </section>

        <section className="settings-section">
          <h3>Size Options</h3>
          <p className="hint">Add/remove options for the size dropdown (e.g. S, M, L, XL).</p>
          <ul className="option-list">
            {(settings.size_options || []).map((opt, i) => (
              <li key={i}>
                {opt}
                <button type="button" onClick={() => removeOption('size_options', i)} className="remove-btn">
                  Remove
                </button>
              </li>
            ))}
          </ul>
          <button onClick={() => addOption('size_options')}>Add Size</button>
        </section>

        <div className="form-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
