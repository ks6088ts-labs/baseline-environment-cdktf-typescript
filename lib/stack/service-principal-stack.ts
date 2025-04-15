import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import {
  provider as azurermProvider,
  dataAzurermSubscription,
  roleAssignment,
} from '@cdktf/provider-azurerm';
import {
  provider as azureadProvider,
  dataAzureadClientConfig,
  dataAzureadApplicationPublishedAppIds,
  dataAzureadServicePrincipal,
  application,
  servicePrincipal,
  applicationFederatedIdentityCredential,
} from '@cdktf/provider-azuread';

import { getRandomIdentifier, createBackend } from '../utils';

export interface ServicePrincipalStackProps {
  name: string;
  githubOrganization: string;
  githubRepository: string;
  githubEnvironment: string;
  resourceAccess?: { name: string; type: string }[];
}

export const devServicePrincipalStackProps: ServicePrincipalStackProps = {
  name: `Dev-ServicePrincipalStack-${getRandomIdentifier('Dev-ServicePrincipalStack')}`,
  githubOrganization: 'ks6088ts-labs',
  githubRepository: 'baseline-environment-on-azure-cdktf-typescript',
  githubEnvironment: 'ci',
  resourceAccess: [
    {
      name: 'Directory.Read.All',
      type: 'Role',
    },
    {
      name: 'User.Read.All',
      type: 'Role',
    },
    {
      name: 'Group.Read.All',
      type: 'Role',
    },
  ],
};

export const prodServicePrincipalStackProps: ServicePrincipalStackProps = {
  name: `Prod-ServicePrincipalStack-${getRandomIdentifier('Prod-ServicePrincipalStack')}`,
  githubOrganization: 'ks6088ts-labs',
  githubRepository: 'baseline-environment-on-azure-cdktf-typescript',
  githubEnvironment: 'ci',
  resourceAccess: [
    {
      name: 'Directory.Read.All',
      type: 'Role',
    },
    {
      name: 'User.Read.All',
      type: 'Role',
    },
    {
      name: 'Group.Read.All',
      type: 'Role',
    },
  ],
};

export class ServicePrincipalStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: ServicePrincipalStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, 'ServicePrincipalStack');

    // Providers
    new azurermProvider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });
    new azureadProvider.AzureadProvider(this, 'azuread', {});

    // Datasources
    const subscription = new dataAzurermSubscription.DataAzurermSubscription(
      this,
      'subscription',
      {},
    );

    const clientConfig = new dataAzureadClientConfig.DataAzureadClientConfig(
      this,
      'clientConfig',
      {},
    );

    const applicationPublishedAppIds =
      new dataAzureadApplicationPublishedAppIds.DataAzureadApplicationPublishedAppIds(
        this,
        'applicationPublishedAppIds',
        {},
      );

    const servicePrincipalMicrosoftGraph =
      new dataAzureadServicePrincipal.DataAzureadServicePrincipal(
        this,
        'servicePrincipalMicrosoftGraph',
        {
          clientId: applicationPublishedAppIds.result.lookup('MicrosoftGraph'),
        },
      );

    // Resources
    const applicationResource = new application.Application(
      this,
      'application',
      {
        displayName: props.name,
        owners: [clientConfig.objectId],
        requiredResourceAccess: props.resourceAccess
          ? [
              {
                resourceAppId:
                  applicationPublishedAppIds.result.lookup('MicrosoftGraph'),
                resourceAccess: props.resourceAccess.map((resourceAccess) => ({
                  id: servicePrincipalMicrosoftGraph.appRoleIds.lookup(
                    resourceAccess.name,
                  ),
                  type: resourceAccess.type,
                })),
              },
            ]
          : undefined,
      },
    );

    const servicePrincipalResource = new servicePrincipal.ServicePrincipal(
      this,
      'servicePrincipal',
      {
        clientId: applicationResource.clientId,
        appRoleAssignmentRequired: false,
        owners: [clientConfig.objectId],
      },
    );

    new roleAssignment.RoleAssignment(this, 'roleAssignment', {
      scope: subscription.id,
      roleDefinitionName: 'Reader',
      principalId: servicePrincipalResource.objectId,
    });

    new applicationFederatedIdentityCredential.ApplicationFederatedIdentityCredential(
      this,
      'federatedIdentityCredential',
      {
        applicationId: applicationResource.id,
        displayName: 'federatedIdentityCredential',
        description: 'Generated federated identity credential',
        audiences: ['api://AzureADTokenExchange'],
        issuer: `https://token.actions.githubusercontent.com`,
        subject: `repo:${props.githubOrganization}/${props.githubRepository}:environment:${props.githubEnvironment}`,
      },
    );
  }
}
