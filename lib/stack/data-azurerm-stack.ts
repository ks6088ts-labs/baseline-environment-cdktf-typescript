import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { getRandomIdentifier, createBackend, convertName } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import {
  StorageAccount,
  StorageContainerProps,
} from '../construct/azurerm/storage-account';
import { Cosmosdb } from '../construct/azurerm/cosmosdb';

export interface DataAzurermStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  storageAccount?: {
    accountTier: string;
    accountReplicationType: string;
    storageContainers?: StorageContainerProps[];
  };
  cosmosdb?: {
    location: string;
    partitionKeyPaths: string[];
  };
}

export const dataAzurermStackProps: DataAzurermStackProps = {
  name: `DataAzurermStack-${getRandomIdentifier('DataAzurermStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  storageAccount: {
    accountTier: 'Standard',
    accountReplicationType: 'LRS',
    storageContainers: [
      {
        name: 'dev',
        containerAccessType: 'private',
      },
      {
        name: 'prod',
        containerAccessType: 'private',
      },
    ],
  },
  cosmosdb: {
    location: 'japaneast',
    partitionKeyPaths: ['/partitionKey'],
  },
};

export class DataAzurermStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: DataAzurermStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [
        {
          resourceGroup: [
            {
              preventDeletionIfContainsResources: false,
            },
          ],
        },
      ],
    });

    // Resources
    const resourceGroup = new ResourceGroup(this, `ResourceGroup`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });
    new TerraformOutput(this, 'resource_group_name', {
      value: resourceGroup.resourceGroup.name,
    });

    if (props.cosmosdb) {
      new Cosmosdb(this, `Cosmosdb`, {
        name: convertName(`cosmosdb-${props.name}`, 50),
        location: props.cosmosdb.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        partitionKeyPaths: props.cosmosdb.partitionKeyPaths,
      });
    }

    if (props.storageAccount) {
      new StorageAccount(this, `StorageAccount`, {
        name: convertName(`st-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        accountTier: props.storageAccount.accountTier,
        accountReplicationType: props.storageAccount.accountReplicationType,
      });
    }
  }
}
