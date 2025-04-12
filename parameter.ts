import { PlaygroundStackProps } from './lib/stack/playground-stack';

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
export const devPlaygroundStackParameter: PlaygroundStackProps = {
  name: `Dev-PlaygroundStack-${getRandomIdentifier('Dev-PlaygroundStack')}`,
  location: 'swedencentral',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  aiServices: {
    location: 'swedencentral',
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
        name: 'nginx',
        image: 'nginx:latest',
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

// Production Environment
export const prodPlaygroundStackParameter: PlaygroundStackProps = {
  name: `Prod-PlaygroundStack-${getRandomIdentifier('Prod-PlaygroundStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
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
