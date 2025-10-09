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
import { KeyVault } from '../construct/azurerm/key-vault';
import { DatabricksWorkspace } from '../construct/azurerm/databricks-workspace';

export interface AzurermDataStackProps {
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
  keyVault?: {
    skuName: string;
  };
  databricksWorkspace?: {
    sku: string;
  };
}

export const azurermDataStackProps: AzurermDataStackProps = {
  name: `AzurermDataStack-${getRandomIdentifier('AzurermDataStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
    SecurityControl: 'Ignore',
    CostControl: 'Ignore',
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
  keyVault: {
    skuName: 'standard',
  },
  databricksWorkspace: {
    sku: 'standard',
  },
};

export class AzurermDataStack extends TerraformStack {
  public readonly storageAccount: StorageAccount | undefined;
  public readonly keyVault: KeyVault | undefined;
  constructor(scope: Construct, id: string, props: AzurermDataStackProps) {
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
      this.storageAccount = new StorageAccount(this, `StorageAccount`, {
        name: convertName(`st-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        accountTier: props.storageAccount.accountTier,
        accountReplicationType: props.storageAccount.accountReplicationType,
      });
    }

    if (props.keyVault) {
      this.keyVault = new KeyVault(this, `KeyVault`, {
        name: convertName(`kv-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        skuName: props.keyVault.skuName,
        purgeProtectionEnabled: false,
      });
    }

    if (props.databricksWorkspace) {
      new DatabricksWorkspace(this, `DatabricksWorkspace`, {
        name: convertName(`dbw-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        sku: props.databricksWorkspace.sku,
      });
    }
  }
}
