const settingsService = require('./settingsService');

const ALL_KEYS = [
  'order_id',
  'order_link',
  'bouquet_name',
  'size',
  'image_link',
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
  'customer_name',
];

function extractLocal(rawText) {
  const text = String(rawText || '');
  const extracted = {};
  const missing = [];

  // Order ID (e.g. LB-2026-FHI1DGZD)
  const orderIdMatch = text.match(/(?:Order ID|order_id)[:\s]*([A-Za-z0-9\-]+)/i)
    || text.match(/\b(LB-\d{4}-[A-Z0-9]+)\b/);
  if (orderIdMatch) extracted.order_id = (orderIdMatch[1] || '').trim();

  // Order/Details link
  const orderLinkMatch = text.match(/(?:Details link|order link|Order link)[:\s]*([^\s]+)/i)
    || text.match(/(https?:\/\/[^\s]*lannabloom\.shop\/order\/[^\s]+)/i);
  if (orderLinkMatch) extracted.order_link = (orderLinkMatch[1] || '').trim();

  // Bouquet: "Sweet Mix Bouquet — M size" or "🌹Single Rose Bouquet — Red — ฿455" or "Item\n\nSingle Rose Bouquet — Red — ฿455"
  const bouquetMatch = text.match(/[🌹💐]\s*([^—\n]+?)\s*[—\-]\s*([^—\n]+?)(?:\s*[—\-]\s*)?(?:฿|THB)?\s*(\d+)/i)
    || text.match(/(?:Item|Bouquet)[:\s]*([^—\n]+?)\s*[—\-]\s*([^—\n]+?)(?:\s*[—\-]\s*)?(?:฿|THB)?\s*(\d+)/i)
    || text.match(/(?:Bouquet|💐[\s]*Bouquet|Item)[:\s]*["']?([^"'\n—]+)(?:\s*[—\-]\s*)?([SLMXsmlx]+)?\s*(?:size)?/i)
    || text.match(/(?:Bouquet|💐)[:\s]*([^—\n]+?)(?:\s*[—\-]\s*)?([SLMXsmlx]+)?\s*(?:size)?/i);
  if (bouquetMatch) {
    extracted.bouquet_name = (bouquetMatch[1] || '').trim();
    if (bouquetMatch[2]) extracted.size = bouquetMatch[2].trim().toUpperCase();
    if (bouquetMatch[3] && !extracted.items_total) extracted.items_total = parseFloat(bouquetMatch[3]);
  }

  // Card message
  const cardMatch = text.match(/(?:Card message|📝[\s]*Card message|Card message)[:\s]*["']([^"']+)["']/i)
    || text.match(/(?:Card message|📝)[:\s]*([^\n]+?)(?=\n|$)/i);
  if (cardMatch) extracted.card_text = (cardMatch[1] || cardMatch[2] || '').trim();

  // Delivery date
  const dateMatch = text.match(/(?:Delivery date|📅[\s]*Delivery date|delivery date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|[A-Za-z]+\s+\d{1,2},?\s+\d{4})/i)
    || text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (dateMatch) extracted.delivery_date = dateMatch[1].trim();

  // Time window (Preferred time, Delivery time)
  const timeMatch = text.match(/(?:Preferred time|Delivery time|⏰[\s]*Delivery time|time window)[:\s]*([^\n]+?)(?=\n|$)/i)
    || text.match(/(?:Standard|during the day)/i)
    || text.match(/(\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2})/);
  if (timeMatch) {
    if (timeMatch[1]) extracted.time_window = timeMatch[1].trim();
    else if (text.match(/Standard|during the day/i)) extracted.time_window = 'Standard (during the day)';
  }

  // Address (including coordinates: "Selected: 18.79497, 98.97051")
  const addrMatch = text.match(/(?:Delivery address|Full Address|📍[\s]*Delivery address|Address)[:\s]*([^\n]+?)(?=\n|Google|$)/i)
    || text.match(/(?:Address|Selected)[:\s]*([\d.,\s]+)/i)
    || text.match(/(?:Address|📍)[:\s]*([^\n]+)/i);
  if (addrMatch) extracted.full_address = (addrMatch[1] || '').trim();

  // Google Maps link
  const mapsMatch = text.match(/(https?:\/\/[^\s]+maps\.app\.goo\.gl[^\s]*)/i)
    || text.match(/(https?:\/\/[^\s]*google\.com\/maps[^\s]*)/i);
  if (mapsMatch) extracted.maps_link = mapsMatch[1].trim();

  // Image link (flower photo, Link to flower, catalog URL)
  const imageMatch = text.match(/(?:Link to flower|Image|Photo|Flower image|image_link)[:\s]*([^\s]+)/i)
    || text.match(/(https?:\/\/[^\s]*lannabloom\.shop[^\s]*)/i)
    || text.match(/(https?:\/\/[^\s]*(?:imgur|i\.ibb|drive\.google|dropbox)[^\s]*)/i);
  if (imageMatch) extracted.image_link = imageMatch[1].trim();

  // Recipient name
  const recipientMatch = text.match(/(?:Recipient name|👤[\s]*Recipient|Recipient)[:\s]*([^\n]+?)(?=\n|Recipient phone|$)/i);
  if (recipientMatch) extracted.receiver_name = (recipientMatch[1] || '').trim().replace(/N\/A/i, '').trim() || undefined;

  // Phone (prefer Sender as main contact, then Recipient)
  const senderPhoneMatch = text.match(/(?:Sender)[:\s]*[^\d]*([+\d\s\-]{9,})/i);
  const recipientPhoneMatch = text.match(/(?:Recipient phone)[:\s]*([+\d\s\-]+)/i);
  const phoneMatch = senderPhoneMatch
    || recipientPhoneMatch
    || text.match(/(?:phone|Sender phone)[:\s]*([+\d\s\-]+)/i)
    || text.match(/(\+?66[\s\d\-]+|\d{9,10})/);
  if (phoneMatch) extracted.phone = (phoneMatch[1] || phoneMatch[0] || '').trim().replace(/\s/g, '');

  // Sender name
  const senderMatch = text.match(/(?:Sender name|Sender)[:\s]*([^\n]+?)(?=\n|$)/i);
  if (senderMatch) extracted.customer_name = (senderMatch[1] || '').trim().replace(/N\/A/i, '').trim() || undefined;

  // Preferred contact
  const contactMatch = text.match(/(?:Preferred contact|contact)[:\s]*(WhatsApp|LINE|Phone)/i);
  if (contactMatch) extracted.preferred_contact = contactMatch[1];

  // Items total (Bouquet: ฿455 or Total: ฿455)
  const itemsMatch = text.match(/(?:Items total|Bouquet|💰[\s]*Items total)[:\s]*(?:฿|THB)?\s*(\d+(?:\.\d+)?)/i)
    || text.match(/(?:total|Total)[:\s]*(?:฿|THB)?\s*(\d+(?:\.\d+)?)/i)
    || text.match(/[—\-]\s*(?:฿|THB)?\s*(\d+)/);
  if (itemsMatch) extracted.items_total = parseFloat(itemsMatch[1]);

  // Delivery fee (use 0 if "Calculated by driver")
  if (/calculated by driver|delivery fee\s*:\s*calculated/i.test(text)) {
    extracted.delivery_fee = 0;
  } else {
    const feeMatch = text.match(/(?:Delivery fee|🚚[\s]*Delivery fee|delivery fee)[:\s]*(\d+(?:\.\d+)?|0)/i);
    if (feeMatch) extracted.delivery_fee = parseFloat(feeMatch[1]);
  }

  // District - try to find from common list
  const districts = ['Nimman', 'Santitham', 'Suthep', 'Wualai', 'Jed Yod', 'Chang Khlan', 'Doi Saket', 'Hang Dong', 'Mae Rim'];
  for (const d of districts) {
    if (new RegExp(d, 'i').test(text)) {
      extracted.district = d;
      break;
    }
  }

  return { extracted, missing: computeMissing(extracted) };
}

function computeMissing(extracted) {
  const critical = ['bouquet_name', 'size', 'card_text', 'delivery_date', 'time_window', 'full_address', 'maps_link', 'receiver_name', 'phone', 'preferred_contact', 'items_total'];
  return critical.filter((k) => {
    const v = extracted[k];
    return v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v));
  });
}

