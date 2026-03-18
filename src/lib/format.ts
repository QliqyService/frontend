export function formatDate(value: number | string | null | undefined): string {
  if (!value) {
    return "-";
  }

  const date =
    typeof value === "number"
      ? new Date(value < 1_000_000_000_000 ? value * 1000 : value)
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString();
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
