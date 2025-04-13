import { Construct } from 'constructs';
import { TerraformStack, AzurermBackend } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { AiFoundryProject } from '../construct/ai-foundry-project';
import { AiFoundry } from '../construct/ai-foundry';
import { AiServices } from '../construct/ai-services';
import { ContainerAppEnvironment } from '../construct/container-app-environment';
import { ContainerApp } from '../construct/container-app';
import { ContainerRegistry } from '../construct/container-registry';
import { ApiManagement } from '../construct/api-management';
import { KeyVault } from '../construct/key-vault';
import { KubernetesCluster } from '../construct/kubernetes-cluster';
import { ResourceGroup } from '../construct/resource-group';
import { StorageAccount } from '../construct/storage-account';
import { convertName } from '../utils';

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

export interface PlaygroundStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  backend?: {
    resourceGroupName: string;
    storageAccountName: string;
    containerName: string;
    key: string;
  };
  aiServices?: {
    location: string;
    deployments?: AiServicesDeployment[];
  };
  containerAppEnvironment?: {};
  containerApp?: {
    containers: [
      {
        name: string;
        image: string;
        cpu: number;
        memory: string;
        env: [
          {
            name: string;
            value: string;
          },
        ];
      },
    ];
  };
  apiManagement?: {
    location: string;
    publisherEmail: string;
    publisherName: string;
    skuName: string;
  };
  storageAccount?: {
    accountTier: string;
    accountReplicationType: string;
  };
  keyVault?: {
    skuName: string;
  };
  aiFoundry?: {};
  aiFoundryProject?: {};
  kubernetesCluster?: {
    nodeCount: number;
    vmSize: string;
  };
  containerRegistry?: {
    location: string;
    sku: string;
    adminEnabled: boolean;
  };
}

export class PlaygroundStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: PlaygroundStackProps) {
    super(scope, id);

    // Backend
    if (props.backend) {
      new AzurermBackend(this, {
        resourceGroupName: props.backend.resourceGroupName,
        storageAccountName: props.backend.storageAccountName,
        containerName: props.backend.containerName,
        key: props.backend.key,
      });
    }

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Resources
    const resourceGroup = new ResourceGroup(this, `ResourceGroup`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });

    if (props.aiServices) {
      new AiServices(this, `AiServices`, {
        name: `ai-services-${props.name}`,
        location: props.aiServices.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        customSubdomainName: `ai-services-${props.name}`,
        skuName: 'S0',
        publicNetworkAccess: 'Enabled',
        deployments: props.aiServices.deployments,
      });
    }

    if (props.containerAppEnvironment) {
      const containerAppEnvironment = new ContainerAppEnvironment(
        this,
        `ContainerAppEnvironment`,
        {
          name: `container-app-env-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
        },
      );

      if (props.containerApp) {
        new ContainerApp(this, `ContainerApp`, {
          name: convertName(`ca-${props.name}`),
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
          containerAppEnvironmentId:
            containerAppEnvironment.containerAppEnvironment.id,
          containerAppTemplateContainers: props.containerApp.containers,
        });
      }
    }

    if (props.kubernetesCluster) {
      new KubernetesCluster(this, `KubernetesCluster`, {
        name: `k8s-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        nodeCount: props.kubernetesCluster.nodeCount,
        vmSize: props.kubernetesCluster.vmSize,
      });
    }

    if (props.containerRegistry) {
      new ContainerRegistry(this, `ContainerRegistry`, {
        name: convertName(`acr-${props.name}`),
        location: props.containerRegistry.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        sku: props.containerRegistry.sku,
        adminEnabled: props.containerRegistry.adminEnabled,
      });
    }

    if (props.apiManagement) {
      new ApiManagement(this, `ApiManagement`, {
        name: `apim-${props.name}`,
        location: props.apiManagement.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        publisherEmail: props.apiManagement.publisherEmail,
        publisherName: props.apiManagement.publisherName,
        skuName: props.apiManagement.skuName,
      });
    }

    let storageAccount: StorageAccount | undefined = undefined;
    if (props.storageAccount) {
      storageAccount = new StorageAccount(this, `StorageAccount`, {
        name: convertName(`st-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        accountTier: props.storageAccount.accountTier,
        accountReplicationType: props.storageAccount.accountReplicationType,
      });
    }

    let keyVault: KeyVault | undefined = undefined;
    if (props.keyVault) {
      keyVault = new KeyVault(this, `KeyVault`, {
        name: convertName(`kv-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        skuName: props.keyVault.skuName,
        purgeProtectionEnabled: false,
      });
    }

    if (props.aiFoundry && storageAccount && keyVault) {
      const aiFoundry = new AiFoundry(this, `AiFoundry`, {
        name: `af-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroup.resourceGroup.name,
        storageAccountId: storageAccount.storageAccount.id,
        keyVaultId: keyVault.keyVault.id,
      });

      if (props.aiFoundryProject) {
        new AiFoundryProject(this, `AiFoundryProject`, {
          name: `afp-${props.name}`,
          location: props.location,
          tags: props.tags,
          aiServicesHubId: aiFoundry.aiFoundry.id,
        });
      }
    }
  }
}
