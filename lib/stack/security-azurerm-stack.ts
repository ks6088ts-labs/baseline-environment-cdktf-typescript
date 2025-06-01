import { Construct } from 'constructs';
import { TerraformStack, TerraformOutput } from 'cdktf';
import { provider } from '@cdktf/provider-azurerm';
import { createBackend } from '../utils';
import { ResourceGroup } from '../construct/azurerm/resource-group';
import { UserAssignedIdentity } from '../construct/azurerm/user-assigned-identity';
import { RoleAssignment } from '../construct/azurerm/role-assignment';

export interface RoleAssignmentProps {
  roleDefinitionName: string;
  scope: string;
}

export interface SecurityAzurermStackProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroup: {};
  userAssignedIdentity?: {};
  roleAssignment?: {
    configs?: RoleAssignmentProps[];
  };
}

export class SecurityAzurermStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: SecurityAzurermStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.AzurermProvider(this, 'azurerm', {
      features: [
        {
          resourceGroup: [
            {
              preventDeletionIfContainsResources: false,
            },
          ],
        },
      ],
    });

    // Resources
    const resourceGroup = new ResourceGroup(this, `ResourceGroup`, {
      name: `rg-${props.name}`,
      location: props.location,
      tags: props.tags,
    });
    new TerraformOutput(this, 'resource_group_name', {
      value: resourceGroup.resourceGroup.name,
    });

    let userAssignedIdentity: UserAssignedIdentity | undefined = undefined;
    if (props.userAssignedIdentity) {
      userAssignedIdentity = new UserAssignedIdentity(
        this,
        `UserAssignedIdentity`,
        {
          name: `uai-${props.name}`,
          location: props.location,
          tags: props.tags,
          resourceGroupName: resourceGroup.resourceGroup.name,
        },
      );
    }

    if (
      props.roleAssignment &&
      props.roleAssignment.configs &&
      userAssignedIdentity
    ) {
      for (const config of props.roleAssignment.configs) {
        new RoleAssignment(
          this,
          `RoleAssignment-${config.scope}-${userAssignedIdentity.userAssignedIdentity.principalId}`,
          {
            principalId: userAssignedIdentity.userAssignedIdentity.principalId,
            roleDefinitionName: config.roleDefinitionName,
            scope: config.scope,
          },
        );
      }
    }
  }
}
