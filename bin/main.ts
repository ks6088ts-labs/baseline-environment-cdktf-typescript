#!/usr/bin/env node
import { App } from 'cdktf';
import { getRandomIdentifier } from '../lib/utils';
import {
  AzurermAiStack,
  azurermAiStackProps,
} from '../lib/stack/azurerm-ai-stack';
import {
  AzurermAppStack,
  azurermAppStackProps,
} from '../lib/stack/azurerm-app-stack';
import {
  AzurermDataStack,
  azurermDataStackProps,
} from '../lib/stack/azurerm-data-stack';
import {
  AzurermNetworkStack,
  AzurermNetworkStackPropsPrivateEndpointConfig,
  createAzurermNetworkStackProps,
} from '../lib/stack/azurerm-network-stack';
import {
  AzurermIotStack,
  azurermIotStackProps,
} from '../lib/stack/azurerm-iot-stack';
import { AzurermSecurityStack } from '../lib/stack/azurerm-security-stack';
import {
  AzurermMonitoringStack,
  azurermMonitoringStackProps,
} from '../lib/stack/azurerm-monitoring-stack';
import {
  AzureadPlaygroundStack,
  devAzureadPlaygroundStackProps,
  prodAzureadPlaygroundStackProps,
} from '../lib/stack/azuread-playground-stack';
import { GithubEnvironmentSecretStack } from '../lib/stack/github-environment-secret-stack';
import {
  ServicePrincipalStack,
  devServicePrincipalStackProps,
  prodServicePrincipalStackProps,
} from '../lib/stack/service-principal-stack';
import {
  AwsPlaygroundStack,
  devAwsPlaygroundStackProps,
  prodAwsPlaygroundStackProps,
} from '../lib/stack/aws-playground-stack';
import {
  GooglePlaygroundStack,
  devGooglePlaygroundStackProps,
  prodGooglePlaygroundStackProps,
} from '../lib/stack/google-playground-stack';
import {
  AzapiAiFoundryStack,
  azapiAiFoundryStackProps,
} from '../lib/stack/azapi-ai-foundry-stack';

const app = new App();

// Development Environment
new AzureadPlaygroundStack(
  app,
  `Dev-AzureadPlaygroundStack`,
  devAzureadPlaygroundStackProps,
);
const devServicePrincipalStack = new ServicePrincipalStack(
  app,
  `Dev-ServicePrincipalStack`,
  devServicePrincipalStackProps,
);
const devAwsPlaygroundStack = new AwsPlaygroundStack(
  app,
  `Dev-AwsPlaygroundStack`,
  devAwsPlaygroundStackProps,
);
const devGooglePlaygroundStack = new GooglePlaygroundStack(
  app,
  `Dev-GooglePlaygroundStack`,
  devGooglePlaygroundStackProps,
);
new GithubEnvironmentSecretStack(
  app,
  `Dev-GithubEnvironmentSecretStack-Azure`,
  {
    createRepository: false,
    repositoryName: 'baseline-environment-cdktf-typescript',
    visibility: 'public',
    environment: 'dev',
    organization: 'ks6088ts-labs',
    secrets: {
      ARM_CLIENT_ID: devServicePrincipalStack.armClientId,
      ARM_SUBSCRIPTION_ID: devServicePrincipalStack.armSubscriptionId,
      ARM_TENANT_ID: devServicePrincipalStack.armTenantId,
      ARM_USE_OIDC: devServicePrincipalStack.armUseOidc,
    },
  },
);
new GithubEnvironmentSecretStack(app, `Dev-GithubEnvironmentSecretStack-Aws`, {
  createRepository: false,
  repositoryName: 'baseline-environment-cdktf-typescript',
  visibility: 'public',
  environment: 'dev',
  organization: 'ks6088ts-labs',
  secrets: {
    AWS_ID: devAwsPlaygroundStack.awsId,
    AWS_ROLE_NAME: devAwsPlaygroundStack.awsRoleName,
  },
});
new GithubEnvironmentSecretStack(
  app,
  `Dev-GithubEnvironmentSecretStack-Google`,
  {
    createRepository: false,
    repositoryName: 'baseline-environment-cdktf-typescript',
    visibility: 'public',
    environment: 'dev',
    organization: 'ks6088ts-labs',
    secrets: {
      GOOGLE_WORKLOAD_IDENTITY_PROVIDER:
        devGooglePlaygroundStack.googleWorkloadIdentityProvider,
      GOOGLE_SERVICE_ACCOUNT: devGooglePlaygroundStack.googleServiceAccount,
    },
  },
);

