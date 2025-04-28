import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';
import { IamGroup } from '../construct/aws/iam-group';
import { IamOpenidConnectProvider } from '../construct/aws/iam-openid-connect-provider';
import { IamRole } from '../construct/aws/iam-role';
import { IamRolePolicyAttachment } from '../construct/aws/iam-role-policy-attachment';
import { LambdaFunction } from '../construct/aws/lambda-function';
import { getRandomIdentifier, createBackend } from '../utils';
import { createHash } from 'crypto';
import { readFileSync } from 'fs';

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
  lambdaFunction?: {
    name: string;
    handler: string;
    runtime: string;
    fileName: string;
  };
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
  lambdaFunction: {
    name: `Dev-AwsPlaygroundFunction-${getRandomIdentifier('Dev-AwsPlaygroundFunction')}`,
    handler: 'main.handler',
    runtime: 'python3.10',
    fileName: 'lambda.zip',
  },
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
      const iamRole = new IamRole(this, `IamRole-${props.iamRole.name}`, {
        name: props.iamRole.name,
        assumeRolePolicy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: 'sts:AssumeRoleWithWebIdentity',
              Principal: {
                Federated: `arn:aws:iam::${props.iamRole.awsId}:oidc-provider/${props.iamRole.providerUrl}`,
              },
              Condition: {
                StringLike: {
                  [`${props.iamRole.providerUrl}:sub`]: `repo:${props.iamRole.githubOrganization}/${props.iamRole.githubRepository}:*`,
                },
              },
            },
          ],
        }),
      });

      if (props.iamRolePolicyAttachment) {
        new IamRolePolicyAttachment(this, 'IamRolePolicyAttachment', {
          role: iamRole.iamRole.name,
          policyArn: 'arn:aws:iam::aws:policy/IAMReadOnlyAccess',
        });
      }
    }

    if (props.lambdaFunction) {
      const iamRole = new IamRole(
        this,
        `IamRole-${props.lambdaFunction.name}`,
        {
          name: `LambdaFunctionRole-${getRandomIdentifier('LambdaFunctionRole')}`,
          assumeRolePolicy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: 'sts:AssumeRole',
                Principal: {
                  Service: 'lambda.amazonaws.com',
                },
                Sid: '',
              },
            ],
          }),
        },
      );

      new LambdaFunction(this, 'LambdaFunction', {
        name: props.lambdaFunction.name,
        handler: props.lambdaFunction.handler,
        runtime: props.lambdaFunction.runtime,
        fileName: props.lambdaFunction.fileName,
        sourceCodeHash: createHash('sha256')
          .update(readFileSync(props.lambdaFunction.fileName))
          .digest('hex'),
        role: iamRole.iamRole.arn,
      });
    }
  }
}
