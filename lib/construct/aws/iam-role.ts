import { Construct } from 'constructs';
import { iamRole } from '@cdktf/provider-aws';

export interface iamRoleProps {
  name: string;
  providerUrl: string;
  awsId: string;
  githubOrganization: string;
  githubRepository: string;
}

export class IamRole extends Construct {
  public readonly iamRole: iamRole.IamRole;

  constructor(scope: Construct, id: string, props: iamRoleProps) {
    super(scope, id);

    // Resources
    this.iamRole = new iamRole.IamRole(this, 'iam_role', {
      name: props.name,
      assumeRolePolicy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 'sts:AssumeRoleWithWebIdentity',
            Principal: {
              Federated: `arn:aws:iam::${props.awsId}:oidc-provider/${props.providerUrl}`,
            },
            Condition: {
              StringLike: {
                [`${props.providerUrl}:sub`]: `repo:${props.githubOrganization}/${props.githubRepository}:*`,
              },
            },
          },
        ],
      }),
    });
  }
}