async function parseWithAI(rawText) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const { OpenAI } = require('openai');
    const client = new OpenAI({ apiKey });

    const prompt = `Extract flower delivery order data from the pasted text (often from Lanna Bloom shop). Return JSON only with two keys:
  1. "extracted" - object with order fields. Use these EXACT keys:
     order_id - Order ID (e.g. LB-2026-FHI1DGZD)
     order_link - Full details URL (https://www.lannabloom.shop/order/...)
     delivery_date - YYYY-MM-DD format (e.g. Feb 20, 2026 → 2026-02-20)
     time_window - Preferred time (e.g. 11:00-12:00)
     full_address - Address text or coordinates (e.g. "18.79497, 98.97051" or "Selected: 18.79497, 98.97051")
     maps_link - Google Maps URL
     receiver_name - Recipient name
     phone - Sender/customer phone (main contact number)
     customer_name - Sender name
     preferred_contact - Phone, WhatsApp, or LINE
     bouquet_name - Product name from Item line (e.g. "Single Rose Bouquet")
     size - Variant like Red, or S/M/L/XL if present
     image_link - Link to flower / catalog URL
     items_total - Bouquet total as number only (e.g. 455 from ฿455)
     delivery_fee - Number; use 0 if "Calculated by driver"
     card_text, district, notes - if present
  2. "missing_fields" - array of field names not found in the text

  Text format hints:
  - Order ID, Details link, Delivery date, Preferred time, Address, Recipient name, Recipient phone
  - Item line: "🌹Single Rose Bouquet — Red — ฿455" → bouquet_name, size/variant, items_total
  - Link to flower, Totals (Bouquet, Delivery fee, Total)
  - Sender name, Sender phone, Preferred contact
  - Address may be coordinates: "Selected: 18.79497, 98.97051"
  - Dates: normalize to YYYY-MM-DD (Feb 20, 2026 → 2026-02-20)
  - Strip ฿ and currency symbols from numbers
  - Districts: Nimman, Santitham, Suthep, Wualai, Jed Yod, Chang Khlan, Doi Saket, Hang Dong, Mae Rim`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: rawText },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      extracted: parsed.extracted || {},
      missing_fields: parsed.missing_fields || [],
    };
  } catch (err) {
    console.error('AI parse error:', err.message);
    return null;
  }
}

