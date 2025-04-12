export function convertName(name: string, length: number = 32): string {
  return name
    .replace(/[^a-z0-9]/g, '')
    .toLowerCase()
    .substring(0, length);
}
