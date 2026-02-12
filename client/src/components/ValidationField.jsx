import { getFieldValidationState } from '../utils/validation';

const stateStyles = {
  invalid: 'field-invalid',
  valid: 'field-valid',
  optional: 'field-optional',
};

export default function ValidationField({
  label,
  children,
  value,
  required,
  fieldKey,
  className = '',
}) {
  const state = getFieldValidationState(value, required, fieldKey);
  const styleClass = stateStyles[state] || '';

  return (
    <div className={`form-field ${styleClass} ${className}`}>
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}
