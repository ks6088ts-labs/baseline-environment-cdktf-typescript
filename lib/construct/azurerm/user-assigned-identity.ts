import { Construct } from 'constructs';
import { userAssignedIdentity } from '@cdktf/provider-azurerm';

export interface userAssignedIdentityProps {
  name: string;
  location: string;
  tags?: { [key: string]: string };
  resourceGroupName: string;
}

export class UserAssignedIdentity extends Construct {
  public readonly userAssignedIdentity: userAssignedIdentity.UserAssignedIdentity;

  constructor(scope: Construct, id: string, props: userAssignedIdentityProps) {
    super(scope, id);

    // Resources
    this.userAssignedIdentity = new userAssignedIdentity.UserAssignedIdentity(
      this,
      'user_assigned_identity',
      {
        name: props.name,
        location: props.location,
        tags: props.tags,
        resourceGroupName: props.resourceGroupName,
      },
    );
  }
}
