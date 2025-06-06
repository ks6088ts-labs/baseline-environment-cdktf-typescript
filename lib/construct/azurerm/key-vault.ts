import { Construct } from 'constructs';
import { keyVault, dataAzurermClientConfig } from '@cdktf/provider-azurerm';

export interface KeyVaultProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  skuName: string;
  purgeProtectionEnabled: boolean;
}

export class KeyVault extends Construct {
  public readonly keyVault: keyVault.KeyVault;

  constructor(scope: Construct, id: string, props: KeyVaultProps) {
    super(scope, id);

    // Data Sources
    const clientConfig = new dataAzurermClientConfig.DataAzurermClientConfig(
      this,
      'client_config',
      {},
    );

    // Resources
    this.keyVault = new keyVault.KeyVault(this, 'key_vault', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      tenantId: clientConfig.tenantId,
      skuName: props.skuName,
      purgeProtectionEnabled: props.purgeProtectionEnabled,
    });
  }
}
