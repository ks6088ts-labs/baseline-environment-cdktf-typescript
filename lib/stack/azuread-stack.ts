import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-azuread';
import { Group } from '../construct/azuread/group';
import { getRandomIdentifier, createBackend } from '../utils';

export interface AzureadStackProps {
  groupName: string;
}

export const devAzureadStackProps: AzureadStackProps = {
  groupName: `Dev-AzureadStack-${getRandomIdentifier('Dev-AzureadStack')}`,
};

export const prodAzureadStackProps: AzureadStackProps = {
  groupName: `Prod-AzureadStack-${getRandomIdentifier('Prod-AzureadStack')}`,
};

export class AzureadStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AzureadStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.AzureadProvider(this, 'azuread', {});

    // Resources
    new Group(this, 'Group', {
      name: props.groupName,
    });
  }
}
