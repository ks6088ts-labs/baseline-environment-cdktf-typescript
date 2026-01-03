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
import { PostgresqlFlexibleServer } from '../construct/azurerm/postgresql-flexible-server';
import { DatabricksWorkspace } from '../construct/azurerm/databricks-workspace';

export interface AzurermDataStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  storageAccount?: {
    accountTier: string;
    accountReplicationType: string;
    isHnsEnabled?: boolean;
    storageContainers?: StorageContainerProps[];
  };
  cosmosdb?: {
    location: string;
    partitionKeyPaths: string[];
  };
  keyVault?: {
    skuName: string;
  };
  postgresqlFlexibleServer?: {
    skuName: string;
    administratorLogin: string;
    administratorPassword: string;
    version: string;
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
    isHnsEnabled: true,
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
  postgresqlFlexibleServer: {
    skuName: 'B_Standard_B1ms',
    administratorLogin: 'psqladmin',
    administratorPassword: 'P@ssw0rd1234!', // random password generator should be used in production
    version: '17',
  },
  databricksWorkspace: {
    sku: 'premium', // to use coding agent ref. https://devblogs.microsoft.com/all-things-azure/getting-started-with-claude-3-7-sonnet-on-azure-databricks/
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
        isHnsEnabled: props.storageAccount.isHnsEnabled,
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

    if (props.postgresqlFlexibleServer) {
      new PostgresqlFlexibleServer(this, `PostgresqlFlexibleServer`, {
        name: convertName(`psqlfs-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        skuName: props.postgresqlFlexibleServer.skuName,
        administratorLogin: props.postgresqlFlexibleServer.administratorLogin,
        administratorPassword:
          props.postgresqlFlexibleServer.administratorPassword,
        version: props.postgresqlFlexibleServer.version,
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
