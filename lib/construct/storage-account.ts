import { Construct } from 'constructs';
import { storageAccount } from '@cdktf/provider-azurerm';

export interface StorageAccountProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  accountTier: string;
  accountReplicationType: string;
}

export class StorageAccount extends Construct {
  public readonly storageAccount: storageAccount.StorageAccount;

  constructor(scope: Construct, id: string, props: StorageAccountProps) {
    super(scope, id);

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
