import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { convertName, getRandomIdentifier, createBackend } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { AiServices } from '../construct/azurerm/ai-services';
import {
  StorageAccount,
  StorageContainerProps,
} from '../construct/azurerm/storage-account';
import { KeyVault } from '../construct/azurerm/key-vault';
import { AiFoundry } from '../construct/azurerm/ai-foundry';
import { AiFoundryProject } from '../construct/azurerm/ai-foundry-project';

interface AiServicesDeployment {
  name: string;
  model: {
    name: string;
    version: string;
  };
  sku: {
    name: string;
    capacity: number;
  };
}

export interface AiAzurermStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  aiServices: {
    location: string;
    publicNetworkAccess?: string;
    deployments?: AiServicesDeployment[];
  }[];
  storageAccount: {
    accountTier: string;
    accountReplicationType: string;
    storageContainers?: StorageContainerProps[];
  };
  keyVault: {
    skuName: string;
  };
  aiFoundry: {};
  aiFoundryProject: {};
}

export const aiAzurermStackProps: AiAzurermStackProps = {
  name: `AiAzurermStackProps-${getRandomIdentifier('AiAzurermStackProps')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  aiServices: [
    {
      location: 'japaneast',
      deployments: [
        {
          name: 'o3-mini',
          model: {
            name: 'o3-mini',
            version: '2025-01-31',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'o1',
          model: {
            name: 'o1',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-4o-mini',
          model: {
            name: 'gpt-4o-mini',
            version: '2024-07-18',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2000,
          },
        },
        {
          name: 'text-embedding-3-large',
          model: {
            name: 'text-embedding-3-large',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
        {
          name: 'text-embedding-3-small',
          model: {
            name: 'text-embedding-3-small',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
      ],
    },
    {
      location: 'eastus',
      deployments: [
        {
          name: 'o3-mini',
          model: {
            name: 'o3-mini',
            version: '2025-01-31',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'o1',
          model: {
            name: 'o1',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-4o-mini',
          model: {
            name: 'gpt-4o-mini',
            version: '2024-07-18',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2000,
          },
        },
        {
          name: 'text-embedding-3-large',
          model: {
            name: 'text-embedding-3-large',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
        {
          name: 'text-embedding-3-small',
          model: {
            name: 'text-embedding-3-small',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
      ],
    },
    {
      location: 'eastus2',
      deployments: [
        {
          name: 'gpt-4.1',
          model: {
            name: 'gpt-4.1',
            version: '2025-04-14',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'gpt-4.5-preview',
          model: {
            name: 'gpt-4.5-preview',
            version: '2025-02-27',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 150,
          },
        },
        {
          name: 'o4-mini',
          model: {
            name: 'o4-mini',
            version: '2025-04-16',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'o3',
          model: {
            name: 'o3',
            version: '2025-04-16',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 1000,
          },
        },
        {
          name: 'o3-mini',
          model: {
            name: 'o3-mini',
            version: '2025-01-31',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'o1',
          model: {
            name: 'o1',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 500,
          },
        },
        {
          name: 'gpt-4o',
          model: {
            name: 'gpt-4o',
            version: '2024-11-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 450,
          },
        },
        {
          name: 'gpt-4o-transcribe',
          model: {
            name: 'gpt-4o-transcribe',
            version: '2025-03-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 160,
          },
        },
        {
          name: 'gpt-4o-mini',
          model: {
            name: 'gpt-4o-mini',
            version: '2024-07-18',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2000,
          },
        },
        {
          name: 'gpt-4o-mini-tts',
          model: {
            name: 'gpt-4o-mini-tts',
            version: '2025-03-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 160,
          },
        },
        {
          name: 'gpt-4o-mini-transcribe',
          model: {
            name: 'gpt-4o-mini-transcribe',
            version: '2025-03-20',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 160,
          },
        },
        {
          name: 'gpt-4o-mini-realtime-preview',
          model: {
            name: 'gpt-4o-mini-realtime-preview',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 6,
          },
        },
        {
          name: 'gpt-4o-mini-audio-preview',
          model: {
            name: 'gpt-4o-mini-audio-preview',
            version: '2024-12-17',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2000,
          },
        },
        {
          name: 'text-embedding-3-large',
          model: {
            name: 'text-embedding-3-large',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
        {
          name: 'text-embedding-3-small',
          model: {
            name: 'text-embedding-3-small',
            version: '1',
          },
          sku: {
            name: 'Standard',
            capacity: 350,
          },
        },
        {
          name: 'whisper',
          model: {
            name: 'whisper',
            version: '001',
          },
          sku: {
            name: 'Standard',
            capacity: 3,
          },
        },
        // Video generation models > Region availability: https://learn.microsoft.com/en-us/azure/ai-services/openai/concepts/models?tabs=global-standard%2Cstandard-chat-completions#region-availability-6
        {
          name: 'sora',
          model: {
            name: 'sora',
            version: '2025-05-02',
          },
          sku: {
            name: 'Standard',
            capacity: 60,
          },
        },
      ],
    },
    {
      location: 'westus3',
      deployments: [
        {
          name: 'gpt-image-1',
          model: {
            name: 'gpt-image-1',
            version: '2025-04-15',
          },
          sku: {
            name: 'GlobalStandard',
            capacity: 2,
          },
        },
      ],
    },
  ],
  storageAccount: {
    accountTier: 'Standard',
    accountReplicationType: 'LRS',
    storageContainers: [
      {
        name: 'container1',
        containerAccessType: 'private',
      },
      {
        name: 'container2',
        containerAccessType: 'private',
      },
    ],
  },
  keyVault: {
    skuName: 'standard',
  },
  aiFoundry: {},
  aiFoundryProject: {},
};

export class AiAzurermStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AiAzurermStackProps) {
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

    props.aiServices.map((aiService, i) => {
      return new AiServices(this, `AiServices-${aiService.location}-${i}`, {
        name: `ai-services-${props.name}-${i}`,
        location: aiService.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        customSubdomainName: `ai-services-${props.name}-${i}`.toLowerCase(),
        skuName: 'S0',
        publicNetworkAccess: aiService.publicNetworkAccess,
        deployments: aiService.deployments,
      });
    });

    const storageAccount = new StorageAccount(this, `StorageAccount`, {
      name: convertName(`st-${props.name}`, 24),
      location: props.location,
      tags: props.tags,
      resourceGroupName: resourceGroup.resourceGroup.name,
      accountTier: props.storageAccount.accountTier,
      accountReplicationType: props.storageAccount.accountReplicationType,
    });

    const keyVault = new KeyVault(this, `KeyVault`, {
      name: convertName(`kv-${props.name}`, 24),
      location: props.location,
      tags: props.tags,
      resourceGroupName: resourceGroup.resourceGroup.name,
      skuName: props.keyVault.skuName,
      purgeProtectionEnabled: false,
    });

    const aiFoundry = new AiFoundry(this, `AiFoundry`, {
      name: convertName(`af-${props.name}`, 33),
      location: props.location,
      tags: props.tags,
      resourceGroupName: resourceGroup.resourceGroup.name,
      storageAccountId: storageAccount.storageAccount.id,
      keyVaultId: keyVault.keyVault.id,
    });

    new AiFoundryProject(this, `AiFoundryProject`, {
      name: convertName(`afp-${props.name}`, 32),
      location: props.location,
      tags: props.tags,
      aiServicesHubId: aiFoundry.aiFoundry.id,
    });
  }
}
