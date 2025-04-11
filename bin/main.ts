#!/usr/bin/env node
import { App } from 'cdktf';
import { ResourceGroupStack } from '../lib/resource-group-stack';
import { AiServicesStack } from '../lib/ai-services-stack';
import { ContainerAppEnvironmentStack } from '../lib/container-app-environment-stack';
import { ContainerAppStack } from '../lib/container-app-stack';
import { ApiManagementStack } from '../lib/api-management-stack';
import { StorageAccountStack } from '../lib/storage-account-stack';
import { KeyVaultStack } from '../lib/key-vault-stack';
import { AiFoundryStack } from '../lib/ai-foundry-stack';
import { AiFoundryProjectStack } from '../lib/ai-foundry-project-stack';
import { KubernetesClusterStack } from '../lib/kubernetes-cluster-stack';
import { ContainerRegistryStack } from '../lib/container-registry-stack';

const app = new App();

// ----------------------- Load context variables ------------------------------
// Environment Key (dev,stage,prod...) from environment variable `CDKTF_ENVIRONMENT`
const envKey = process.env.CDKTF_ENVIRONMENT;
if (envKey == undefined)
  throw new Error(
    `Please specify environment from environment variable. e.g.: CDKTF_ENVIRONMENT=dev cdktf synth`,
  );

// Array of environment variables. These values should be defined in cdktf.json
const envVals = app.node.tryGetContext(envKey);
if (envVals == undefined) throw new Error('Invalid environment.');

const location = envVals['location'];
const tags = envVals['tags'];

// derive randomIdentifier from a pair of envKey and location
const randomIdentifier = (envKey + location)
  .split('')
  .reduce((acc, char) => {
    acc = (acc << 5) - acc + char.charCodeAt(0);
    return acc & acc; // Convert to 32bit integer
  }, 0)
  .toString(36)
  .substring(2, 8);
// const randomIdentifier = Math.random().toString(36).substring(2, 8);

const name = `${envVals['name']}-${envKey}-${randomIdentifier}`;

// ----------------------- Functions ------------------------------
// Function to create container app name with proper formatting
function convertName(name: string, length: number = 32): string {
  return name
    .replace(/[^a-z0-9]/g, '')
    .toLowerCase()
    .substring(0, length);
}

// ----------------------- Create stacks ------------------------------
const resourceGroupStack = new ResourceGroupStack(app, `ResourceGroupStack`, {
  name: envVals['ResourceGroupStack']['name'] || `rg-${name}`,
  location: envVals['ResourceGroupStack']['location'] || location,
  tags: envVals['ResourceGroupStack']['tags'] || tags,
});

new AiServicesStack(app, `AiServicesStack`, {
  name: `ai-services-${name}`,
  location: envVals['AiServicesStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  customSubdomainName: `ai-services-${name}`,
  skuName: 'S0',
  publicNetworkAccess: 'Enabled',
  deployments: envVals['AiServicesStack']['deployments'] || [],
});

const containerAppEnvironmentStack = new ContainerAppEnvironmentStack(
  app,
  `ContainerAppEnvironmentStack`,
  {
    name: `container-app-env-${name}`,
    location: envVals['ContainerAppEnvironmentStack']['location'] || location,
    tags: tags,
    resourceGroupName: resourceGroupStack.resourceGroup.name,
  },
);

new ContainerAppStack(app, `ContainerAppStack`, {
  name: convertName(`ca-${name}`),
  location: envVals['ContainerAppStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  containerAppEnvironmentId:
    containerAppEnvironmentStack.containerAppEnvironment.id,
  containerAppTemplateContainers:
    envVals['ContainerAppStack']['containers'] || [],
});

new KubernetesClusterStack(app, `KubernetesClusterStack`, {
  name: `k8s-${name}`,
  location: envVals['KubernetesClusterStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  nodeCount: envVals['KubernetesClusterStack']['nodeCount'] || 1,
  vmSize: envVals['KubernetesClusterStack']['vmSize'] || 'Standard_DS2_v2',
});

new ContainerRegistryStack(app, `ContainerRegistryStack`, {
  name: convertName(`acr-${name}`),
  location: envVals['ContainerRegistryStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  sku: envVals['ContainerRegistryStack']['sku'] || 'Basic',
  adminEnabled: envVals['ContainerRegistryStack']['adminEnabled'] || false,
});

new ApiManagementStack(app, `ApiManagementStack`, {
  name: `apim-${name}`,
  location: envVals['ApiManagementStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  publisherEmail: envVals['ApiManagementStack']['publisherEmail'],
  publisherName: envVals['ApiManagementStack']['publisherName'],
  sku_name: envVals['ApiManagementStack']['sku_name'] || 'Consumption_0',
});

const storageAccountStack = new StorageAccountStack(
  app,
  `StorageAccountStack`,
  {
    name: convertName(`st-${name}`, 24),
    location: envVals['StorageAccountStack']['location'] || location,
    tags: tags,
    resourceGroupName: resourceGroupStack.resourceGroup.name,
    accountTier: envVals['StorageAccountStack']['accountTier'] || 'Standard',
    accountReplicationType:
      envVals['StorageAccountStack']['accountReplicationType'] || 'LRS',
  },
);

const keyVaultStack = new KeyVaultStack(app, `KeyVaultStack`, {
  name: convertName(`kv-${name}`, 24),
  location: envVals['KeyVaultStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  skuName: envVals['KeyVaultStack']['skuName'] || 'standard',
  purgeProtectionEnabled:
    envVals['KeyVaultStack']['purgeProtectionEnabled'] || false,
});

const aiFoundryStack = new AiFoundryStack(app, `AiFoundryStack`, {
  name: `af-${name}`,
  location: envVals['AiFoundryStack']['location'] || location,
  tags: tags,
  resourceGroupName: resourceGroupStack.resourceGroup.name,
  storageAccountId: storageAccountStack.storageAccount.id,
  keyVaultId: keyVaultStack.keyVault.id,
});

new AiFoundryProjectStack(app, `AiFoundryProjectStack`, {
  name: `afp-${name}`,
  location: envVals['AiFoundryProjectStack']['location'] || location,
  tags: tags,
  aiServicesHubId: aiFoundryStack.aiFoundry.id,
});

app.synth();
