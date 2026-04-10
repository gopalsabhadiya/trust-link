type CanonicalValue =
  | null
  | string
  | number
  | boolean
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

function sortObject(input: Record<string, unknown>): Record<string, CanonicalValue> {
  const sortedKeys = Object.keys(input).sort();
  const result: Record<string, CanonicalValue> = {};
  for (const key of sortedKeys) {
    result[key] = canonicalize(input[key]);
  }
  return result;
}

function canonicalize(value: unknown): CanonicalValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item));
  }

  if (value && typeof value === "object") {
    return sortObject(value as Record<string, unknown>);
  }

  return String(value);
}

export function canonicalJSONStringify(input: unknown): string {
  return JSON.stringify(canonicalize(input));
}
