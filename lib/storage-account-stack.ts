import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider, storageAccount } from '@cdktf/provider-azurerm';

export interface StorageAccountStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  accountTier: string;
  accountReplicationType: string;
}

export class StorageAccountStack extends TerraformStack {
  public readonly storageAccount: storageAccount.StorageAccount;

  constructor(scope: Construct, id: string, props: StorageAccountStackProps) {
    super(scope, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    this.storageAccount = new storageAccount.StorageAccount(
      this,
      'storage_account',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
        accountTier: props.accountTier,
        accountReplicationType: props.accountReplicationType,
        identity: {
          type: 'SystemAssigned',
        },
      },
    );
  }
}
