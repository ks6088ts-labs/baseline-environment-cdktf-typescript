import { Construct } from 'constructs';
import { iamWorkloadIdentityPoolProvider } from '@cdktf/provider-google';

export interface IamWorkloadIdentityPoolProviderProps {
  name: string;
  workloadIdentityPoolId: string;
  attributeCondition?: iamWorkloadIdentityPoolProvider.IamWorkloadIdentityPoolProviderConfig['attributeCondition'];
  attributeMapping?: iamWorkloadIdentityPoolProvider.IamWorkloadIdentityPoolProviderConfig['attributeMapping'];
  oidc?: iamWorkloadIdentityPoolProvider.IamWorkloadIdentityPoolProviderConfig['oidc'];
}

export class IamWorkloadIdentityPoolProvider extends Construct {
  public readonly workloadIdentityPoolProvider: iamWorkloadIdentityPoolProvider.IamWorkloadIdentityPoolProvider;

  constructor(
    scope: Construct,
    id: string,
    props: IamWorkloadIdentityPoolProviderProps,
  ) {
    super(scope, id);

    // Resources
    this.workloadIdentityPoolProvider =
      new iamWorkloadIdentityPoolProvider.IamWorkloadIdentityPoolProvider(
        this,
        'iam_workload_identity_pool_provider',
        {
          workloadIdentityPoolId: props.workloadIdentityPoolId,
          workloadIdentityPoolProviderId: props.name,
          displayName: props.name,
          attributeCondition: props.attributeCondition,
          attributeMapping: props.attributeMapping,
          oidc: props.oidc,
        },
      );
  }
}