/** Normalize date to YYYY-MM-DD for date input */
function normalizeDate(val) {
  if (!val || typeof val !== 'string') return val;
  const s = val.trim();
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD/MM/YYYY or DD-MM-YYYY
  const ddmmyy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (ddmmyy) {
    const [, d, m, y] = ddmmyy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // YYYY/MM/DD
  const yyyymmdd = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (yyyymmdd) {
    const [, y, m, d] = yyyymmdd;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Month name: Feb 20, 2026 or February 20, 2026
  const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
  const monthNameMatch = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (monthNameMatch) {
    const [, mon, d, y] = monthNameMatch;
    const m = months[mon.toLowerCase().slice(0, 3)];
    if (m) return `${y}-${m}-${d.padStart(2, '0')}`;
  }
  return val;
}

async function parseOrder(rawText) {
  const settings = await settingsService.getSettings();
  // Use AI automatically when OPENAI_API_KEY is set (no manual toggle needed)
  const useAI = !!process.env.OPENAI_API_KEY && (settings.use_ai_parsing !== false);

  if (useAI) {
    const aiResult = await parseWithAI(rawText);
    if (aiResult) {
      const extracted = { ...aiResult.extracted };
      if (extracted.delivery_date) extracted.delivery_date = normalizeDate(extracted.delivery_date);
      return { extracted, missing_fields: aiResult.missing_fields || [], ai_used: true };
    }
    const local = extractLocal(rawText);
    const extracted = { ...local.extracted };
    if (extracted.delivery_date) extracted.delivery_date = normalizeDate(extracted.delivery_date);
    return {
      extracted,
      missing_fields: local.missing || [],
      ai_used: false,
      ai_failed: true,
    };
  }

  const local = extractLocal(rawText);
  const extracted = { ...local.extracted };
  if (extracted.delivery_date) extracted.delivery_date = normalizeDate(extracted.delivery_date);
  return {
    extracted,
    missing_fields: local.missing || [],
    ai_used: false,
  };
}

/** Returns { aiAvailable: boolean } - whether AI parsing can be used */
async function getParseStatus() {
  const settings = await settingsService.getSettings();
  const hasKey = !!process.env.OPENAI_API_KEY;
  const useAI = hasKey && (settings.use_ai_parsing !== false);
  return { aiAvailable: !!useAI };
}

/** Test OpenAI connection - returns { ok, model?, error? } */
async function testOpenAIConnection() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'OPENAI_API_KEY is not set in .env' };
  }
  try {
    const { OpenAI } = require('openai');
    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Say "OK" in one word.' }],
      max_tokens: 5,
    });
    const content = completion.choices[0]?.message?.content;
    return { ok: !!content, model: 'gpt-4o-mini' };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

module.exports = { parseOrder, testOpenAIConnection, getParseStatus };
