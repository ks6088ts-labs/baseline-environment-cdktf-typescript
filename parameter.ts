import { PlaygroundStackProps } from './lib/stack/playground-stack';
import { BackendStackProps } from './lib/stack/backend-stack';

function getRandomIdentifier(content: string): string {
  const randomIdentifier = content
    .split('')
    .reduce((acc, char) => {
      acc = (acc << 5) - acc + char.charCodeAt(0);
      return acc & acc; // Convert to 32bit integer
    }, 0)
    .toString(36)
    .substring(2, 8);
  return randomIdentifier;
}

// Development Environment
export const devPlaygroundStackProps: PlaygroundStackProps = {
  name: `Dev-PlaygroundStack-${getRandomIdentifier('Dev-PlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  // backend: {
  //   resourceGroupName: 'rg-your-backend',
  //   storageAccountName: 'yourstorageaccount',
  //   containerName: 'tfstate',
  //   key: 'dev.terraform.tfstate',
  // },
  resourceGroup: {},
  // aiServices: {
  //   location: 'swedencentral',
  //   deployments: [
  //     {
  //       name: 'gpt-4o',
  //       model: {
  //         name: 'gpt-4o',
  //         version: '2024-08-06',
  //       },
  //       sku: {
  //         name: 'GlobalStandard',
  //         capacity: 450,
  //       },
  //     },
  //     {
  //       name: 'gpt-4o-mini',
  //       model: {
  //         name: 'gpt-4o-mini',
  //         version: '2024-07-18',
  //       },
  //       sku: {
  //         name: 'GlobalStandard',
  //         capacity: 2000,
  //       },
  //     },
  //   ],
  // },
  // containerAppEnvironment: {},
  // containerApp: {
  //   containers: [
  //     {
  //       name: 'nginx',
  //       image: 'nginx:latest',
  //       cpu: 0.5,
  //       memory: '1.0Gi',
  //       env: [
  //         {
  //           name: 'ENV_VAR1',
  //           value: 'value1',
  //         },
  //       ],
  //     },
  //   ],
  // },
  // apiManagement: {
  //   location: 'japaneast',
  //   publisherEmail: 'owner@example.com',
  //   publisherName: 'Owner Name',
  //   skuName: 'Consumption_0',
  // },
  // storageAccount: {
  //   accountTier: 'Standard',
  //   accountReplicationType: 'LRS',
  // },
  // keyVault: {
  //   skuName: 'standard',
  // },
  // aiFoundry: {},
  // aiFoundryProject: {},
  // kubernetesCluster: {
  //   nodeCount: 1,
  //   vmSize: 'Standard_DS2_v2',
  // },
  // containerRegistry: {
  //   location: 'japaneast',
  //   sku: 'Basic',
  //   adminEnabled: true,
  // },
};

export const devBackendStackProps: BackendStackProps = {
  name: `Dev-BackendStackProps-${getRandomIdentifier('Dev-BackendStackProps')}`,
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

// Production Environment
export const prodPlaygroundStackProps: PlaygroundStackProps = {
  name: `Prod-PlaygroundStack-${getRandomIdentifier('Prod-PlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  backend: {
    resourceGroupName: 'rg-your-backend',
    storageAccountName: 'yourstorageaccount',
    containerName: 'tfstate',
    key: 'prod.terraform.tfstate',
  },
  resourceGroup: {},
  aiServices: {
    location: 'japaneast',
    deployments: [
      {
        name: 'gpt-4o',
        model: {
          name: 'gpt-4o',
          version: '2024-08-06',
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
    ],
  },
  containerAppEnvironment: {},
  containerApp: {
    containers: [
      {
        name: 'container1',
        image: 'myregistry.azurecr.io/myapp:latest',
        cpu: 0.5,
        memory: '1.0Gi',
        env: [
          {
            name: 'ENV_VAR1',
            value: 'value1',
          },
        ],
      },
    ],
  },
  apiManagement: {
    location: 'swedencentral',
    publisherEmail: 'owner@example.com',
    publisherName: 'Owner Name',
    skuName: 'Consumption_0',
  },
  storageAccount: {
    accountTier: 'Standard',
    accountReplicationType: 'LRS',
  },
  keyVault: {
    skuName: 'standard',
  },
  aiFoundry: {},
  aiFoundryProject: {},
  kubernetesCluster: {
    nodeCount: 1,
    vmSize: 'Standard_DS2_v2',
  },
  containerRegistry: {
    location: 'japaneast',
    sku: 'Basic',
    adminEnabled: true,
  },
};

export const prodBackendStackProps: BackendStackProps = {
  name: `Prod-BackendStackProps-${getRandomIdentifier('Prod-BackendStackProps')}`,
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
