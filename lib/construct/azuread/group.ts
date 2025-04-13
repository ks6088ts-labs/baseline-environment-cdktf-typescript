import { Construct } from 'constructs';
import { group } from '@cdktf/provider-azuread';

export interface GroupProps {
  name: string;
}

export class Group extends Construct {
  public readonly group: group.Group;
  constructor(scope: Construct, id: string, props: GroupProps) {
    super(scope, id);

    // Resources
    this.group = new group.Group(this, 'group', {
      displayName: props.name,
      securityEnabled: true,
    });
  }
}
