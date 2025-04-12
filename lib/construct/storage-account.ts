import { Construct } from 'constructs';
import { storageAccount, storageContainer } from '@cdktf/provider-azurerm';

interface StorageContainerProps {
  name: string;
  containerAccessType: string;
}

export interface StorageAccountProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
  accountTier: string;
  accountReplicationType: string;
  storageContainers?: StorageContainerProps[];
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

    for (const container of props.storageContainers || []) {
      new storageContainer.StorageContainer(this, container.name, {
        name: container.name,
        storageAccountId: this.storageAccount.id,
        containerAccessType: container.containerAccessType,
      });
    }
  }
}
