export function formatDate(value: number | null | undefined): string {
  if (!value) {
    return "-";
  }

  return new Date(value * 1000).toLocaleString();
}

export function userDisplayName(firstName?: string | null, lastName?: string | null, email?: string): string {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || email || "User";
}

export function normalizePhone(value: string): number | undefined {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return undefined;
  }

  return Number(digits);
}
