import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import {
  provider,
  keyVault,
  dataAzurermClientConfig,
} from '@cdktf/provider-azurerm';

export interface KeyVaultStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  skuName: string;
  purgeProtectionEnabled: boolean;
}

export class KeyVaultStack extends TerraformStack {
  public readonly keyVault: keyVault.KeyVault;

  constructor(scope: Construct, id: string, props: KeyVaultStackProps) {
    super(scope, id);

    // Data Sources
    const clientConfig = new dataAzurermClientConfig.DataAzurermClientConfig(
      this,
      'client_config',
      {},
    );

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

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