// Production Environment
new AzureadPlaygroundStack(
  app,
  `Prod-AzureadPlaygroundStack`,
  prodAzureadPlaygroundStackProps,
);
new ServicePrincipalStack(
  app,
  `Prod-ServicePrincipalStack`,
  prodServicePrincipalStackProps,
);
new AwsPlaygroundStack(
  app,
  `Prod-AwsPlaygroundStack`,
  prodAwsPlaygroundStackProps,
);
new GooglePlaygroundStack(
  app,
  `Prod-GooglePlaygroundStack`,
  prodGooglePlaygroundStackProps,
);

// Azure Resource Stacks
const azurermAiStack = new AzurermAiStack(
  app,
  `Azurerm-Ai-Stack`,
  azurermAiStackProps,
);
// const azurermAppStack =
new AzurermAppStack(app, `Azurerm-App-Stack`, azurermAppStackProps);
const azurermDataStack = new AzurermDataStack(
  app,
  `Azurerm-Data-Stack`,
  azurermDataStackProps,
);

let privateEndpointConfigs: AzurermNetworkStackPropsPrivateEndpointConfig[] =
  [];
azurermAiStack.aiServices.forEach((service) => {
  privateEndpointConfigs.push({
    id: 'OpenAi',
    name: `OpenAi-${service.aiServices.name}`,
    resourceId: service.aiServices.id,
    subresource: 'account',
  });
});
if (azurermDataStack.storageAccount) {
  privateEndpointConfigs.push({
    id: 'StorageAccount',
    name: `StorageAccount-${azurermDataStack.storageAccount.storageAccount.name}`,
    resourceId: azurermDataStack.storageAccount.storageAccount.id,
    subresource: 'blob',
  });
}
if (azurermDataStack.keyVault) {
  privateEndpointConfigs.push({
    id: 'KeyVault',
    name: `KeyVault-${azurermDataStack.keyVault.keyVault.name}`,
    resourceId: azurermDataStack.keyVault.keyVault.id,
    subresource: 'vault',
  });
}
// Disable this for now, as it requires a Premium SKU for the container registry
// if (azurermAppStack.containerRegistry) {
//   privateEndpointConfigs.push({
//     id: 'ContainerRegistry',
//     name: `ContainerRegistry-${azurermAppStack.containerRegistry.containerRegistry.name}`,
//     resourceId: azurermAppStack.containerRegistry.containerRegistry.id,
//     subresource: 'registry',
//   });
// }
new AzurermNetworkStack(
  app,
  `Azurerm-Network-Stack`,
  createAzurermNetworkStackProps(privateEndpointConfigs),
);
new AzurermIotStack(
  app,
  `Azurerm-Iot-Stack`,
  azurermIotStackProps,
  azurermDataStack.storageAccount,
);

let roleAssignmentProps = [];
for (const service of azurermAiStack.aiServices) {
  roleAssignmentProps.push({
    roleDefinitionName: 'Cognitive Services OpenAI User',
    scope: service.aiServices.id,
  });
}
new AzurermSecurityStack(app, `Azurerm-Security-Stack`, {
  name: `AzurermSecurityStack-${getRandomIdentifier('AzurermSecurityStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  userAssignedIdentity: {},
  roleAssignment: {
    configs: roleAssignmentProps,
  },
});

new AzurermMonitoringStack(
  app,
  `Azurerm-Monitoring-Stack`,
  azurermMonitoringStackProps,
);

new AzapiAiFoundryStack(
  app,
  `Azapi-Ai-Foundry-Stack`,
  azapiAiFoundryStackProps,
);

app.synth();
