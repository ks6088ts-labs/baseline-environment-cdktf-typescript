import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-azuread';
import { Group } from '../construct/azuread/group';
import { getRandomIdentifier } from '../utils';

export interface AzureadStackProps {
  groupName: string;
}

export const devAzureadStackProps: AzureadStackProps = {
  groupName: `Dev-Group-${getRandomIdentifier('Dev-Group')}`,
};

export const prodAzureadStackProps: AzureadStackProps = {
  groupName: `Prod-Group-${getRandomIdentifier('Prod-Group')}`,
};

export class AzureadStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AzureadStackProps) {
    super(scope, id);

    // Providers
    new provider.AzureadProvider(this, 'azuread', {});

    // Resources
    new Group(this, 'Group', {
      name: props.groupName,
    });
  }
}
