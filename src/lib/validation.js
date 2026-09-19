export function isRequired(value) {
  return value !== undefined && value !== null && value.toString().trim().length > 0
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidYear(value) {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 && n <= 8
}

export function passwordsMatch(password, confirm) {
  return password.length > 0 && password === confirm
}