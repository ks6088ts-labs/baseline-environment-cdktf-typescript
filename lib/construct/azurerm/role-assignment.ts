import { Construct } from 'constructs';
import { roleAssignment } from '@cdktf/provider-azurerm';

export interface RoleAssignmentProps {
  principalId: string;
  roleDefinitionName: string;
  scope: string;
}

export class RoleAssignment extends Construct {
  constructor(scope: Construct, id: string, props: RoleAssignmentProps) {
    super(scope, id);

    // Resources
    new roleAssignment.RoleAssignment(this, 'role_assignment', {
      principalId: props.principalId,
      roleDefinitionName: props.roleDefinitionName,
      scope: props.scope,
      skipServicePrincipalAadCheck: true,
    });
  }
}
