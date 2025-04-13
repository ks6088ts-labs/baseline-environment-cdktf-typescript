import { Construct } from 'constructs';
import { aiFoundry } from '@cdktf/provider-azurerm';

export interface AiFoundryProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  storageAccountId: string;
  keyVaultId: string;
}

export class AiFoundry extends Construct {
  public readonly aiFoundry: aiFoundry.AiFoundry;
  constructor(scope: Construct, id: string, props: AiFoundryProps) {
    super(scope, id);

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
