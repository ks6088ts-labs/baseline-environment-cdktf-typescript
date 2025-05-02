import { Construct } from 'constructs';
import { iamWorkloadIdentityPool } from '@cdktf/provider-google';

export interface IamWorkloadIdentityPoolProps {
  name: string;
}

export class IamWorkloadIdentityPool extends Construct {
  public readonly iamWorkloadIdentityPool: iamWorkloadIdentityPool.IamWorkloadIdentityPool;
  constructor(
    scope: Construct,
    id: string,
    props: IamWorkloadIdentityPoolProps,
  ) {
    super(scope, id);

    // Resources
    this.iamWorkloadIdentityPool =
      new iamWorkloadIdentityPool.IamWorkloadIdentityPool(
        this,
        'iam_workload_identity_pool',
        {
          workloadIdentityPoolId: props.name,
        },
      );
  }
}
