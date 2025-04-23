import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-aws';
import { IamGroup } from '../construct/aws/iam-group';
import { getRandomIdentifier, createBackend } from '../utils';

export interface AwsPlaygroundStackProps {
  name: string;
  region: string;
  iamGroup?: {
    groupName: string;
  };
}

export const devAwsPlaygroundStackProps: AwsPlaygroundStackProps = {
  name: `Dev-AwsPlaygroundStack-${getRandomIdentifier('Dev-AwsPlaygroundStack')}`,
  region: 'ap-northeast-1',
  iamGroup: {
    groupName: `Dev-AwsPlaygroundGroup-${getRandomIdentifier('Dev-AwsPlaygroundGroup')}`,
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
  }
}
