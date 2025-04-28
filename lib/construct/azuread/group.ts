import { Construct } from 'constructs';
import { group } from '@cdktf/provider-azuread';

export interface GroupProps {
  name: string;
  description?: string;
}

export class Group extends Construct {
  public readonly group: group.Group;
  constructor(scope: Construct, id: string, props: GroupProps) {
    super(scope, id);

    // Resources
    this.group = new group.Group(this, 'group', {
      displayName: props.name,
      description: props.description,
      securityEnabled: true,
    });
  }
}
