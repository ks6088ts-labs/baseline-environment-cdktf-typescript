import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, aiFoundry } from '@cdktf/provider-azurerm';

export interface AiFoundryStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  storageAccountId: string;
  keyVaultId: string;
}

export class AiFoundryStack extends TerraformStack {
  public readonly aiFoundry: aiFoundry.AiFoundry;
  constructor(scope: Construct, id: string, props: AiFoundryStackProps) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    this.aiFoundry = new aiFoundry.AiFoundry(this, 'ai_foundry', {
      name: props.name,
      location: props.location,
      tags: props.tags,
      resourceGroupName: props.resourceGroupName,
      storageAccountId: props.storageAccountId,
      keyVaultId: props.keyVaultId,
      identity: {
        type: 'SystemAssigned',
      },
    });
  }
}
