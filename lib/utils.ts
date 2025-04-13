export function convertName(name: string, length: number = 32): string {
  return name
    .replace(/[^a-z0-9]/g, '')
    .toLowerCase()
    .substring(0, length);
}

export function getRandomIdentifier(content: string): string {
  const randomIdentifier = content
    .split('')
    .reduce((acc, char) => {
      acc = (acc << 5) - acc + char.charCodeAt(0);
      return acc & acc; // Convert to 32bit integer
    }, 0)
    .toString(36)
    .substring(2, 8);
  return randomIdentifier;
}
