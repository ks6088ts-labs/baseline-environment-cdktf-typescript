import { Construct } from 'constructs';
import { iamGroup } from '@cdktf/provider-aws';

export interface GroupProps {
  name: string;
}

export class IamGroup extends Construct {
  constructor(scope: Construct, id: string, props: GroupProps) {
    super(scope, id);

    // Resources
    new iamGroup.IamGroup(this, 'iam_group', {
      name: props.name,
    });
  }
}
