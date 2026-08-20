export function validateInstitutionName(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const name = value.trim();
  if (name.length < 2 || name.length > 120) return null;

  return name;
}
