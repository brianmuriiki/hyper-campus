const REQUIRED_FIELDS = ['campus', 'admission_number', 'year_of_study', 'course', 'phone_number', 'id_number']

export function isProfileComplete(user) {
  if (!user) return false
  return REQUIRED_FIELDS.every((field) => user[field] !== null && user[field] !== undefined && user[field] !== '')
}