export const required = (label) => (v) =>
  !v?.toString().trim() ? `${label} is required` : null

export const minLength = (min) => (v) =>
  v?.length < min ? `Minimum ${min} characters` : null

export const timeAfter = (startField, label = 'End time') => (v, form) =>
  v && form[startField] && v <= form[startField] ? `${label} must be after start time` : null

export const isPositive = (label) => (v) =>
  Number(v) <= 0 ? `${label} must be positive` : null

/**
 * Run a rules map against a form object.
 * rules = { fieldName: [validator, ...] }
 * Returns { fieldName: 'error message' } for any failures.
 */
export function validate(rules, form) {
  const errors = {}
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const msg = validator(form[field], form)
      if (msg) { errors[field] = msg; break }
    }
  }
  return errors
}
