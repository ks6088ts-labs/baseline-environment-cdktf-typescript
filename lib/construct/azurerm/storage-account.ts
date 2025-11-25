import { Construct } from 'constructs';
import {
  storageAccount,
  storageContainer,
  storageQueue,
} from '@cdktf/provider-azurerm';

export interface StorageContainerProps {
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
  isHnsEnabled?: boolean;
  storageContainers?: StorageContainerProps[];
}

export class StorageAccount extends Construct {
  public readonly storageAccount: storageAccount.StorageAccount;
  public readonly storageContainers: storageContainer.StorageContainer[];
  public readonly storageQueue: storageQueue.StorageQueue;

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
        isHnsEnabled: props.isHnsEnabled,
        identity: {
          type: 'SystemAssigned',
        },
      },
    );

    this.storageContainers = [];
    for (const container of props.storageContainers || []) {
      const containerResource = new storageContainer.StorageContainer(
        this,
        container.name,
        {
          name: container.name,
          storageAccountId: this.storageAccount.id,
          containerAccessType: container.containerAccessType,
        },
      );
      this.storageContainers.push(containerResource);
    }

    this.storageQueue = new storageQueue.StorageQueue(this, 'storage_queue', {
      name: `${props.name}-queue`,
      storageAccountName: this.storageAccount.name,
    });
  }
}
