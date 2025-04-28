import { Construct } from 'constructs';
import { TerraformStack } from 'cdktf';
import { provider } from '@cdktf/provider-azuread';
import { Group } from '../construct/azuread/group';
import { createBackend } from '../utils';

export interface AzureadStackProps {
  group?: {
    name: string;
    description?: string;
  };
}

export const devAzureadStackProps: AzureadStackProps = {
  group: {
    name: 'dev-developers',
    description: 'Developers group for dev environment',
  },
};

export const prodAzureadStackProps: AzureadStackProps = {};

export class AzureadStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: AzureadStackProps) {
    super(scope, id);

    // Backend
    createBackend(this, id);

    // Providers
    new provider.AzureadProvider(this, 'azuread', {});

    // Resources
    if (props.group) {
      new Group(this, 'Group', {
        name: props.group.name,
        description: props.group.description,
      });
    }
  }
}
