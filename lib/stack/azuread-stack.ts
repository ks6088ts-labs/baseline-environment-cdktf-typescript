import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider as azureadProvider } from '@cdktf/provider-azuread';
import {
  provider as azurermProvider,
  dataAzurermSubscription,
  roleAssignment,
} from '@cdktf/provider-azurerm';
import { Group } from '../construct/azuread/group';
import { createBackend } from '../utils';

export interface AzureadStackProps {
  group?: {
    name: string;
    description?: string;
  };
}

export const devAzureadStackProps: AzureadStackProps = {
  group: {
    name: 'dev-developers',
    description: 'Developers group for dev environment',
  },
};

export const prodAzureadStackProps: AzureadStackProps = {};

export class AzureadStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AzureadStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new azureadProvider.AzureadProvider(this, 'azuread', {});
    new azurermProvider.AzurermProvider(this, 'azurerm', {
      features: [{}],
    });

    // Datasources
    const subscription = new dataAzurermSubscription.DataAzurermSubscription(
      this,
      'subscription',
      {},
    );

    // Resources
    if (props.group) {
      const group = new Group(this, 'Group', {
        name: props.group.name,
        description: props.group.description,
      });

      new roleAssignment.RoleAssignment(this, 'role_assignment', {
        scope: subscription.id,
        roleDefinitionName: 'Contributor',
        principalId: group.group.objectId,
      });
    }
  }
}
