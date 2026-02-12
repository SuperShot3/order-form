const settingsService = require('./settingsService');

const ALL_KEYS = [
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
  'customer_name',
  'order_link',
];

function extractLocal(rawText) {
  const text = String(rawText || '');
  const extracted = {};
  const missing = [];

  // Bouquet: "Sweet Mix Bouquet — M size" or Bouquet: Sweet Mix Bouquet — M size
  const bouquetMatch = text.match(/(?:Bouquet|💐[\s]*Bouquet)[:\s]*["']?([^"'\n—]+)(?:\s*[—\-]\s*)?([SLMXsmlx]+)?\s*(?:size)?/i)
    || text.match(/(?:Bouquet|💐)[:\s]*([^—\n]+?)(?:\s*[—\-]\s*)?([SLMXsmlx]+)?\s*(?:size)?/i);
  if (bouquetMatch) {
    extracted.bouquet_name = (bouquetMatch[1] || '').trim();
    if (bouquetMatch[2]) extracted.size = bouquetMatch[2].trim().toUpperCase();
  }

  // Card message
  const cardMatch = text.match(/(?:Card message|📝[\s]*Card message|Card message)[:\s]*["']([^"']+)["']/i)
    || text.match(/(?:Card message|📝)[:\s]*([^\n]+?)(?=\n|$)/i);
  if (cardMatch) extracted.card_text = (cardMatch[1] || cardMatch[2] || '').trim();

  // Delivery date
  const dateMatch = text.match(/(?:Delivery date|📅[\s]*Delivery date|delivery date)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|[A-Za-z]+\s+\d{1,2},?\s+\d{4})/i)
    || text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
  if (dateMatch) extracted.delivery_date = dateMatch[1].trim();

  // Time window
  const timeMatch = text.match(/(?:Delivery time|⏰[\s]*Delivery time|time window)[:\s]*([^\n]+?)(?=\n|$)/i)
    || text.match(/(?:Standard|during the day)/i)
    || text.match(/(\d{2}:\d{2}\s*[-–]\s*\d{2}:\d{2})/);
  if (timeMatch) {
    if (timeMatch[1]) extracted.time_window = timeMatch[1].trim();
    else if (text.match(/Standard|during the day/i)) extracted.time_window = 'Standard (during the day)';
  }

  // Address
  const addrMatch = text.match(/(?:Delivery address|Full Address|📍[\s]*Delivery address|address)[:\s]*([^\n]+?)(?=\n|Google|$)/i)
    || text.match(/(?:Address|📍)[:\s]*([^\n]+)/i);
  if (addrMatch) extracted.full_address = (addrMatch[1] || '').trim();

  // Google Maps link
  const mapsMatch = text.match(/(https?:\/\/[^\s]+maps\.app\.goo\.gl[^\s]*)/i)
    || text.match(/(https?:\/\/[^\s]*google\.com\/maps[^\s]*)/i);
  if (mapsMatch) extracted.maps_link = mapsMatch[1].trim();

  // Recipient name
  const recipientMatch = text.match(/(?:Recipient name|👤[\s]*Recipient|Recipient)[:\s]*([^\n]+?)(?=\n|$)/i);
  if (recipientMatch) extracted.receiver_name = (recipientMatch[1] || '').trim().replace(/N\/A/i, '').trim() || undefined;

  // Phone
  const phoneMatch = text.match(/(?:phone|☎️[\s]*Sender phone|Sender phone)[:\s]*([+\d\s\-]+)/i)
    || text.match(/(\+?66[\s\d\-]+|\d{9,10})/);
  if (phoneMatch) extracted.phone = (phoneMatch[1] || phoneMatch[0] || '').trim();

  // Sender name
  const senderMatch = text.match(/(?:Sender name|Sender)[:\s]*([^\n]+?)(?=\n|$)/i);
  if (senderMatch) extracted.customer_name = (senderMatch[1] || '').trim().replace(/N\/A/i, '').trim() || undefined;

  // Preferred contact
  const contactMatch = text.match(/(?:Preferred contact|contact)[:\s]*(WhatsApp|LINE|Phone)/i);
  if (contactMatch) extracted.preferred_contact = contactMatch[1];

  // Items total
  const itemsMatch = text.match(/(?:Items total|💰[\s]*Items total|items total)[:\s]*(\d+(?:\.\d+)?)/i)
    || text.match(/(?:total|Total)[:\s]*(\d+(?:\.\d+)?)/i);
  if (itemsMatch) extracted.items_total = parseFloat(itemsMatch[1]);

  // Delivery fee
  const feeMatch = text.match(/(?:Delivery fee|🚚[\s]*Delivery fee|delivery fee)[:\s]*(\d+(?:\.\d+)?|0)/i);
  if (feeMatch) extracted.delivery_fee = parseFloat(feeMatch[1]);

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

    const schema = {
      type: 'object',
      properties: {
        extracted: {
          type: 'object',
          properties: {
            order_link: { type: 'string' },
            customer_name: { type: 'string' },
            receiver_name: { type: 'string' },
            phone: { type: 'string' },
            preferred_contact: { type: 'string', enum: ['WhatsApp', 'LINE', 'Phone'] },
            delivery_date: { type: 'string' },
            time_window: { type: 'string' },
            district: { type: 'string' },
            full_address: { type: 'string' },
            maps_link: { type: 'string' },
            bouquet_name: { type: 'string' },
            size: { type: 'string' },
            card_text: { type: 'string' },
            items_total: { type: 'number' },
            delivery_fee: { type: 'number' },
          },
        },
        missing_fields: { type: 'array', items: { type: 'string' } },
      },
      required: ['extracted', 'missing_fields'],
    };

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract flower delivery order data from the message. Return JSON only with keys: extracted (object with order fields) and missing_fields (array of field names that could not be extracted). Use internal keys: order_link, customer_name, receiver_name, phone, preferred_contact, delivery_date, time_window, district, full_address, maps_link, bouquet_name, size, card_text, items_total, delivery_fee.',
        },
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

async function parseOrder(rawText) {
  const settings = settingsService.getSettings();
  const useAI = settings.use_ai_parsing && process.env.OPENAI_API_KEY;

  if (useAI) {
    const aiResult = await parseWithAI(rawText);
    if (aiResult) return aiResult;
  }

  const local = extractLocal(rawText);
  return {
    extracted: local.extracted,
    missing_fields: local.missing || [],
  };
}

module.exports = { parseOrder };
