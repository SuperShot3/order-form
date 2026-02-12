#!/usr/bin/env node
/**
 * Test OpenAI API connection and order parsing.
 * Run: node scripts/test-openai.js
 * Requires: OPENAI_API_KEY in .env
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SAMPLE_ORDER = `
Bouquet: Sweet Mix Bouquet — M size
Card message: "Happy Birthday!"
Delivery date: 15/02/2025
Delivery time: 10:00 - 12:00
Recipient name: Jane Doe
Delivery address: 123 Nimman Road, Nimman, Chiang Mai
https://maps.app.goo.gl/abc123
Sender phone: +66 81 234 5678
Preferred contact: WhatsApp
Items total: 1200
Delivery fee: 100
`;

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in .env');
    process.exit(1);
  }

  console.log('Testing OpenAI connection...\n');

  try {
    const { OpenAI } = require('openai');
    const client = new OpenAI({ apiKey });

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Extract flower delivery order data from the message. Return JSON only with keys: extracted (object with order fields) and missing_fields (array of field names that could not be extracted). Use internal keys: order_link, customer_name, receiver_name, phone, preferred_contact, delivery_date, time_window, district, full_address, maps_link, bouquet_name, size, card_text, items_total, delivery_fee.',
        },
        { role: 'user', content: SAMPLE_ORDER },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ No content in response');
      process.exit(1);
    }

    const parsed = JSON.parse(content);
    const { extracted, missing_fields } = parsed;

    console.log('✅ OpenAI API connection successful');
    console.log('   Model: gpt-4o-mini');
    console.log('   Usage:', completion.usage ? `${completion.usage.total_tokens} tokens` : 'N/A');
    console.log('\nExtracted fields:');
    Object.entries(extracted || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') console.log(`   ${k}: ${v}`);
    });
    if (missing_fields?.length) {
      console.log('\nMissing fields:', missing_fields.join(', '));
    }
    console.log('\n✅ Order parsing works as intended.');
  } catch (err) {
    console.error('❌ OpenAI error:', err.message);
    if (err.status) console.error('   Status:', err.status);
    if (err.code) console.error('   Code:', err.code);
    process.exit(1);
  }
}

testOpenAI();
