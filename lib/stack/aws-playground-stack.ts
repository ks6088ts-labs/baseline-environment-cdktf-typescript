import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';
import { IamGroup } from '../construct/aws/iam-group';
import { IamOpenidConnectProvider } from '../construct/aws/iam-openid-connect-provider';
import { IamRole } from '../construct/aws/iam-role';
import { IamRolePolicyAttachment } from '../construct/aws/iam-role-policy-attachment';
import { getRandomIdentifier, createBackend } from '../utils';

export interface AwsPlaygroundStackProps {
  name: string;
  region: string;
  iamGroup?: {
    groupName: string;
  };
  iamOpenidConnectProvider?: {
    url: string;
    clientIdList: string[];
  };
  iamRole?: {
    name: string;
    providerUrl: string;
    awsId: string;
    githubOrganization: string;
    githubRepository: string;
  };
  iamRolePolicyAttachment?: {};
}

export const devAwsPlaygroundStackProps: AwsPlaygroundStackProps = {
  name: `Dev-AwsPlaygroundStack-${getRandomIdentifier('Dev-AwsPlaygroundStack')}`,
  region: 'ap-northeast-1',
  iamGroup: {
    groupName: `Dev-AwsPlaygroundGroup-${getRandomIdentifier('Dev-AwsPlaygroundGroup')}`,
  },
  iamOpenidConnectProvider: {
    url: 'https://token.actions.githubusercontent.com',
    clientIdList: ['sts.amazonaws.com'],
  },
  iamRole: {
    name: `Dev-AwsPlaygroundRole-${getRandomIdentifier('Dev-AwsPlaygroundRole')}`,
    providerUrl: 'token.actions.githubusercontent.com',
    awsId: '222412934037',
    githubOrganization: 'ks6088ts-labs',
    githubRepository: 'baseline-environment-on-azure-cdktf-typescript',
  },
  iamRolePolicyAttachment: {},
};

export const prodAwsPlaygroundStackProps: AwsPlaygroundStackProps = {
  name: `Prod-AwsPlaygroundStack-${getRandomIdentifier('Prod-AwsPlaygroundStack')}`,
  region: 'ap-northeast-3',
};

export class AwsPlaygroundStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AwsPlaygroundStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.AwsProvider(this, 'aws', {
      region: props.region,
    });

    // Resources
    if (props.iamGroup) {
      new IamGroup(this, 'Group', {
        name: props.iamGroup.groupName,
      });
    }

    if (props.iamOpenidConnectProvider) {
      new IamOpenidConnectProvider(this, 'IamOpenidConnectProvider', {
        url: props.iamOpenidConnectProvider.url,
        clientIdList: props.iamOpenidConnectProvider.clientIdList,
      });
    }

    if (props.iamRole) {
      const iamRole = new IamRole(this, 'IamRole', {
        name: props.iamRole.name,
        providerUrl: props.iamRole.providerUrl,
        awsId: props.iamRole.awsId,
        githubOrganization: props.iamRole.githubOrganization,
        githubRepository: props.iamRole.githubRepository,
      });

      if (props.iamRolePolicyAttachment) {
        new IamRolePolicyAttachment(this, 'IamRolePolicyAttachment', {
          role: iamRole.iamRole.name,
          policyArn: 'arn:aws:iam::aws:policy/IAMReadOnlyAccess',
        });
      }
    }
  }
}
