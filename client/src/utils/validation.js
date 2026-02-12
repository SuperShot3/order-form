export function validatePhone(value) {
  if (!value || value.trim() === '') return false;
  const cleaned = value.replace(/[\s\-\(\)]/g, '');
  return /^\d{9,10}$/.test(cleaned) || /^\+66\d{9}$/.test(cleaned);
}

export function validateMapsLink(value) {
  if (!value || value.trim() === '') return false;
  return (
    value.includes('maps.app.goo.gl') || value.includes('google.com/maps')
  );
}

export function validateMoney(value) {
  if (value === '' || value === null || value === undefined) return true;
  const n = parseFloat(value);
  return !isNaN(n) && n >= 0;
}

export function validateDate(value) {
  if (!value || value.trim() === '') return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

export function getFieldValidationState(value, required, fieldKey) {
  const empty = value === '' || value === null || value === undefined;
  if (required && empty) return 'invalid';
  if (empty && !required) return 'optional';
  if (fieldKey === 'phone') return validatePhone(value) ? 'valid' : 'invalid';
  if (fieldKey === 'maps_link') return validateMapsLink(value) ? 'valid' : 'invalid';
  if (['items_total', 'delivery_fee', 'florist_payment'].includes(fieldKey)) {
    return validateMoney(value) ? 'valid' : 'invalid';
  }
  if (fieldKey === 'delivery_date') return validateDate(value) ? 'valid' : 'invalid';
  return 'valid';
}
