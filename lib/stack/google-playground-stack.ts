import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-google';
import { iamWorkloadIdentityPoolProvider } from '@cdktf/provider-google';

import { IamWorkloadIdentityPool } from '../construct/google/iam-workload-identity-pool';
import { IamWorkloadIdentityPoolProvider } from '../construct/google/iam-workload-identity-pool-provider';
import { ServiceAccount } from '../construct/google/service-account';
import { ServiceAccountIamMember } from '../construct/google/service-account-iam-member';
import { ProjectIamMember } from '../construct/google/project-iam-member';
import { getRandomIdentifier, createBackend, convertName } from '../utils';

export interface GooglePlaygroundStackProps {
  name: string;
  iamWorkloadIdentityPool?: {
    name: string;
  };
  iamWorkloadIdentityPoolProvider?: {
    name: string;
    attributeCondition: iamWorkloadIdentityPoolProvider.IamWorkloadIdentityPoolProviderConfig['attributeCondition'];
    attributeMapping: iamWorkloadIdentityPoolProvider.IamWorkloadIdentityPoolProviderConfig['attributeMapping'];
    oidc: iamWorkloadIdentityPoolProvider.IamWorkloadIdentityPoolProviderConfig['oidc'];
  };
  serviceAccount?: {};
  serviceAccountIamMember?: {
    role: string;
    github_full_repo_name: string;
  };
  projectIamMember?: {
    role: string;
  };
}

export const devGooglePlaygroundStackProps: GooglePlaygroundStackProps = {
  name: `Dev-GooglePlaygroundStack-${getRandomIdentifier('Dev-GooglePlaygroundStack')}`,
  iamWorkloadIdentityPool: {
    name: `wid${getRandomIdentifier('Dev-GooglePlaygroundStack')}`,
  },
  iamWorkloadIdentityPoolProvider: {
    name: 'github',
    attributeCondition:
      'attribute.repository == "ks6088ts-labs/baseline-environment-cdktf-typescript"',
    attributeMapping: {
      'google.subject': 'assertion.sub',
      'attribute.actor': 'assertion.actor',
      'attribute.aud': 'assertion.aud',
      'attribute.repository': 'assertion.repository',
    },
    oidc: {
      issuerUri: 'https://token.actions.githubusercontent.com',
    },
  },
  serviceAccount: {},
  serviceAccountIamMember: {
    role: 'roles/iam.workloadIdentityUser',
    github_full_repo_name:
      'ks6088ts-labs/baseline-environment-cdktf-typescript',
  },
  projectIamMember: {
    role: 'roles/owner',
  },
};

export class GooglePlaygroundStack extends TerraformStack {
  public readonly googleWorkloadIdentityProvider: string;
  public readonly googleServiceAccount: string;

  constructor(scope: Construct, id: string, props: GooglePlaygroundStackProps) {
    let googleWorkloadIdentityProvider: string | undefined = undefined;
    let googleServiceAccount: string | undefined = undefined;

    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.GoogleProvider(this, 'google', {});

    // Resources
    let iamWorkloadIdentityPool: IamWorkloadIdentityPool | undefined =
      undefined;
    if (props.iamWorkloadIdentityPool) {
      iamWorkloadIdentityPool = new IamWorkloadIdentityPool(
        this,
        'IamWorkloadIdentityPool',
        {
          name: convertName(props.iamWorkloadIdentityPool.name, 32),
        },
      );

      if (props.iamWorkloadIdentityPoolProvider) {
        const iamWorkloadIdentityPoolProvider =
          new IamWorkloadIdentityPoolProvider(
            this,
            'IamWorkloadIdentityPoolProvider',
            {
              name: props.iamWorkloadIdentityPoolProvider.name,
              workloadIdentityPoolId:
                iamWorkloadIdentityPool.iamWorkloadIdentityPool
                  .workloadIdentityPoolId,
              attributeCondition:
                props.iamWorkloadIdentityPoolProvider.attributeCondition,
              attributeMapping:
                props.iamWorkloadIdentityPoolProvider.attributeMapping,
              oidc: props.iamWorkloadIdentityPoolProvider.oidc,
            },
          );
        googleWorkloadIdentityProvider =
          iamWorkloadIdentityPoolProvider.workloadIdentityPoolProvider.name;
      }
    }

    if (props.serviceAccount) {
      const serviceAccount = new ServiceAccount(this, 'ServiceAccount', {
        name: convertName(props.name, 32),
      });
      googleServiceAccount = serviceAccount.serviceAccount.email;

      if (props.serviceAccountIamMember && iamWorkloadIdentityPool) {
        new ServiceAccountIamMember(this, 'ServiceAccountIamMember', {
          serviceAccountId: serviceAccount.serviceAccount.id,
          role: props.serviceAccountIamMember.role,
          member: `principalSet://iam.googleapis.com/${iamWorkloadIdentityPool.iamWorkloadIdentityPool.name}/attribute.repository/${props.serviceAccountIamMember.github_full_repo_name}`,
        });
      }

      if (props.projectIamMember) {
        new ProjectIamMember(this, 'ProjectIamMember', {
          role: props.projectIamMember.role,
          project: serviceAccount.serviceAccount.project,
          member: `serviceAccount:${serviceAccount.serviceAccount.email}`,
        });
      }
    }

    this.googleWorkloadIdentityProvider =
      googleWorkloadIdentityProvider ||
      `projects/PROJECT_ID/locations/global/workloadIdentityPools/WORKLOAD_IDENTITY_POOL_ID/providers/PROVIDER_ID`;
    this.googleServiceAccount =
      googleServiceAccount ||
      'SERVICE_ACCOUNT_NAME@PROJECT_ID.iam.gserviceaccount.com';
  }
}
