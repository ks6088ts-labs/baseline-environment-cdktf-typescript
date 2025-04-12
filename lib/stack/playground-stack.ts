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

function convertName(name: string, length: number = 32): string {
  return name
    .replace(/[^a-z0-9]/g, '')
    .toLowerCase()
    .substring(0, length);
}

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
  aiServices: {
    location: string;
    deployments?: AiServicesDeployment[];
  };
  containerAppEnvironment: {};
  containerApp: {
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
  apiManagement: {
    location: string;
    publisherEmail: string;
    publisherName: string;
    skuName: string;
  };
  storageAccount: {
    accountTier: string;
    accountReplicationType: string;
  };
  keyVault: {
    skuName: string;
  };
  aiFoundry: {};
  aiFoundryProject: {};
  kubernetesCluster: {
    nodeCount: number;
    vmSize: string;
  };
  containerRegistry: {
    location: string;
    sku: string;
    adminEnabled: boolean;
  };
}

export class PlaygroundStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: PlaygroundStackProps) {
    super(scope, id);

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

    const resourceGroupStack = new ResourceGroup(this, `ResourceGroupStack`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });

    new AiServices(this, `AiServicesStack`, {
      name: `ai-services-${props.name}`,
      location: props.aiServices.location,
      tags: props.tags,
      resourceGroupName: resourceGroupStack.resourceGroup.name,
      customSubdomainName: `ai-services-${props.name}`,
      skuName: 'S0',
      publicNetworkAccess: 'Enabled',
      deployments: props.aiServices.deployments,
    });

    const containerAppEnvironmentStack = new ContainerAppEnvironment(
      this,
      `ContainerAppEnvironmentStack`,
      {
        name: `container-app-env-${props.name}`,
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroupStack.resourceGroup.name,
      },
    );

    new ContainerApp(this, `ContainerAppStack`, {
      name: convertName(`ca-${props.name}`),
      location: props.location,
      tags: props.tags,
      resourceGroupName: resourceGroupStack.resourceGroup.name,
      containerAppEnvironmentId:
        containerAppEnvironmentStack.containerAppEnvironment.id,
      containerAppTemplateContainers: props.containerApp.containers,
    });

    new KubernetesCluster(this, `KubernetesClusterStack`, {
      name: `k8s-${props.name}`,
      location: props.location,
      tags: props.tags,
      resourceGroupName: resourceGroupStack.resourceGroup.name,
      nodeCount: props.kubernetesCluster.nodeCount,
      vmSize: props.kubernetesCluster.vmSize,
    });

    new ContainerRegistry(this, `ContainerRegistryStack`, {
      name: convertName(`acr-${props.name}`),
      location: props.containerRegistry.location,
      tags: props.tags,
      resourceGroupName: resourceGroupStack.resourceGroup.name,
      sku: props.containerRegistry.sku,
      adminEnabled: props.containerRegistry.adminEnabled,
    });

    new ApiManagement(this, `ApiManagementStack`, {
      name: `apim-${props.name}`,
      location: props.apiManagement.location,
      tags: props.tags,
      resourceGroupName: resourceGroupStack.resourceGroup.name,
      publisherEmail: props.apiManagement.publisherEmail,
      publisherName: props.apiManagement.publisherName,
      skuName: props.apiManagement.skuName,
    });

    const storageAccountStack = new StorageAccount(
      this,
      `StorageAccountStack`,
      {
        name: convertName(`st-${props.name}`, 24),
        location: props.location,
        tags: props.tags,
        resourceGroupName: resourceGroupStack.resourceGroup.name,
        accountTier: props.storageAccount.accountTier,
        accountReplicationType: props.storageAccount.accountReplicationType,
      },
    );

    const keyVaultStack = new KeyVault(this, `KeyVaultStack`, {
      name: convertName(`kv-${props.name}`, 24),
      location: props.location,
      tags: props.tags,
      resourceGroupName: resourceGroupStack.resourceGroup.name,
      skuName: props.keyVault.skuName,
      purgeProtectionEnabled: false,
    });

    const aiFoundryStack = new AiFoundry(this, `AiFoundryStack`, {
      name: `af-${props.name}`,
      location: props.location,
      tags: props.tags,
      resourceGroupName: resourceGroupStack.resourceGroup.name,
      storageAccountId: storageAccountStack.storageAccount.id,
      keyVaultId: keyVaultStack.keyVault.id,
    });

    new AiFoundryProject(this, `AiFoundryProjectStack`, {
      name: `afp-${props.name}`,
      location: props.location,
      tags: props.tags,
      aiServicesHubId: aiFoundryStack.aiFoundry.id,
    });
  }
}
