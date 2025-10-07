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
} from '../lib/stack/azuread-playground-stack';
import { GithubEnvironmentSecretStack } from '../lib/stack/github-environment-secret-stack';
import {
  ServicePrincipalStack,
  devServicePrincipalStackProps,
} from '../lib/stack/service-principal-stack';
import {
  AwsPlaygroundStack,
  devAwsPlaygroundStackProps,
} from '../lib/stack/aws-playground-stack';
import {
  GooglePlaygroundStack,
  devGooglePlaygroundStackProps,
} from '../lib/stack/google-playground-stack';
import {
  AzapiAiFoundryStack,
  azapiAiFoundryStackProps,
} from '../lib/stack/azapi-ai-foundry-stack';

const app = new App();

// ---
// Azure
// ---
const devServicePrincipalStack = new ServicePrincipalStack(
  app,
  `Dev-ServicePrincipalStack`,
  devServicePrincipalStackProps,
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

// ---
// AWS
// ---
const devAwsPlaygroundStack = new AwsPlaygroundStack(
  app,
  `Dev-AwsPlaygroundStack`,
  devAwsPlaygroundStackProps,
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

// ---
// Google
// ---
const devGooglePlaygroundStack = new GooglePlaygroundStack(
  app,
  `Dev-GooglePlaygroundStack`,
  devGooglePlaygroundStackProps,
);

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

// ---
// Azure RM Provider
// ---
new AzurermAiStack(app, `Azurerm-Ai-Stack`, azurermAiStackProps);

new AzurermAppStack(app, `Azurerm-App-Stack`, azurermAppStackProps);

new AzurermDataStack(app, `Azurerm-Data-Stack`, azurermDataStackProps);

new AzurermNetworkStack(
  app,
  `Azurerm-Network-Stack`,
  createAzurermNetworkStackProps([]),
);

new AzurermIotStack(app, `Azurerm-Iot-Stack`, azurermIotStackProps, undefined);

new AzurermSecurityStack(app, `Azurerm-Security-Stack`, {
  name: `AzurermSecurityStack-${getRandomIdentifier('AzurermSecurityStack')}`,
  location: 'japaneast',
  tags: {
    owner: 'ks6088ts',
  },
  resourceGroup: {},
  userAssignedIdentity: {},
  roleAssignment: {
    configs: [],
  },
});

new AzurermMonitoringStack(
  app,
  `Azurerm-Monitoring-Stack`,
  azurermMonitoringStackProps,
);

// ---
// Azure AD Provider
// ---
new AzureadPlaygroundStack(
  app,
  `Dev-AzureadPlaygroundStack`,
  devAzureadPlaygroundStackProps,
);

// ---
// AzAPI Provider
// ---
new AzapiAiFoundryStack(
  app,
  `Azapi-Ai-Foundry-Stack`,
  azapiAiFoundryStackProps,
);

// ---
app.synth();
