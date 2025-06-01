#!/usr/bin/env node
import { App } from 'cdktf';
import { getRandomIdentifier } from '../lib/utils';
import {
  AiAzurermStack,
  aiAzurermStackProps,
} from '../lib/stack/ai-azurerm-stack';
import {
  AppAzurermStack,
  appAzurermStackProps,
} from '../lib/stack/app-azurerm-stack';
import {
  DataAzurermStack,
  dataAzurermStackProps,
} from '../lib/stack/data-azurerm-stack';
import {
  NetworkAzurermStack,
  NetworkAzurermStackPropsPrivateEndpointConfig,
  createNetworkAzurermStackProps,
} from '../lib/stack/network-azurerm-stack';
import {
  IotAzurermStack,
  iotAzurermStackProps,
} from '../lib/stack/iot-azurerm-stack';
import { SecurityAzurermStack } from '../lib/stack/security-azurerm-stack';
import {
  MonitoringAzurermStack,
  monitoringAzurermStackProps,
} from '../lib/stack/monitoring-azurerm-stack';
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
const aiAzurermStack = new AiAzurermStack(
  app,
  `Ai-AzurermStack`,
  aiAzurermStackProps,
);
// const appAzurermStack =
new AppAzurermStack(app, `App-AzurermStack`, appAzurermStackProps);
const dataAzurermStack = new DataAzurermStack(
  app,
  `Data-AzurermStack`,
  dataAzurermStackProps,
);

let privateEndpointConfigs: NetworkAzurermStackPropsPrivateEndpointConfig[] =
  [];
aiAzurermStack.aiServices.forEach((service) => {
  privateEndpointConfigs.push({
    id: 'OpenAi',
    name: `OpenAi-${service.aiServices.name}`,
    resourceId: service.aiServices.id,
    subresource: 'account',
  });
});
if (dataAzurermStack.storageAccount) {
  privateEndpointConfigs.push({
    id: 'StorageAccount',
    name: `StorageAccount-${dataAzurermStack.storageAccount.storageAccount.name}`,
    resourceId: dataAzurermStack.storageAccount.storageAccount.id,
    subresource: 'blob',
  });
}
if (dataAzurermStack.keyVault) {
  privateEndpointConfigs.push({
    id: 'KeyVault',
    name: `KeyVault-${dataAzurermStack.keyVault.keyVault.name}`,
    resourceId: dataAzurermStack.keyVault.keyVault.id,
    subresource: 'vault',
  });
}
// Disable this for now, as it requires a Premium SKU for the container registry
// if (appAzurermStack.containerRegistry) {
//   privateEndpointConfigs.push({
//     id: 'ContainerRegistry',
//     name: `ContainerRegistry-${appAzurermStack.containerRegistry.containerRegistry.name}`,
//     resourceId: appAzurermStack.containerRegistry.containerRegistry.id,
//     subresource: 'registry',
//   });
// }
new NetworkAzurermStack(
  app,
  `Network-AzurermStack`,
  createNetworkAzurermStackProps(privateEndpointConfigs),
);
new IotAzurermStack(
  app,
  `Iot-AzurermStack`,
  iotAzurermStackProps,
  dataAzurermStack.storageAccount,
);

let roleAssignmentProps = [];
for (const service of aiAzurermStack.aiServices) {
  roleAssignmentProps.push({
    roleDefinitionName: 'Cognitive Services OpenAI User',
    scope: service.aiServices.id,
  });
}
new SecurityAzurermStack(app, `Security-AzurermStack`, {
  name: `SecurityAzurermStack-${getRandomIdentifier('SecurityAzurermStack')}`,
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

new MonitoringAzurermStack(
  app,
  `Monitoring-AzurermStack`,
  monitoringAzurermStackProps,
);
app.synth();
