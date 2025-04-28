import { Construct } from 'constructs';
import { iamRole } from '@cdktf/provider-aws';

export interface iamRoleProps {
  name: string;
  assumeRolePolicy: string;
}

export class IamRole extends Construct {
  public readonly iamRole: iamRole.IamRole;

  constructor(scope: Construct, id: string, props: iamRoleProps) {
    super(scope, id);

    // Resources
    this.iamRole = new iamRole.IamRole(this, 'iam_role', {
      name: props.name,
      assumeRolePolicy: props.assumeRolePolicy,
    });
  }
}
