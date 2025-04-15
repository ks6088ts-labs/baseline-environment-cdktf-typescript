import { TerraformStack, AzurermBackend } from 'cdktf';

export function createBackend(stack: TerraformStack, key: string) {
  const backend = process.env.TF_BACKEND?.toLowerCase() || 'local';

  if (backend === 'azurerm') {
    // use azurerm backend
    new AzurermBackend(stack, {
      resourceGroupName: 'rg-tfstate',
      storageAccountName: 'ks6088tstfstate',
      containerName: 'dev',
      key: `${key}.tfstate`,
    });
  }
}

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
