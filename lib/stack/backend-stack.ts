import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { StorageAccount } from '../construct/azurerm/storage-account';
import { convertName, getRandomIdentifier, createBackend } from '../utils';

interface StorageContainerProps {
  name: string;
  containerAccessType: string;
}

export interface BackendStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  accountTier: string;
  accountReplicationType: string;
  storageContainers?: StorageContainerProps[];
}

export const devBackendStackProps: BackendStackProps = {
  name: `Dev-BackendStack-${getRandomIdentifier('Dev-BackendStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  accountTier: 'Standard',
  accountReplicationType: 'LRS',
  storageContainers: [
    {
      name: 'tfstate',
      containerAccessType: 'private',
    },
  ],
};

export const prodBackendStackProps: BackendStackProps = {
  name: `Prod-BackendStack-${getRandomIdentifier('Prod-BackendStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  accountTier: 'Standard',
  accountReplicationType: 'LRS',
  storageContainers: [
    {
      name: 'tfstate',
      containerAccessType: 'private',
    },
  ],
};

export class BackendStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, 'BackendStack');

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    const resourceGroupStack = new ResourceGroup(this, `ResourceGroupStack`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });

    new StorageAccount(this, `StorageAccountStack`, {
      name: convertName(`st-${props.name}`, 24),
      location: props.location,
      tags: props.tags,
      resourceGroupName: resourceGroupStack.resourceGroup.name,
      accountTier: props.accountTier,
      accountReplicationType: props.accountReplicationType,
      storageContainers: props.storageContainers,
    });
  }
}
